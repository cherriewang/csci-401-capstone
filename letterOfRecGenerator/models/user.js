var db = require('../db');
var Form = require("./form");
var Template = require("./template");
var Email = require("./email");

var Schema = db.Schema;

var UserSchema = new Schema({
    id: String,
    displayName: String,
    accessToken: String,
    templates: [Template.schema],
    deactivatedTemplates: [Template.schema],
    deactivatedEmailTemplates: [Email.schema],
    emailTemplates: [Email.schema],
    forms: [{
        type: db.Schema.Types.ObjectId,
        ref: 'Form'
    }],
    deactivatedForms: [{
        type: db.Schema.Types.ObjectId,
        ref: 'Form'
    }],
    emailhistory: [Email.schema]
});

UserSchema.statics.findUser = function (id, cb) {
    db.model('User').findOne({'id': id}, function (err, user) {
        cb(err, user);
    });
};

UserSchema.statics.createUser = function (id, cb) {
    User.create({id: id}, cb);
};

UserSchema.statics.findOrCreate = function (id, cb) {
    UserSchema.statics.findUser(id, function (err, user) {
        if (!user) {
            UserSchema.statics.createUser(id, cb);
        } else {
            cb(err, user);
        }
    });
};

UserSchema.methods.addTemplate = function (template, cb) {
    this.templates.push(template);
    var newTemplate = this.templates[this.templates.length - 1];
    this.save(function (err) {
        cb(err, newTemplate.getId());
    })
};

UserSchema.methods.addEmailHistory = function (email, cb) {
    this.emailhistory.push(email);
    var newTemplate = this.emailhistory[this.emailhistory.length - 1];
    this.save(function (err, id) {
        cb(err, newTemplate.getId());
    })
};

// UserSchema.methods.findEmail = function (email, cb) {
//     var user = this;
//     User.find({
//         "id": user.id,
//         "emailTemplates.title": email.title}, function (err, result) {

//             if(result.length != 0){
//                 User.findOneAndUpdate({
//                     "id": user.id,
//                     "emailTemplates.title": email.title
//                 }, {
//                     "$set": {
//                         "emailTemplates.$.active": true
//                     }
//                 });
//             }

//             cb(err, result);
//     });
// };


// UserSchema.methods.FindOrAddEmailTemplate = function (email, cb) {
//     let email_ = email;
//     console.log(email);
//     UserSchema.methods.findEmail(email, function (err, result) {
//         console.log(result);
//         if (result.length == 0) {
//             UserSchema.methods.addEmailTemplate(email_, cb);
//         } else {
//             cb(err, email);
//         }
//     });
// };


UserSchema.methods.addEmailTemplate = function (email, cb) {
    this.emailTemplates.push(email);
    var newTemplate = this.emailTemplates[this.emailTemplates.length - 1];
    this.save(function (err, id) {
        cb(err, newTemplate.getId());
    })
};

// UserSchema.methods.FindOrAddEmailTemplate = function (email, cb) {
//     var user = this;
//     console.log(email);
//     // if email title exist in the database set active = true 
//     User.find({
//         "id": user.id,
//         "emailTemplates.title": email.title}, function (err, result) {
//             if(result.length != 0){
//                 User.findOneAndUpdate({
//                     "id": user.id,
//                     "emailTemplates.title": email.title
//                 }, {
//                     "$set": {
//                         "emailTemplates.$.active": true
//                     }
//                 });
//             }else{
//                 UserSchema.methods.addEmailTemplate(email, cb);
//             }
//     });
// };

UserSchema.methods.updateEmailTemplate = function (id, email, cb) {
    var user = this;
    var updatedTemplate = this.emailTemplates.id(id);

    updatedTemplate.title = email.title;
    updatedTemplate.subject = email.subject;
    updatedTemplate.body_text = email.body_text;

    User.findOneAndUpdate({
        "id": user.id,
        "emailTemplates._id": id
    }, {
        "$set": {
            "emailTemplates.$": updatedTemplate
        }
    }, function (err, user) {
        cb(err);
    });
};

UserSchema.methods.updateTemplate = function (id, template, cb) {
    var user = this;
    var updatedTemplate = this.templates.id(id);

    updatedTemplate.name = template.name;
    updatedTemplate.text = template.text;
    updatedTemplate.questions = template.questions;
    updatedTemplate.letterheadImg = template.letterheadImg;
    updatedTemplate.footerImg = template.footerImg;
    updatedTemplate.optional = template.optional;

    User.findOneAndUpdate({
        "id": user.id,
        "templates._id": id
    }, {
        "$set": {
            "templates.$": updatedTemplate
        }
    }, function (err, user) {
        cb(err, template);
    });
};

