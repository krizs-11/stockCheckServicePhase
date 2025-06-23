const nodemailer = require('nodemailer');
const Staff = require('../models/staffModel')
const { commonSort } = require('../../common/commonSort');
const { emailTemplate } = require('../emailTemplate/email');
require('dotenv').config()



const addStoreStaff = async (req, res) => {
    try {
        const findStoreExist = await Staff.find({ storeId: req.params.id })
        if (findStoreExist.length > 0) {
            const existStore = findStoreExist[0]
            existStore.wholeStaffData.push(req.body)
            let { name, email } = req.body
            await existStore.save({ new: true })
            console.log("above");
            const sendMailToStaff = async (staffEmail, staffName) => {
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
                        from: '"Your Company" <noreply-@gmail.com>',
                        to: staffEmail,
                        subject: 'Welcome to Our Team!',
                        // html: `<h2>Welcome, ${staffName}!</h2>
                        //        <p>We're excited to have you on board.</p>
                        //        <p>Feel free to reach out if you have any questions.</p>
                        //        <br>
                        //        <p>Best Regards,<br>Company Team</p>`
                        html: emailTemplate(staffName)
                    };

                    // Send email
                    let info = await transporter.sendMail(mailOptions);
                    console.log('Email sent: ' + info.response);
                } catch (error) {
                    console.error('Error sending email:', error);
                }
            };
            await sendMailToStaff(email, name)

            res.json({ message: "new Staff added successfully", success: true })
        }
        else {
            const StaffData = new Staff(
                {
                    storeId: req?.params?.id,
                    wholeStaffData: [{
                        name: req?.body?.name,
                        role: req?.body?.role,
                        salary: req?.body?.salary,
                    }],
                }
            )
            const datares = await StaffData.save()
            res.json({ success: true, message: "new Staff added successfully" })
        }
    }
    catch (error) {
        res.status(404).json({ message: error })
    }
}

const getAllStoreStaff = async (req, res) => {
    try {
        const { search = '', filter = '', sort = '', offset = 0, limit = 0 } = req.query
        const findStore = await Staff.find({ storeId: req.params.id })
        const today = new Date().toISOString().split('T')[0];
        if (findStore.length > 0) {
            let queryStaff = findStore[0].wholeStaffData
            if (search.trim() != '') {
                queryStaff = queryStaff.filter((findSearch) => findSearch.name.toLowerCase().includes(search.toLowerCase()))
            }
            if (filter.trim() != '') {
                queryStaff = queryStaff.filter((findCat) => findCat.role === filter)
            }
            if (sort.trim() != '') {
                if (sort == 'ASC' || sort == 'DESC') {
                    queryStaff = commonSort(queryStaff, 'name', sort)
                }
            }

            if (limit) {
                if (offset <= queryStaff.length) {
                    let skip = parseInt(offset, 10)
                    let lim = parseInt(limit, 10)
                    queryStaff = queryStaff.slice(skip, skip + lim)
                }
                else {
                    queryStaff = []
                }
            }

            if (queryStaff.length > 0) {
                queryStaff = queryStaff.map((structure) => {
                    return {
                        id: structure.id,
                        name: structure.name,
                        role: structure.role,
                        salary: structure.salary,
                        present: structure.staffPresent.length > 0 && structure?.staffPresent[structure?.staffPresent.length - 1]?.createdAt.toISOString().split('T')[0] === today ? true : false
                    };
                });
                res.json({ success: true, count: (search || filter) ? queryStaff.length : findStore[0].wholeStaffData.length, data: queryStaff, message: "All Staff data succesfully" })

            }
            if (queryStaff.length == 0) {
                res.json({ success: true, count: (search || filter) ? queryStaff.length : findStore[0].wholeStaffData.length, message: "All Staff succesfully", data: queryStaff })
            }
        }
        else {
            res.json({ success: true, data: queryStaff, message: "All Staff  datasuccesfully", data: [], count: 0 })
        }
    }
    catch (error) {
        res.json({ message: error })
    }
}

const getOneStoreStaffDetails = async (req, res) => {
    const { id, staffId } = req.params
    try {
        const findStore = await Staff.find({ storeId: id })
        if (findStore.length > 0) {
            const filterOutStaffData = findStore[0].wholeStaffData.filter((i) => i.id === staffId)
            const { id, name, salary, role, email } = filterOutStaffData[0]
            res.json({
                message: "single staff fetched succesfully",
                success: true,
                staffData: { id: id, name: name, salary: salary, role: role, email: email }
            })
        }
        else {
            res.json({ message: "staff not found", success: true })
        }
    }
    catch (error) {
        res.status(500).json({ message: "something went wrong", error: error })
    }

}

const updateStoreStaff = async (req, res) => {
    try {
        const findStore = await Staff.find({ storeId: req.params.id })
        let isEmailExist = findStore[0].wholeStaffData.filter((i) => i.email === req.body.email)
        if (isEmailExist.length > 0) {
            res.status(200).json({ success: false, data: { status: 'The email was already taken' } })
        }
        else {
            if (findStore.length > 0) {
                const findStaff = findStore[0]
                findStaff.wholeStaffData.forEach((staffData) => {
                    if (staffData.id === req.params.staffId) {
                        staffData.name = req?.body?.name ? req?.body?.name : staffData.name
                        staffData.salary = req.body.salary
                        staffData.role = req?.body?.role ? req?.body?.role : staffData.role
                    }
                })
                await findStaff.save({ new: true })
                res.json({ message: "staff Data updated successfully", success: true })
            }
            else {
                res.status(401).json({ message: "unauthorized", success: false })
            }
        }

    }
    catch (error) {
        res.status(404).json(error)
    }
}

