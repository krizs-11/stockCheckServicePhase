const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
function generateId(length = 4) {
    const min = Math.pow(10, length - 1); // Minimum value (e.g., 1000 for 4-digit)
    const max = Math.pow(10, length) - 1; // Maximum value (e.g., 9999 for 4-digit)
    return (Math.floor(Math.random() * (max - min + 1)) + min).toString(); // Random number as string
}

const signUpSchema = new mongoose.Schema({
    customId: {
        type: Number,
        unique: true,
        immutable: true, // <--- prevents changes after creation
        default: function () {
            // Generate 4-digit number + short UUID part (or timestamp)
            const random4 = Math.floor(1000 + Math.random() * 9000); // e.g. 4729
            // const shortUUID = Math.random().toString(36).substr(2, 4); // e.g. 'k9sj'
            return random4; // e.g. "4729-k9sj"
        }
    },
    email:
    {
        type: String,
        require: [true, 'email is required'],
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    name:
    {
        type: String,
        require: [true, 'name is required'],
        minlength: [3, 'name must be at least 3 characters long']
    },
    password:
    {
        type: String,
        require: [true, 'password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    phoneNumber:
    {
        type: Number,
        require: [true, 'phoneNumber is required'],
        validate: {
            validator: function (v) {
                return /^\d{10}$/.test(v); // assuming a 10-digit phone number
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    storeName:
    {
        type: String,
        require: [true, 'storeName is required'],
        minlength: [3, 'storeName must be at least 3 characters long']
    },
    productCategory: {
        type: [String],
        require: [true, 'productCategory is required'],
    },
    staffCategory:
    {
        type: [String],
        require: [true, 'staffCategory is required']
    },
    otpVerficationId:
    {
        type: mongoose.Schema.ObjectId
    }
},
    // { _id: false }
)

signUpSchema.pre('save', async function (next) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt)
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

signUpSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error(error);
    }
};


const signUp = mongoose.model('inventoryUserSignUp', signUpSchema)

module.exports = signUp
