const mongoose = require('mongoose')


const signInSchema = new mongoose.Schema({
    fcmToken: { require: true, type: String },
    isActive: { require: true, type: Boolean },
    storeAccessId: { require: true, type: String },
    deviceName: { type: String }
}, { timestamps: true })

const signInUsers = mongoose.model('signInUsersData', signInSchema)

module.exports = signInUsers