const mongoose = require('mongoose')

const staffMonitoringSchema = new mongoose.Schema({
    salary: { type: Number },
}, { timestamps: true })

const inventoryStaffSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, 'staffname is required']
    },
    role:
    {
        type: String,
        require: [true, 'staffRole is required']
    },
    salary:
    {
        type: Number,
        require: [true, 'staffSalary is required']
    },
    email:
    {
        type: String,
        lowercase: true,
    },
    staffPresent: [staffMonitoringSchema],
    staffAbsent: [staffMonitoringSchema]

}, { timestamps: true })

const wholeStaffSchema = new mongoose.Schema(
    {
        storeId:
        {
            type: String,
            require: [true, 'storeId is required']
        },
        wholeStaffData: [inventoryStaffSchema],
    },
    {
        timestamps: true
    }
)

const InventoryStaff = mongoose.model('inventoryStaff', wholeStaffSchema)

module.exports = InventoryStaff 
