// inventoryMiddleware.js

const Inventory = require('../models/sampleInventoryModel')
const Staff = require('../models/staffModel')
const SaleMonitor = require('../models/dialySaleModel')
const signUp = require('../models/userInventorySignUpModel')
const jwt = require('jsonwebtoken')
const { commonRange } = require('../../common/commonSort')


async function checkStoreExist(req, res, next) {
    try {
        const getStore = await signUp.find({ _id: req.params.id });
        console.log("yes getStore--->11", typeof req?.params?.id, getStore, req?.params?.id);
        if (!getStore) {
            return res.status(401).json({ message: 'unauthorized user', data: getStore });
        }
        next();
    } catch (err) {
        // console.error('Error checking product existence:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function checkProductExist(req, res, next) {
    try {
        console.log("inide of the checkproductexist");
        const { id, productId } = req.params
        if (id && productId) {
            const getStore = await Inventory.find({ storeId: req.params.id })
            if (!getStore.length) {
                return res.status(401).json({ message: 'unauthorized user' });
            }
            const findProduct = getStore[0].InventoryData.filter((i) => i.id === productId)
            if (findProduct.length > 0) {
                next()
            }
            else {
                return res.status(401).json({
                    message: {
                        "error": "Missing Product ID",
                        "message": "Please provide a valid product ID in the request parameters."
                    }
                });
            }
        }
        else {
            return res.status(404).json({ message: 'Invalid params/syntax' });
        }
    }
    catch (error) {
        res.status(501).json({ error: error })
    }
}

async function checkStaffExist(req, res, next) {
    try {
        console.log("inside of the checkstaffexist");
        const { id, staffId } = req.params
        if (id && staffId) {
            const getStore = await Staff.find({ storeId: req.params.id })
            if (!getStore.length) {
                return res.status(401).json({ message: 'unauthorized user' });
            }
            const findStaff = getStore[0].wholeStaffData.filter((i) => i.id === staffId)
            if (findStaff.length > 0) {
                next()
            }
            else {
                return res.status(401).json({
                    message: {
                        "error": "Missing staff ID",
                        "message": "Please provide a valid Staff ID in the request parameters."
                    }
                });
            }
        }
        else {
            return res.status(404).json({ message: 'Invalid params/syntax' });
        }
    }
    catch (error) {
        res.status(501).json({ error: error })
    }

}

async function checkSaleLogExist(req, res, next) {
    try {
        const { id, saleId } = req.params
        if (id && saleId) {
            const getStore = await SaleMonitor.find({ storeId: req.params.id })
            if (!getStore.length) {
                return res.status(401).json({ message: 'unauthorized user' });
            }
            const findSaleLog = getStore[0].saleMonitor.filter((i) => i.id === saleId)
            console.log("sale", saleId);

            if (findSaleLog.length > 0) {
                next()
            }
            else {
                return res.status(401).json({
                    message: {
                        "error": "Missing saleLog ID",
                        "message": "Please provide a valid saleLog ID in the request parameters."
                    }
                });
            }
        }
        else {
            return res.status(404).json({ message: 'Invalid params/syntax' });
        }
    }
    catch (error) {
        res.status(501).json({ error: error })
    }
}

async function checkUserExist(req, res, next) {
    try {
        const getUser = await signUp.find({ _id: req.params.id })
        if (!getUser) {
            return res.status(401).json({ message: 'unauthorized user' });
        }
        next();
    } catch (err) {
        // console.error('Error checking product existence:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

// the above middleWare are used to check if the id exist


async function validateProducts(req, res, next) {
    try {
        const { productName, quantity, quantityType, price, productCategory, } = req.body
        if (!productName || !quantity || !quantityType || !price || !productCategory) {
            return res.status(400).json({ message: 'productName, quantity, quantityType, price, productCategory all are require fields' });
        }
        next()
    }
    catch (error) {
        res.status(500).json({ error: error })
    }

}

async function validateStaff(req, res, next) {
    try {
        const { name, role, salary, email } = req.body
        if (!name || !role || !salary) {
            return res.status(400).json({ message: 'name, role, salary all are require fields' });
        }
        next()
    }
    catch (error) {
        res.status(500).json({ error: error })

    }
}

async function validateSaleLogs(req, res, next) {
    try {
        const { amount } = req.body
        if (!amount) {
            return res.status(400).json({ message: 'amount is required' });
        }
        next()


    }
    catch (error) {
        res.status(500).json({ error: error })
    }

}

async function validateUser(req, res, next) {
    try {
        console.log("inside-----9999", req.body);

        const { name, email, password, phoneNumber, storeName, productCategory, staffCategory } = req.body

        if (!name || !email || !password || !phoneNumber || !storeName || !productCategory || !staffCategory) {
            console.log("-=-=-=-",);
            return res.status(400).json({ message: 'name, email, password, phoneNumber, storeName, productCategory, staffCategory all are require fields' });
        }
        next()
    }
    catch (error) {
        res.status(500).json({ error: error })

    }
}

// the above middleWare are used to check if the required body exist or not


async function alreadyEntryExist(req, res, next) {
    try {
        const { id, staffId } = req.params
        const fieldName = req?.path?.split('/')[1]
        const findStore = await Staff.find({ storeId: id })
        const findStaff = findStore[0].wholeStaffData

        findStaff.forEach((data) => {
            if (data.id == staffId) {
                const findField = data[`${fieldName}`]
                if (findField.length > 0 && findField[findField.length - 1]) {
                    const today = new Date().toISOString().split('T')[0]
                    if (findField[findField.length - 1].createdAt.toISOString().split('T')[0] == today) {
                        return res.json({ message: `you have already entered ${fieldName}`, alreadyRegistered: true, sucess: true })
                    }
                    else {
                        next()
                    }
                }
                else {
                    next()
                }
            }
        })
    }
    catch (error) {
        res.json({ error: error })
    }

}

async function alreadyEnteredSale(req, res, next) {
    try {
        const { id } = req.params
        const findStore = await SaleMonitor.find({ storeId: id })
        const findSale = findStore[0] ? findStore[0].saleMonitor : []
        const todayDate = new Date().toISOString().split('T')[0]
        const checkSaleExist = await commonRange(findSale, todayDate, todayDate)
        if (findSale.length > 0) {
            if (checkSaleExist.length > 0) {
                return res.json({ message: `you have already entered the today sale Amount`, alreadyRegistered: true, sucess: true })
            }
            else {
                next()
            }
        }
        else {
            next()
        }
    }
    catch (error) {
        return res.status(500).json({ error })
    }

}


async function alreadyEnteredOldSales(req, res, next) {
    try {
        const { id } = req.params
        const { missedDate } = req.body
        if (missedDate) {
            const date = new Date(missedDate)
            date.setHours(12, 0, 0, 0);
            date.toISOString().split('T')[0]
            const findStore = await SaleMonitor.find({ storeId: id })
            const findSale = findStore[0] ? findStore[0].saleMonitor : []
            let findLogsExist = commonRange(findSale, date, date)
            if (findLogsExist.length > 0) {
                return res.json({ message: `you have already entered this sale Amount`, alreadyRegistered: true, sucess: true })
            }
            else {
                next()
            }
        }
        else {
            return res.json({ message: `the missed date field is required`, success: false })
        }
    }
    catch (error) {
        console.log("inside alredyentered sale middleware");
        return res.status(500).json({ error })
    }

}



// the above middleware are used to check whether the staff // sale is already registerd

async function validateToken(req, res, next) {
    try {
        const header = req?.headers?.authorization && req?.headers?.authorization

        if (!header) {
            return res.status(401).json({ message: "Access token required" })
        }
        const accessToken = header.slice(7, header?.length)
        console.log("----- accestoken", accessToken);
        console.log("----- accestoken", typeof accessToken);


        if (!accessToken) {
            return res.status(401).json({ message: "Access token required" })
        }
        jwt.verify(accessToken, process.env.JWT_SECRET_KEY, (err) => {
            if (err) {
                console.log("inside,--->", err);

                return res.status(401).send({ message: "You are unauthorized.", error: err });
            }
            next();
        }
        )
    }
    catch (error) {
        console.log("headerr", error);
        res.status(501).json({ error: error })
    }

}

// the above middleWare are used to check the token is exist

module.exports = { checkStoreExist, checkProductExist, checkStaffExist, checkSaleLogExist, checkUserExist, validateProducts, validateStaff, validateSaleLogs, alreadyEntryExist, alreadyEnteredSale, validateToken, validateUser, alreadyEnteredOldSales };