UserSchema.methods.getTemplates = function () {
    return this.templates;
};

UserSchema.methods.getDeactivatedTemplates = function () {
    return this.deactivatedTemplates;
};

UserSchema.methods.getDeactivatedEmailTemplates = function () {
    return this.deactivatedEmailTemplates;
};

UserSchema.methods.getTemplate = function (id) {
    return this.templates.id(id);
};

UserSchema.methods.getDeactivatedTemplate = function (id) {
    return this.deactivatedTemplates.id(id);
};

UserSchema.methods.getDeactivatedEmailTemplate = function (id) {
    return this.deactivatedEmailTemplates.id(id);
};

UserSchema.methods.getEmailTemplates = function () {
    return this.emailTemplates;
};

UserSchema.methods.getEmailTemplate = function (id) {
    return this.emailTemplates.id(id);
};

UserSchema.methods.getEmailHistory = function () {
    return this.emailhistory;
};

UserSchema.methods.getAnEmailHistory = function (id) {
    return this.emailhistory.id(id);
};

/* This removes a specified template from templates array
and moves it to deactivatedTemplates array */
UserSchema.methods.deactivateTemplate = function (id, cb) {
    this.deactivatedTemplates.push(this.getTemplate(id));
    this.templates.pull(this.getTemplate(id));
    this.save(cb);
};

UserSchema.methods.activateTemplate = function (id, cb) {
    this.templates.push(this.getDeactivatedTemplate(id));
    this.deactivatedTemplates.pull(this.getDeactivatedTemplate(id));
    this.save(cb);
};

UserSchema.methods.deactivateEmailTemplate = function (id, cb) {
    this.deactivatedEmailTemplates.push(this.getEmailTemplate(id));
    this.emailTemplates.pull(this.getEmailTemplate(id));
    this.save(cb);
};

UserSchema.methods.activateEmailTemplate = function (id, cb) {
    this.emailTemplates.push(this.getDeactivatedEmailTemplate(id));
    this.deactivatedEmailTemplates.pull(this.getDeactivatedEmailTemplate(id));
    this.save(cb);
};

// UserSchema.methods.removeEmailTemplate = function (id, cb) {
    
    // var user = this;
    // User.findOneAndUpdate({
    //     "id": user.id,
    //     "emailTemplates._id": id
    // }, {
    //     "$set": {
    //         "emailTemplates.$.active": false
    //     }
    // }, function (err, user) {
    //     cb(err);
    // });
// };

UserSchema.methods.addForm = function (form, cb) {
    this.forms.push(form._id);
    this.save(cb);
};

UserSchema.methods.getForms = function (cb) {
    // try getting all forms under this user id
    User.findOne({id: this.id}).populate('forms').exec(function (err, user) {
        cb(err, user.forms);
    })
};

UserSchema.methods.getForm = function (id, cb) {
    User.findOne({id: this.id}).populate({
        path: 'forms',
        match: {_id: id}
    }).exec(function (err, user) {
        if (user.forms.length != 1) {
            console.log('error');
        } else {
            cb(err, user.forms[0]);
        }
    })
};

// UserSchema.methods.addEmailHistory_Form = function (id, email, cb) {
//     User.findOneAndUpdate({id: this.id}).populate({
//         path: 'forms',
//         match: {_id: id}
//     }).exec(function (err, user) {
//         if (user.forms.length != 1) {
//             console.log('error');
//         } else {
//             // cb(err, user.forms[0]);
//             // user.forms[0]
//             this.emailhistory.push(email);
//             var newTemplate = this.emailhistory[this.emailhistory.length - 1];
//             user.forms[0].save(function (err, id) {
//                 cb(err, newTemplate.getId());
//             })
//         }
//     })

// };

UserSchema.methods.getDeactivatedForms = function (cb) {
    // try getting all forms under this user id
    User.findOne({id: this.id}).populate('deactivatedForms').exec(function (err, user) {
        cb(err, user.deactivatedForms);
    })
};

UserSchema.methods.getDeactivatedForm = function (id, cb) {
    User.findOne({id: this.id}).populate({
        path: 'deactivatedForms',
        match: {_id: id}
    }).exec(function (err, user) {
        if (user.forms.length != 1) {
            console.log('error');
        } else {
            cb(err, user.deactivatedForms[0]);
        }
    })
};

UserSchema.methods.removeForm = function (id, cb) {
    this.forms.pull(id);
    this.deactivatedForms.push(id);
    this.save(cb);
};

var User = db.model('User', UserSchema);

module.exports = User;