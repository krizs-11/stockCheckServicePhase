const express = require('express')
const mongoose = require('mongoose')
require("dotenv").config()
const port = process.env.PORT;
const fs = require("fs")
const cors = require('cors')
require("./src/notifications/notificationScheluder")

const iventoryRouter = require('./src/routers/inventoryRouter')
const authenticationRouter = require('./src/routers/authentication')
const staffRouter = require('./src/routers/staffRouter')
const saleRouter = require('./src/routers/saleRouter')

const firebase = require('./src/fireBase/index')


const { validateToken } = require('./src/middleWare/inventoryMiddleWare')

const app = express()

mongoose.connect(process?.env?.URL, {
}).then(() => {
    console.log("db is connected");
})


app.use(cors());

app.use(express.json())

firebase.messaging()

fs.mkdir('uploads', { recursive: true }, (err) => {
    if (err) {
        console.error('Error creating folder:', err);
    } else {
        console.log('Folder created successfully!');
    }
});


app.use('/shop', validateToken, iventoryRouter)

app.use('/auth', authenticationRouter)

app.use('/shop', validateToken, staffRouter)

app.use('/shop', validateToken, saleRouter)

app.use("/*", (req, res) => {
    return res.status(404).json({ message: 'forbidden , invalid data/ payload' })
})

app.listen(port, function () {
    console.log(`server started on ${port}`);
})

