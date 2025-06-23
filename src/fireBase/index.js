const admin = require("firebase-admin");

let serviceAccount = require('../../stockcheck.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


module.exports = admin
