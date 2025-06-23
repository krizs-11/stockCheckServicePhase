const bcrypt = require('bcrypt')
require('dotenv').config()
const jwt = require('jsonwebtoken')

const nodemailer = require('nodemailer');

const signUp = require('../models/userInventorySignUpModel')
const otpVerfication = require('../models/otpModel')
const signInUsers = require('../models/userSignInModel');
const { OtpTemplate } = require('../emailTemplate/email');



const authAddUserData = async (req, res) => {
    try {
        console.log("insidevalidate-----", req.body);

        const newInventoryUser = new signUp(
            {
                email: req.body.email,
                name: req.body.name,
                password: req.body.password,
                phoneNumber: req.body.phoneNumber,
                storeName: req.body.storeName,
                productCategory: req.body.productCategory,
                staffCategory: req.body.staffCategory
            }
        )
        const email = req.body.email
        const users = await signUp.find({
            email: email
        });

        if (users.length == 0) {
            const emailExist = await signUp.find({ email: req?.body?.email })
            if (emailExist.length == 0) {
                await newInventoryUser.save()
                res.json({ success: true, message: "new user created succesfully" })
            }
            else {
                res.json({ succes: false, userCredentials: { email: emailExist[0].email }, message: "the email was taken" })
            }
        }
        else {
            res.json({ succes: false, userCredentials: { email: email }, message: "the email was taken" })
        }
    }
    catch (error) {
        res.status(404).json({ "message": "something went wrong please check your data", success: false, error: error })
    }
}

const signInUser = async (req, res) => {
    try {
        const userDb = await signUp.find({ email: req.body.email })
        if (userDb.length > 0) {
            let { name, token } = req.body
            const data = await req.body.password;
            const hashedPassword = userDb[0].password;
            if (data && hashedPassword) {
                bcrypt.compare(data, hashedPassword, async function (err, result) {
                    if (err) {
                        return res.json({ "message": `Error comparing passwords: ${err.message}`, succes: false });
                    }
                    if (result) {
                        const response = userDb.map(user => {
                            // Create a copy of the user object to avoid mutating the original
                            const userWithoutPassword = { ...user._doc };
                            userWithoutPassword.id = userWithoutPassword._id
                            // Delete the password field from the copied object
                            delete userWithoutPassword.password;
                            delete userWithoutPassword._id
                            delete userWithoutPassword.__v
                            return userWithoutPassword;
                        });
                        // console.log("response---->", response);

                        const accessToken = jwt.sign(req.body, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRATION }
                        )

                        if (name != '' || token.trim() != '') {
                            const signInDB = await signInUsers.find({ fcmToken: token })
                            if (signInDB.length > 0) {
                                await signInUsers.findByIdAndUpdate(
                                    signInDB[0]._id,
                                    {
                                        isActive: true
                                    }, { new: true })
                            }
                            else {
                                const newUserSigin = new signInUsers(
                                    {
                                        deviceName: name ? name : '',
                                        fcmToken: token ? token : '',
                                        storeAccessId: response[0]?.id,
                                        isActive: true
                                    }
                                )
                                await newUserSigin.save()
                            }
                        }


                        res.json({ "message": "Login successfully", success: true, "userCrendentials": response, accessToken: accessToken });
                    }
                    else {
                        res.json({ "message": "Password is incorrect", success: false });
                    }
                });
            }
        } else {
            res.json({ "message": "User not found", success: false });
        }
    }
    catch (error) {
        res.status(401).json({ "message": "User not found", success: false, error: error });
    }

}

const allStoreUsers = async (req, res) => {
    try {
        const getAllUsers = await signUp.find()
        if (getAllUsers) {
            res.json({ succes: "true", count: (await signUp.find()).length, wholeCustomersData: getAllUsers })
        }
        else {
            res.json({ succes: "true", count: (await signUp.find()).length, wholeCustomersData: getAllUsers ? getAllUsers : [] })
        }
    }
    catch (error) {
        res.json({ message: "something went wrong" })
    }

}

const updateUser = async (req, res) => {
    try {
        const { email, name, storeName, productCategory, staffCategory, phoneNumber } = req.body
        let f = await signUp.find({ email: email })
        const findUser = (await signUp.find()).filter((i) => i._id == req.params.id)

        if (findUser.length > 0) {
            await signUp.findByIdAndUpdate(
                req?.params?.id,
                {
                    name: name,
                    storeName: storeName,
                    productCategory: productCategory,
                    staffCategory: staffCategory,
                    phoneNumber: phoneNumber,
                }, { new: true })
            f = f.map((item) => {
                return {
                    email,
                    name,
                    productCategory,
                    staffCategory,
                    storeName,
                    phoneNumber
                }
            })
            res.json({ message: "user updated succesfully", success: true, userId: f })
        }
        else {
            res.status(404).json({ message: "invalid user account" })
        }
    }
    catch (error) {
        res.status(500).json({ message: error })
    }
}

