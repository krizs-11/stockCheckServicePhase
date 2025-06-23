const express = require('express')
const router = express.Router()
const { checkStoreExist, checkProductExist, checkUserExist, validateProducts } = require('../middleWare/inventoryMiddleWare')
const { addNewStock, getAllStock, getOneStock, updateOneStockDetails, deleteOneStock, totalStoreExpenditure, storeInvoice, dashboardGraphData, userHistoryData, dashboardDetails } = require('../controller/inventoryController');


// this method used to  post  the data separated user

router.post('/newstock/:id', checkUserExist, validateProducts, addNewStock)
// this method used to  getall  the data separated user

router.get('/newstock/:id', checkStoreExist, getAllStock)
// this method used to  get the selected data separated user

router.get('/newstock/:id/:productId', checkProductExist, getOneStock)
// this method used to  update the selected data separated user

router.put('/newstock/:id/:productId', checkProductExist, validateProducts, updateOneStockDetails)
// this method used to  delete the selected data separated user

router.delete('/newstock/:id/:productId', checkProductExist, deleteOneStock)

// get and give the total value for the product price
router.get('/total/:id', checkStoreExist, totalStoreExpenditure)

router.post('/order/invoice', storeInvoice)

router.get('/dashboard/info/:id', checkStoreExist, dashboardDetails)

router.get('/graph/:id', checkStoreExist, dashboardGraphData)

router.get('/loginHistory/:id', checkStoreExist, userHistoryData)


module.exports = router
