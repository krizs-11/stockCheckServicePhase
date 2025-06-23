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
// this method is used to post the  user is already exist 

// router.post('/signIn', async (req, res) => {
//     try {
//         const userDb = await signUp.find({ email: req.body.email })
//         if (userDb.length > 0) {
//             let { name, token } = req.body
//             const data = await req.body.password;
//             const hashedPassword = userDb[0].password;
//             if (data && hashedPassword) {
//                 bcrypt.compare(data, hashedPassword, async function (err, result) {
//                     if (err) {
//                         return res.json({ "message": `Error comparing passwords: ${err.message}`, succes: false });
//                     }
//                     if (result) {
//                         const response = userDb.map(user => {
//                             // Create a copy of the user object to avoid mutating the original
//                             const userWithoutPassword = { ...user._doc };
//                             userWithoutPassword.id = userWithoutPassword._id
//                             // Delete the password field from the copied object
//                             delete userWithoutPassword.password;
//                             delete userWithoutPassword._id
//                             delete userWithoutPassword.__v
//                             return userWithoutPassword;
//                         });
//                         // console.log("response---->", response);

//                         const accessToken = jwt.sign(req.body, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRATION }
//                         )

//                         if (name != '' || token.trim() != '') {
//                             const signInDB = await signInUsers.find({ fcmToken: token })
//                             if (signInDB.length > 0) {
//                                 await signInUsers.findByIdAndUpdate(
//                                     signInDB[0]._id,
//                                     {
//                                         isActive: true
//                                     }, { new: true })
//                             }
//                             else {
//                                 const newUserSigin = new signInUsers(
//                                     {
//                                         deviceName: name ? name : '',
//                                         fcmToken: token ? token : '',
//                                         storeAccessId: response[0]?.id,
//                                         isActive: true
//                                     }
//                                 )
//                                 await newUserSigin.save()
//                             }
//                         }


//                         res.json({ "message": "Login successfully", success: true, "userCrendentials": response, accessToken: accessToken });
//                     }
//                     else {
//                         res.json({ "message": "Password is incorrect", success: false });
//                     }
//                 });
//             }
//         } else {
//             res.json({ "message": "User not found", success: false });
//         }
//     }
//     catch (error) {
//         res.status(401).json({ "message": "User not found", success: false, error: error });
//     }

// })
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


// router.put('/updateUser/:id', validateToken, checkUserExist, async (req, res) => {
//     try {
//         const { email, name, storeName, productCategory, staffCategory, phoneNumber } = req.body;

//         // Find user manually by ID (converted to string for comparison)
//         const allUsers = await signUp.find();
//         const user = allUsers.find(i => i._id.toString() === req.params.id);

//         if (!user) {
//             return res.status(404).json({ message: "User not found", success: false });
//         }

//         // Manually update fields
//         user.email = email || user.email;
//         user.name = name || user.name;
//         user.storeName = storeName || user.storeName;
//         user.productCategory = productCategory || user.productCategory;
//         user.staffCategory = staffCategory || user.staffCategory;
//         user.phoneNumber = phoneNumber || user.phoneNumber;

//         // Save the changes
//         await user.save();

//         res.json({ message: "User updated successfully", success: true, userId: user._id });

//     } catch (error) {
//         console.error("Update error:", error);
//         res.status(500).json({ message: error.message });
//     }
// });


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
