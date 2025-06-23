const express = require('express')
const router = express.Router()
const { checkSaleLogExist, checkStoreExist, checkUserExist, validateSaleLogs, alreadyEnteredSale, alreadyEnteredOldSales } = require('../middleWare/inventoryMiddleWare')
const { addNewSale, updateOldSales, deleteOneSale, getOneStoreSales, getOneSales, updateOneSale } = require('../controller/saleController')

//this method is used to add the new sale to the store
router.post('/sale/:id', checkUserExist, validateSaleLogs, alreadyEnteredSale, addNewSale)

// this method is used to update the selected sale log
router.put('/sale/:id/:saleId', checkSaleLogExist, validateSaleLogs, updateOneSale)

// this method is used to delete the selected sale log

router.delete('/sale/:id/:saleId', checkSaleLogExist, deleteOneSale)
// this method is used to get selected store of the sale logs

router.get('/sale/:id', checkStoreExist, getOneStoreSales)


router.post('/sale/old/:id', checkUserExist, validateSaleLogs, alreadyEnteredOldSales, updateOldSales)


router.get('/sale/:id/:saleId', checkSaleLogExist, getOneSales)



module.exports = router