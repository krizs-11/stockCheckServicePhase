const mongoose = require('mongoose')


const otpSchema = new mongoose.Schema({
    storeId:
    {
        type: String,
    },
    otp: {
        type: [Number],
    },
})


const otpVerfication = mongoose.model('inventoryOtp', otpSchema)
module.exports = otpVerfication
