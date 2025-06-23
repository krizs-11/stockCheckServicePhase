const express = require('express')
const router = express.Router()

const Staff = require('../models/staffModel')
const { checkStaffExist, checkStoreExist, checkUserExist, validateStaff, alreadyEntryExist } = require('../middleWare/inventoryMiddleWare')
const { addStoreStaff, getAllStoreStaff, getOneStoreStaffDetails, updateStoreStaff, updateStaffPresent, updateStaffAbsent, deleteStoreStaff } = require('../controller/staffController');

// this method is used to add new staff

router.post('/staff/:id', checkUserExist, validateStaff, addStoreStaff)
// this method is used to fetcth selected store of the staff 

router.get('/staff/:id', checkStoreExist, getAllStoreStaff)

router.get('/staff/:id/:staffId', checkStaffExist, getOneStoreStaffDetails)

// this method is used to update the staff

router.put('/staff/:id/:staffId', checkStaffExist, validateStaff, updateStoreStaff)
// this method is used update staffPresent monitoring

router.put('/staffPresent/:id/:staffId', checkStaffExist, alreadyEntryExist, updateStaffPresent)

// this method is used to update staffAbsent monitoring

router.put('/staffAbsent/:id/:staffId', checkStaffExist, alreadyEntryExist, updateStaffAbsent)

// this method is used to delete the staff

router.delete('/staff/:id/:staffId', checkStaffExist, deleteStoreStaff)

// thsi method is used to fetch  selected store of the staff present absent salary monitoring data

router.get('/staffTotal/total/:id', checkUserExist, async (req, res) => {
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

})


module.exports = router
