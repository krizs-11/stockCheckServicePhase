const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const mongoose = require("mongoose");

const nodemailer = require('nodemailer');


const signUp = require('../models/userInventorySignUpModel')
const otpVerfication = require('../models/otpModel')
const { validateToken, checkUserExist, validateUser } = require('../middleWare/inventoryMiddleWare')
const { emailTemplate, OtpTemplate } = require('../emailTemplate/email')
const signInUsers = require('../models/userSignInModel')
const { signInUser, authAddUserData, allStoreUsers, updateUser, verifyUser, verifyOtp, updatePassword, getOneStore } = require('../controller/authcontroller')


// this method is used to post the new user

router.post('/signUp', validateUser, authAddUserData)

router.post('/signIn', signInUser)

// this method is used to getAlluser of the inventory

router.get('/getAllUser', allStoreUsers)

//  this method is used to update the user
router.put('/updateUser/:id', validateToken, checkUserExist, updateUser)

// this method is used to update and verify the user exist or not
router.post('/forgetPassword', verifyUser)

// this method is used to 
router.post('/verifyOtp', verifyOtp)


router.put('/updatePassword', updatePassword)


router.get('/user/:id', validateToken, checkUserExist, getOneStore)


router.put('/logout/:id', validateToken, checkUserExist, async (req, res) => {
    try {
        let { token } = req?.body
        if (token) {
            const signInDB = await signInUsers.find({ fcmToken: token })
            if (signInDB.length > 0) {
                await signInUsers.findByIdAndUpdate(signInDB[0]._id, { isActive: false }, { new: true })
                res.json({ message: 'user logged out successfully', success: true })
            }
            else {
                res.json({ message: 'something went wrong', success: false })
            }
        }
        else {
            res.json({ message: 'something went wrong', error: 'required field was missing' })
        }
    }
    catch (error) {
        res.json({ error: error, success: false })
    }
})


module.exports = router