const updateStaffPresent = async (req, res) => {
    try {
        const findStore = await Staff.find({ storeId: req.params.id })
        if (findStore.length > 0) {
            const presentStaff = findStore[0]
            presentStaff.wholeStaffData.forEach((isPresent) => {
                if (isPresent.id === req.params.staffId) {
                    let staffMonitoring = [...isPresent.staffPresent]
                    let staffMonitorExist = [...isPresent.staffAbsent]
                    if (staffMonitorExist.length > 0) {
                        const today = new Date().toISOString().split('T')[0];
                        if (staffMonitorExist[staffMonitorExist.length - 1].createdAt.toISOString().split('T')[0] === today) {
                            staffMonitorExist = staffMonitorExist.filter((i) => i.createdAt.toISOString().split('T')[0] !== today);
                            isPresent.staffAbsent = staffMonitorExist;
                        }
                    }
                    staffMonitoring.push({ salary: isPresent.salary })
                    isPresent.staffPresent = staffMonitoring
                }
            })
            const updateStaff = await presentStaff.save({ new: true })
            res.json({ message: "staff attendance calculated successfully", success: true })
        }
        else {
            res.status(401).json({ message: "no staff found", success: false })
        }
    }
    catch (error) {
        res.status(404).json({ error })
    }

}

const updateStaffAbsent = async (req, res) => {
    try {
        const findStore = await Staff.find({ storeId: req.params.id })
        if (findStore.length > 0) {
            const absentStaff = findStore[0]
            for (let entry = 0; entry < absentStaff.wholeStaffData.length; entry++) {
                if (absentStaff.wholeStaffData[entry].id === req.params.staffId) {
                    let absentStaffRecord = [...absentStaff.wholeStaffData[entry].staffAbsent]
                    let staffMonitorAlreadyExist = [...absentStaff.wholeStaffData[entry].staffPresent]
                    if (staffMonitorAlreadyExist.length > 0) {
                        const today = new Date().toISOString().split('T')[0];
                        if (staffMonitorAlreadyExist[staffMonitorAlreadyExist.length - 1].createdAt.toISOString().split('T')[0] == today) {
                            staffMonitorAlreadyExist = staffMonitorAlreadyExist.filter((i) => i.createdAt.toISOString().split('T')[0] !== today);
                            absentStaff.wholeStaffData[entry].staffPresent = staffMonitorAlreadyExist
                        }
                    }
                    absentStaffRecord.push({ salary: absentStaff.wholeStaffData[entry].salary })
                    absentStaff.wholeStaffData[entry].staffAbsent = absentStaffRecord
                }
            }
            const updateStaff = await absentStaff.save({ new: true })
            res.json({ message: "staff is today absent record sumbitted succesfully", success: true })
        }
        else {
            res.status(401).json({ message: "no staff found", success: false })
        }
    }
    catch (error) {
        res.status(404).json({ message: error })
    }

}

const deleteStoreStaff = async (req, res) => {
    try {
        const findStore = await Staff.find({ storeId: req.params.id })
        if (findStore.length > 0) {
            const deleteStaff = findStore[0]
            const updateStaff = deleteStaff.wholeStaffData.filter((i) => i.id !== req.params.staffId)
            deleteStaff.wholeStaffData = updateStaff
            await deleteStaff.save({ new: true })
            res.json({ message: "staff deleted successfully", success: true })
        }
        else {
            res.json({ message: "invalid , no staff found", success: false })
        }
    }
    catch (error) {
        res.status(404).json({ message: error })
    }

}

const storesalaryMonitor = async (req, res) => {
    try {
        const { id } = req.params
        const findStore = await Staff.find({ storeId: id })
        if (findStore.length) {
            let totalStaffAmount = findStore[0].wholeStaffData;
            totalStaffAmount = totalStaffAmount.map((staffSalary) => {
                if (staffSalary.staffPresent) {
                    return {
                        id: staffSalary.id,
                        name: staffSalary.name,
                        perDaySalary: staffSalary.salary,
                        totalDaysPresent: staffSalary.staffPresent.length,
                        totalSalary: staffSalary.staffPresent.reduce((acc, int) => acc + int.salary, 0), // Ensure reduce starts with 0
                    };
                }
                // If staffSalary.staffPresent is not defined, you might want to return something else or filter it out
                return null;
            }).filter(staff => staff !== null); // Remove null entries

            res.json({ message: "total staff logs successfully", data: totalStaffAmount, count: totalStaffAmount.length })
        }
        else {
            res.json({ message: "total staff logs successfully", data: [], count: 0 })
        }
    }
    catch (error) {
        res.json({ message: "total staff logs successfully", data: error })

    }

}


module.exports = { addStoreStaff, getAllStoreStaff, getOneStoreStaffDetails, updateStoreStaff, updateStaffPresent, updateStaffAbsent, deleteStoreStaff, storesalaryMonitor }