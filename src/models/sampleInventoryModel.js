const mongoose = require('mongoose')
const Schema = mongoose.Schema

const historySchema = new mongoose.Schema
    ({
        productName:
        {
            type: String,
            require: [true, 'product name is required']
        },
        quantity:
        {
            type: Number,
            require: [true, 'product quantity is required']
        },
        quantityType:
        {
            type: String,
            require: [true, 'product quantity type is required']
        },
        price:
        {
            type: Number,
            require: [true, 'product price is required']
        },
    }, { timestamps: true })

const inventoryStore = {
    productName:
    {
        type: String,
        require: [true, 'product name is required']
    },
    quantity:
    {
        type: Number,
        require: [true, 'product quantity is required']
    },
    quantityType:
    {
        type: String,
        require: [true, 'product quantity type is required']
    },
    price:
    {
        type: Number,
        require: [true, 'product price is required']
    },
    productCategory:
    {
        type: String,
        require: [true, 'product category is required'],
    },
    stockHistory: [historySchema],
    createdAt:
    {
        type: String,
        require: [false]
    }
}


const inventorySchema = new mongoose.Schema({
    storeId: { type: String, require: true },
    InventoryData: [inventoryStore]
}, { timestamps: true })


const Inventory = mongoose.model('sampleInventory', inventorySchema)

module.exports = Inventory