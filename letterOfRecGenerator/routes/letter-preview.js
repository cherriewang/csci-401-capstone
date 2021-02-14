var express = require('express');
var router = express.Router();
var Form = require('../models/form');
var nodemailer = require('nodemailer');
var credentials = require('../config/auth');
var googleAuth = require('google-auth-library');
var { google } = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var letterParser = require('./letter-parser');
const HummusRecipe = require('hummus-recipe');
const fs = require('fs');
const Readable = require('stream').Readable;
const fileUpload = require('express-fileupload');

router.get('/', function (req, res, next) {
    req.user.getForm(req.query.id, function (err, form) {
        if (err) {
            console.log("get /  error in letter-preivew: " + err );
        } else {
            console.log("id when loading page? " + req.query.id);
            res.render('pages/letter-preview', {
                title: form.email,
                templates: req.user.getEmailTemplates(),
                id: req.query.id,
                form: form,
            });
        }
    });
});

router.get('/form', function (req, res, next) {
    req.user.getForm(req.query.id, function (err, form) {
        if (err) {
            console.log(err);
        } else {
            res.json(form);
        }
    });
});

router.get('/emailForm', function (req, res, next) {
    req.user.getForm(req.query.id, function (err, form) {
        if (err) {
            console.log("/form error:  "  + err);
        } else {
            res.json({
                form: form,
                id: req.query.id
            });
        }
    });
});



router.post('/save', function (req, res, next) {
    Form.completeForm(req.body.id, req.body.letter, function (err, form) {
        if (err) {
            console.log(err);
        } else {
            res.render('pages/letter-preview', {
                title: form.email,
                // templates: req.user.getEmailTemplates(),
                id: req.query.id,
                form: form,
            });
        }
    });
});

router.post('/drive', function(req,res,next) {
    var user = req.user;
    user.getForm(req.body.id, function(err, form) {
        if(err){
            console.log(err)
        } else {
            var break_lines = "<br><br><br><br><br>";
            var smaller_break_lines = "<br><br><br><br>";
            var date_raw = req.body.date;
            var actual_date = letterParser.getDate(date_raw);
            var formatted_date = break_lines + actual_date + smaller_break_lines;
            var letter = req.body.letter;
            var formatted_letter = formatted_date + letter;
            var template = form.getTemplate();
            var templateName = template.name;
            var text = letterParser.htmlstuff(formatted_letter)
            var fname = form.responses[0].response;
            var lname = form.responses[1].response;
            var length = text.length;
            console.log("Length:" + length)
            var stringWords = text.split(' ');
            console.log("WORDS:" + stringWords.length);
            var stringlen = stringWords.length;
            var firstPage = "";
            var secondPage = "";
            // If it is larger than one page break it into two
            if (stringlen > 470){
                 
                for(var i = 0; i < 470;i++){
                    firstPage += stringWords[i];
                    firstPage += " ";
                }
                console.log("First: " + firstPage);

                var remain = stringlen - 430;
                
                for(var i = 471; i < stringlen;i++){
                    secondPage += stringWords[i];
                    secondPage += " ";
                }
            }

            var headerPath = __dirname + '/uploads/' + 'uploaded.pdf';

            var outputName = templateName + "_Template_" + fname + "_" + lname + ".pdf";
            var output = __dirname + '/uploads/' + outputName;

            const HummusRecipe = require('hummus-recipe');
            const pdfDoc = new HummusRecipe(headerPath, output);
            if(stringlen > 470){
                pdfDoc
                // edit 1st page
                .editPage(1)
                .text(firstPage, 80, 85, {
                    color: '000000',
                    font: 'Times New Roman',
                    fontSize: 10,
                    align: 'left',
                    textBox: {
                        width: 480,
                        lineHeight: 12,
                        style: {
                            lineWidth: 1
                        }
                    }
                })
                .endPage()
                .editPage(2)
                .text(secondPage, 80, 75, {
                    color: '000000',
                    font: 'Times New Roman',
                    fontSize: 10,
                    align: 'left',
                    textBox: {
                        width: 480,
                        lineHeight: 12,
                        style: {
                            lineWidth: 1
                        }
                    }
                })
                .endPage()
                .endPDF();
            }
            else {
                pdfDoc
                // edit 1st page
                .editPage(1)
                .text(text, 80, 85, {
                    color: '000000',
                    font: 'Times New Roman',
                    fontSize: 10,
                    align: 'left',
                    textBox: {
                        width: 480,
                        lineHeight: 12,
                        style: {
                            lineWidth: 1
                        }
                    }
                })
                .endPage()
                .endPDF();
            }
            
            res.redirect('/recommender-dashboard');
            // headStream.on('data', function () {


            // })
        }

    })
})



module.exports = router;