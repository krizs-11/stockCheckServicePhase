
const Sale = require('../models/dialySaleModel')
const { commonSort, commonRange } = require('../../common/commonSort')



const addNewSale = async (req, res) => {
    try {
        const findStore = await Sale.find({ storeId: req.params.id })
        if (findStore.length > 0) {
            const updateSaleLogs = findStore[0]
            updateSaleLogs.saleMonitor.push({ todaySaleAmount: req.body.amount })
            const saveLogs = await updateSaleLogs.save({ new: true })
            res.json({ messsage: "new sale logs added succesfully", count: saveLogs.length, data: saveLogs, success: true })
        }
        else {
            const createNewSale = new Sale({
                storeId: req.params.id,
                saleMonitor: [{
                    todaySaleAmount: req.body.amount
                }]
            })
            const updateTotalSale = await createNewSale.save()
            res.json({ message: "new sale logs added successfully", count: updateTotalSale.length, data: updateTotalSale, success: true })
        }
    }
    catch (error) {
        console.log("inside of the first post");
        res.status(404).json({ message: error })
    }

}

const updateOneSale = async (req, res) => {
    try {
        const findStore = await Sale.find({ storeId: req.params.id })
        if (findStore.length > 0) {
            const updateSaleLogs = findStore[0]
            updateSaleLogs.saleMonitor.forEach((logs) => {
                if (logs.id === req.params.saleId) {
                    logs.todaySaleAmount = req.body.amount
                }
            })
            await updateSaleLogs.save({ new: true })
            res.json({ message: "sale logs updated successfully", success: true })
        }
        else {
            res.status(401).json({ message: "unauthorized error caught invalid storeId" })
        }
    }
    catch (error) {
        res.status(500).json({ error: error })
    }

}

const deleteOneSale = async (req, res) => {
    try {
        const findStore = await Sale.find({ storeId: req.params.id })
        if (findStore.length > 0) {
            const deleteLogs = findStore[0]
            const filterdSales = deleteLogs.saleMonitor.filter((i) => i.id !== req.params.saleId)
            deleteLogs.saleMonitor = filterdSales
            await deleteLogs.save({ new: true })
            res.json({ message: "sale log deleted successfully", success: true })
        }
        else {
            res.json({ message: "invalid log id", success: false })
        }
    }
    catch (error) {
        res.status(404).json({ message: error })

    }
}

const getOneStoreSales = async (req, res) => {
    try {
        const { from = '', to = '', sort = '', offset = 0, limit = 0 } = req.query
        console.log("inside of the sale", from, sort, to);
        const findStore = await Sale.find({ storeId: req.params.id })
        let findAllSaleLogs = findStore[0].saleMonitor
        if (from.trim() != '' && to.trim() != '') {
            findAllSaleLogs = await commonRange(findAllSaleLogs, from, to)
        }
        if (sort.trim() != '') {
            if (sort == 'OLD' || sort == 'NEW') {
                console.log("inside of the sort method", sort);
                findAllSaleLogs = await commonSort(findAllSaleLogs, 'createdat', sort)
            }
        }

        if (limit) {
            if (offset <= findAllSaleLogs.length) {
                let skip = parseInt(offset, 10)
                let lim = parseInt(limit, 10)
                findAllSaleLogs = findAllSaleLogs.slice(skip, skip + lim)
            }
            else {
                findAllSaleLogs = []
            }
        }
        if (findAllSaleLogs.length > 0) {
            findAllSaleLogs = findAllSaleLogs.map((values) => ({
                id: values._id,
                todaySaleAmount: values.todaySaleAmount,
                createdAt: values.createdAt,
                updatedAt: values.updatedAt
            }))

            res.json({
                message: "sale logs data fetched succesfully",
                count: (from && to) ? findAllSaleLogs.length : findStore[0].saleMonitor.length,
                saleLogs: findAllSaleLogs,
                success: true
            })
        }
        else {
            res.json({ message: "sale logs data fetched succesfully", saleLogs: findAllSaleLogs, success: true, count: 0 })
        }

    }
    catch (error) {
        res.json({ message: error })
    }
}

const updateOldSales = async (req, res) => {
    try {

        const findStore = await Sale.find({ storeId: req.params.id })
        if (findStore.length > 0) {
            const updateSaleLogs = findStore[0]
            updateSaleLogs.saleMonitor.push({ todaySaleAmount: req.body.amount, createdAt: new Date(req.body.missedDate) })
            const saveLogs = await updateSaleLogs.save({ new: true })
            res.json({ messsage: "new sale logs added succesfully", count: saveLogs.length, data: saveLogs, success: true })
        }
    }
    catch (error) {
        console.log("-=-=-=-=-=-rwequest", req.body.missedDate);
        res.status(404).json({ message: error })
    }

}

const getOneSales = async (req, res) => {
    try {
        const findStore = await Sale.find({ storeId: req.params.id })
        if (findStore.length > 0) {
            console.log("inside of the sale one");
            const findSelectedSale = findStore[0].saleMonitor.filter((i) => i.id === req.params.saleId)
            res.json({ message: "single sale data fetched successfully", success: true, saleDetails: findSelectedSale[0] })
        }
    }
    catch (error) {
        res.json({ message: "there was an error", success: false, saleDetails: null })
    }

}


module.exports = { addNewSale, updateOneSale, deleteOneSale, getOneStoreSales, updateOldSales, getOneSales }