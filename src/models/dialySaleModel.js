const mongoose = require('mongoose')

const dialySaleMonitoringSchema = new mongoose.Schema
    ({
        todaySaleAmount:
        {
            type: Number,
            require: [true, 'saleAmount is required']
        }
    }, { timestamps: true })

const wholeStoreDialySale = new mongoose.Schema(
    {
        storeId:
        {
            type: String,
            require: [true, 'storeId is required']
        },
        saleMonitor: [dialySaleMonitoringSchema]
    }
)


const WholeStoreDialySale = mongoose.model('dialySale', wholeStoreDialySale)

module.exports = WholeStoreDialySale