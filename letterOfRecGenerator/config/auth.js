var {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var GOOGLE_CLIENT_ID = "468934162681-cbfmk6ung8pm2jaqsf68r9e24vb888j5.apps.googleusercontent.com";
var GOOGLE_CLIENT_SECRET = "5BktU-GsMF8nf-SFmQFD7vSJ";
var GOOGLE_CALLBACK = 'http://localhost:3000/auth/google/callback';

var oauth2Client = new OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK);

// set auth as a global default
google.options({
    auth: oauth2Client
});

module.exports = {
    client: oauth2Client,
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    clientCallback: GOOGLE_CALLBACK
};