const verifyUser = async (req, res) => {
    try {
        console.log("inside forget passowrd-->");

        let otpData = []
        const findUser = await signUp.find({ email: req.body.email })
        const generateOtp = () => {
            const todayYear = new Date().getFullYear()
            const upto = todayYear * 2
            const otp = Math.floor(1000 + Math.random() * upto)
            return otp
        }
        const generatedOtp = generateOtp();

        if (findUser.length) {
            const alreadyUpdatePassword = await otpVerfication.find({ storeId: findUser[0]._id });

            if (alreadyUpdatePassword.length === 0) {
                try {

                    const newOtpEntry = new otpVerfication({
                        storeId: findUser[0]._id,
                        otp: [generatedOtp]
                    });
                    await signUp.findByIdAndUpdate(
                        findUser[0]._id,
                        { otpVerficationId: newOtpEntry._id },
                        { new: true }
                    );
                    await newOtpEntry.save();

                    res.json({
                        message: 'OTP added successfully',
                        success: true,
                        data: {
                            otp: generatedOtp,
                            otpId: newOtpEntry._id
                        }
                    });
                } catch (error) {
                    console.error('Error in OTP generation route:', error);
                    res.status(500).json({ message: error.message || 'Internal Server Error' });
                }
            } else {
                const existOtpId = findUser[0].otpVerficationId
                const updateOtp = await otpVerfication.findByIdAndUpdate(existOtpId, { otp: [generatedOtp] })
                const sendMailToStaff = async (staffEmail) => {
                    try {
                        let transporter = nodemailer.createTransport({
                            service: 'gmail', // Use your SMTP provider
                            auth: {
                                user: process.env.EMAIL_NAME, // Your email
                                pass: process.env.EMAIL_PASS_KEY // App password (not your personal password)
                            }
                        });

                        // Email content
                        let mailOptions = {
                            from: `"No Reply" <${process.env.EMAIL_NAME}>`, // Appears as: No Reply
                            to: staffEmail,
                            subject: 'Otp Verification',
                            html: OtpTemplate(generatedOtp)
                        };

                        // Send email
                        let info = await transporter.sendMail(mailOptions);
                        console.log('Email sent: ' + info.response);
                    } catch (error) {
                        console.error('Error sending email:', error);
                    }
                };
                await sendMailToStaff(req.body.email)

                res.json({
                    message: 'Email already verified or OTP exists',
                    success: true,
                    data: generatedOtp
                });
            }
        }
        else {
            res.json({ message: 'user does not exist', success: false })
        }

    }
    catch (error) {
        res.status(500).json({ message: error })
    }
}

const verifyOtp = async (req, res) => {
    const otpValue = req?.body?.otp
    const findUser = await signUp.find({ email: req.body.email })
    console.log("finvotp-->?", findUser);

    try {
        if (findUser.length) {
            const findOtpVerificationId = await otpVerfication.findById(findUser[0].otpVerficationId)
            if (findOtpVerificationId) {
                if (findOtpVerificationId.otp[0] == otpValue) {
                    await otpVerfication.findByIdAndUpdate(findUser[0].otpVerficationId, { otp: [] }, { new: true })
                    res.json({ success: true, message: 'otp verified successfully' })
                }
                else {
                    res.json({ success: false, message: 'missmatch otp' })
                }
            }
            else {
                res.json({ success: false, message: 'something went wrong' })
            }
        }
    }
    catch (error) {
        console.log("error in the");
        res.json({ success: false, message: error })

    }
}

const updatePassword = async (req, res) => {
    try {
        const encodedData = req?.headers?.passkey || ''
        console.log("req?.headers", req.headers?.passkey);

        const decoded = Buffer.from(encodedData, 'base64').toString('utf-8');
        const data = decoded.split(':')
        if (data.length) {
            const user = await signUp.findOne({ email: data[0] });
            if (Object.keys(user).length) {
                user.password = data[1]; // this triggers the pre('save') hook
                await user.save();
                res.json({ email: user.email, success: true });
            } else {
                res.json({ success: false, message: "User not found" });
            }
        }
        else {
            res.status({ succes: false, message: 'user not found' })
        }
    }
    catch (error) {
        res.status(500).json({ error: error, succes: false })
    }
}

const getOneStore = async (req, res) => {
    try {
        console.log("insideof the signup", typeof req.params.id);
        const findUser = (await signUp.find()).filter((i) => i._id == req.params.id)
        if (findUser) {
            let userDetails = [...findUser]
            const response = userDetails.map(user => {
                // Create a copy of the user object to avoid mutating the original
                const userWithoutPassword = { ...user._doc };
                userWithoutPassword.id = userWithoutPassword._id
                // Delete the password field from the copied object
                delete userWithoutPassword.password;
                delete userWithoutPassword._id
                delete userWithoutPassword.__v
                return userWithoutPassword;
            });



            res.json({ message: 'user details fetched succesfully', userData: response[0] })
        }
        else {
            res.json({ message: 'user details fetched succesfully', userData: [] })
        }
    }
    catch (error) {
        console.log("inside error from the getOneUser-->", error);

        res.status(500).json({ message: error })
    }


}

const userLogout = async (req, res) => {
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
}

module.exports = { authAddUserData, signInUser, allStoreUsers, updateUser, verifyUser, verifyOtp, updatePassword, getOneStore, userLogout }