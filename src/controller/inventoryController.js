const express = require('express')
const puppeteer = require('puppeteer');
const fs = require("fs")
const Inventory = require('../models/sampleInventoryModel')
const Sale = require('../models/dialySaleModel')
const Staff = require('../models/staffModel')
const path = require("path")
const { commonSort, commonRange } = require('../../common/commonSort');
const signInUsers = require('../models/userSignInModel');
const signUp = require('../models/userInventorySignUpModel');
const { saleTemplate } = require('../emailTemplate/email');


const addNewStock = async (req, res) => {
    try {
        const findStoreExist = await Inventory.find({ storeId: req.params.id })

        if (findStoreExist.length > 0) {
            const storeToUpdate = findStoreExist[0]; // Reference the actual document
            // Directly modify the InventoryData array (Mongoose will handle updates)
            let addDate = { ...req?.body, createdAt: new Date().toISOString() }
            storeToUpdate.InventoryData.push(addDate);
            // Save the modified document using save()
            const updatedInventory = await storeToUpdate.save({ new: true });
            res.status(200).json({ message: "new product added successfully", success: true });
        }
        else {
            const iventoryProduct = new Inventory(
                {
                    storeId: req?.params?.id,
                    InventoryData: [{
                        productName: req?.body?.productName,
                        quantity: req?.body?.quantity,
                        quantityType: req?.body?.quantityType,
                        price: req?.body?.price,
                        productCategory: req?.body?.productCategory,
                    }],
                }
            )
            const datares = await iventoryProduct.save()
            res.json({ success: true, message: "new product added succesfully" })

        }

    }
    catch (error) {
        res.status(500).json({ message: "something went wrong" })
    }
}

const getAllStock = async (req, res) => {
    try {
        const { search = '', filter = '', limit = 0, offset = 0, sort = '' } = req.query;

        console.log("-=-=- req.parms", req.params, req.query);
        const inventoryResponse = await Inventory.find({ storeId: req.params.id })


        if (inventoryResponse.length > 0) {
            let queryResponse = inventoryResponse[0].InventoryData
            if (search.trim() != '') {
                queryResponse = queryResponse.filter(findname => findname?.productName.toLowerCase().includes(search.toLowerCase()))
            }

            if (filter.trim() != '') {
                queryResponse = queryResponse.filter((findCat) => findCat?.productCategory == filter)
            }

            if (sort && sort.trim() !== '') {
                if (sort === 'ASC' || sort === 'DESC') {
                    queryResponse = await commonSort(queryResponse, 'productName', sort)
                }
                if (sort == 'OLD' || sort == 'NEW') {
                    queryResponse = await commonSort(queryResponse, 'productName', sort)
                }
            }

            if (limit) {
                if (offset < queryResponse.length) {
                    let skip = parseInt(offset, 10)
                    let lim = parseInt(limit, 10)
                    queryResponse = queryResponse.slice(skip, skip + lim)
                }
                else {
                    queryResponse = queryResponse.slice(-limit)
                }
            }

            if (queryResponse.length > 0) {
                const formattedData = queryResponse.map((element) => {
                    if (element) {
                        const { id, productCategory, productName, price, quantity, quantityType, stockHistory } = element
                        return { id: id, productCategory: productCategory, productName: productName, price: price, quantity: quantity, quantityType: quantityType, stockHistoryExist: stockHistory.length > 0 ? true : false, stockDate: stockHistory.length > 0 ? new Date(stockHistory[stockHistory.length - 1].createdAt) : "" }
                    }
                })
                res.json({ success: true, message: "All product fetched successfully", count: (search || filter) ? queryResponse.length : inventoryResponse[0].InventoryData.length, productDetails: formattedData })
            }
            else {
                res.json({ success: true, count: 0, productDetails: queryResponse ? queryResponse : [] })
            }
        }
        else {
            res.json({ success: true, message: "All product fetched successfully", count: 0, productDetails: [] })
        }
    }
    catch (error) {
        res.status(500).json({ message: "something went wrong" })
    }
}

const getOneStock = async (req, res) => {
    try {
        const inventoryResponse = await Inventory.find({ storeId: req.params.id })
        const productId = req.params.productId
        if (inventoryResponse) {
            const filterOutData = inventoryResponse[0].InventoryData.filter((i) => i.id === productId)
            const { productCategory, productName, price, quantity, quantityType, id, stockHistory } = filterOutData[0]
            res.json({
                message: "single product fetched succesfully",
                success: true,
                inventoryData: { id: id, productName: productName, price: price, quantityType: quantityType, productCategory: productCategory, quantity: quantity, stockHistoryExist: stockHistory.length > 0 ? true : false }
            })
        }
        else {
            res.status(401).json({ message: "product not found", success: true })
        }
    }
    catch (error) {
        res.status(500).json({ message: "something went wrong", error: error })
    }
}

const updateOneStockDetails = async (req, res) => {
    try {
        const storeId = req.params.id;
        const productId = req.params.productId;

        const foundStore = await Inventory.find({
            storeId: storeId,
        });

        if (foundStore) {
            const updateStockHistory = await Inventory.find({ storeId: storeId })
            let filterOutData = updateStockHistory[0].InventoryData.filter((i) => i.id === productId)
            if (filterOutData) {
                const storeToUpdate = foundStore[0];
                let productUpdated = false; // Flag to track if product was updated
                for (const element of storeToUpdate.InventoryData) {
                    if (element.id === productId) {
                        element.productName = req.body.productName,
                            element.quantity = req.body.quantity,
                            element.quantityType = req.body.quantityType,
                            element.price = req.body.price,
                            element.productCategory = req.body.productCategory
                        element.stockHistory = [...element.stockHistory, ...filterOutData]
                        element.createdAt = new Date().toISOString()
                        // element.stockHistory = filterOutData
                        productUpdated = true;
                        break; // Exit loop after update
                    }
                }
                if (productUpdated) {
                    // Update the document using save() if a product was updated
                    await storeToUpdate.save({ new: true });
                    res.json({ message: "product updated and stored successfully", success: true });
                }
                else {
                    res.status(404).json({ message: "Product not found" });
                }

            }
        }
        else {
            res.status(404).json({ message: "invalid storeId", success: false })
        }
    }
    catch (error) {
        res.status(500).json({ message: "something went wrong", error })
    }

}

const deleteOneStock = async (req, res) => {
    try {
        const id = req.params.id
        const findStore = await Inventory.find({ storeId: id })
        if (findStore.length) {
            const storeToUpdate = findStore[0]; // Get the document
            const filteredData = storeToUpdate.InventoryData.filter((i) => i.id !== req.params.productId); // Filter in-place
            // No separate save needed as changes are tracked on the document
            storeToUpdate.InventoryData = filteredData; // Update the array
            await storeToUpdate.save({ new: true });
            res.json({ message: "product  deleted & updated  successfully", success: true });
        }
        else {
            res.json({ message: "unauthorized user", success: false })
        }
    }
    catch (error) {
        res.status(500).json({ message: "something went wrong" })
    }
}

const totalStoreExpenditure = async (req, res) => {
    try {
        const inventoryResponse = await Inventory.find({ storeId: req.params.id })
        if (inventoryResponse.length > 0) {
            const result = inventoryResponse[0]?.InventoryData.map((product) => {
                const totalStockPrice = product.stockHistory.reduce(
                    (acc, item) => acc + item.price * (item.quantity || 0), 0
                );
                const totalStockCount = product.stockHistory.reduce(
                    (acc, item) => acc + item.quantity || 0, 0
                );
                // Consider potential missing quantity in stockHistory items (set to 0)
                const totalPrice = product.price * product.quantity + totalStockPrice;
                return {
                    "product name": product.productName, // Use correct property name
                    "total price": totalPrice,
                    "totalStockCount": totalStockCount + product.quantity,
                    "currentStockPrice": product.price * product.quantity,
                    "stockHistoryPrice": totalStockPrice,
                    "currentStockCount": product.quantity,
                    "historyStockCount": totalStockCount
                };
            });
            const totalprice = await result.reduce(
                (acc, item) => acc + item['total price'] || 0, 0
            );
            console.log("result--->", result);

            // const totalprice = findPrice + findHistoryPrice(productData.stockHistory)
            res.json({ success: true, totalPrice: totalprice, count: inventoryResponse[0].InventoryData.length, data: result })

        }
        else {
            console.log("result--->", inventoryResponse);
        }
    }
    catch (error) {
        res.status(500).json({ message: "something went wrong", error: error })
    }
}

const storeInvoice = async (req, res) => {
    try {
        const inventoryResponse = await Inventory.find({ storeId: req?.body?.id })
        if (inventoryResponse) {
            console.log("inside response--->");

            const result = inventoryResponse[0]?.InventoryData?.map((product) => {
                const totalStockPrice = product?.stockHistory?.reduce(
                    (acc, item) => acc + item?.price * (item?.quantity || 0), 0
                );
                const totalStockCount = product?.stockHistory?.reduce(
                    (acc, item) => acc + item.quantity || 0, 0
                );
                // Consider potential missing quantity in stockHistory items (set to 0)
                const totalPrice = product?.price * product?.quantity + totalStockPrice;
                return {
                    "product name": product.productName, // Use correct property name
                    "total price": totalPrice,
                    "totalStockCount": totalStockCount + product.quantity,
                    "currentStockPrice": product.price * product.quantity,
                    "stockHistoryPrice": totalStockPrice,
                    "currentStockCount": product.quantity,
                    "historyStockCount": totalStockCount
                };
            });
            const totalprice = result?.reduce(
                (acc, item) => acc + item['total price'] || 0, 0
            );
            let html = ''
            if (result) {
                html =
                    `<!DOCTYPE html>
                    <html lang="en">
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="style.css">
                <link
                    href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
                    rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            
                <title>Document</title>
                <style>
                    * {
                        padding: 0px;
                        margin: 0px;
                        box-sizing: border-box;
                        font-family: "Poppins", sans-serif;
                    }
            
                    :root {
                        --light: #ffffff;
                        --primary: #0296C8
                    }
            
                    body {
                        width: 100%;
                        height: 100vh;
                        background-color: lightblue;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                    }
            
                    .parent-bill {
                        width: 30%;
                        height: 95%;
                        background-color: white
                    }
            
                    .img-con {
                        width: 100%;
                        height: 10%;
            
                    }
            
                    .img-con img {
                        width: 100%;
                        height: 100%;
                    }
            
                    .logo-con {
                        width: 40%;
                        height: 5%;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        padding: 0px 10px;
                    }
            
                    .logo-con h3 {
                        text-transform: capitalize;
                        font-weight: 500;
                        font-size: 13px;
                    }
            
                    .logo-con img {
                        width: 20%;
                        object-fit: contain;
                    }
            
                    .invoice-con {
                        width: 100%;
                        height: 15%;
                        display: flex;
                        flex-direction: row;
                        justify-content: center;
                        align-items: center;
                        padding: 10px;
                    }
            
                    .address-con,
                    .invoice-details {
                        width: 50%;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        height: 100%;
                        margin-top: 20px;
                    }
            
                    .invoice-details {
                        margin-left: 100px;
                    }
            
                    .address-con h5 {
                        font-size: 11px;
                        text-transform: capitalize;
                        color: var(--light);
                    }
            
                    .address-con h3 {
                        font-size: 12px;
                        text-transform: uppercase;
                        color: var(--primary);
                    }
            
                    .address-con address {
                        font-size: 10px;
                        color: var(--light);
                        font-weight: 500;
                        text-transform: capitalize;
                    }
            
                    .invoice-details p {
                        font-size: 10px;
                        font-weight: 500;
                        text-transform: capitalize;
                        color: var(--light);
                    }
            
                    .invoice-details span {
                        color: var(--primary);
                        font-size: 9px;
                    }
            
                    table {
                        width: 95%;
                        height: 30%;
                        border-collapse: collapse;
                        padding: 0px 5px;
                        margin-left: 10px;
                        margin-top: 20px;
                    }
            
                    table th {
                        border: 1px solid var(--primary);
                        height: 15%;
                        /* Combine width, style, and color */
                    }
            
                    table th:not(:last-child) {
                        border-right-color: white;
                    }
            
            
                    table,
                    th {
                        text-align: center;
                        font-size: 12px;
                        color: var(--primary);
                        text-transform: capitalize;
                        font-weight: 600;
                    }
            
                    table tr td {
                        border: none;
                        border-bottom: 1px solid var(--light);
                        font-size: 11px;
                        font-weight: 600;
                        color: var(--light);
                    }
            
                    table tr:last-child td,
                    table tr:last-child th {
                        border-bottom: none;
                        /* Remove bottom border for the last row */
                    }
            
                    .term-condition-con {
                        width: 100%;
                        height: 20%;
                        display: flex;
                        flex-direction: row;
                        justify-content: space-between;
                        padding: 10px;
                    }
            
                    .term-con {
                        width: 50%;
                        align-items: center;
                        padding-top: 10px;
                    }
            
                    .term-con h3 {
                        font-size: 9px;
                        text-transform: 500;
                        color: var(--primary);
                        text-transform: capitalize;
                    }
            
                    .term-con p,
                    .total-con p {
                        font-size: 10px;
                        text-transform: 400;
                        color: var(--light);
                        text-transform: capitalize;
                        padding: 5px;
                    }
            
                    .smal-div {
                        width: 100%;
                        height: 2px;
                        background-color: var(--primary);
                    }
            
                    .grand-total {
                        width: 100%;
                        background: linear-gradient(120deg, #00378E, #0298CB, #0046A5);
                        padding: 5px;
                        font-size: 10px;
                        color: white;
                        text-transform: capitalize;
                    }
            
                    .grand-total span {
                        color: white;
                        font-size: 10px;
                        text-transform: capitalize;
                        margin-left: 20px;
                    }
            
                    .icn-cont {
                        width: 100%;
                        display: flex;
                        flex-direction: row;
                        justify-content: space-between;
                        padding: 0px 5px;
                        align-items: center;
                    }
            
                    .icn-li {
                        display: flex;
                        flex-direction: row;
                    }
            
                    .icn-li p {
                        font-size: 10px;
                        margin-left: 5px;
                        font-weight: 500;
                        color: var(--light);
                    }
            
                    .icn-li .icn {
                        width: 30px;
                        height: 30px;
                        background-color: var(--primary);
                        border-radius: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
            
                    .icn-li .icn i {
                        color: white;
                        font-size: 15px;
                    }
            
                    .img-dup {
                        margin-top: 5px;
                    }
                </style>
            </head>
            
            <body>
            
                <!-- <div class="parent-bill"> -->
                <div class="invoice-con">
                    <div class="address-con">
                        <h5>invoice to</h5>
                        <h3>google industries</h3>
                        <address>
                            65, california street<br>
                            united states<br>
                            london(UK)<br>
                        </address>
                    </div>
                    <div class="invoice-details">
                        <p>invoice no<span>#23890</span></p>
                        <p>due date<span>3/8/2023</span></p>
                        <p>invoice date<span>29/9/2023</span></p>
                    </div>
                </div>
                <table>
                    <tr>
                        <th>
                            sn
                        </th>
                        <th>
                            item descrption
                        </th>
                        <th>
                            quantity
                        </th>
                        <th>
                            price
                        </th>
                        <th>
                            total
                        </th>
                    </tr>
                    ${result.map((value, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${value['product name']}</td>
                        <td>${value.totalStockCount}</td>
                        <td>${value.stockHistoryPrice}</td>
                        <td>${value['total price']}</td>
                    </tr>
                    `).join('')}
                </table>
                <div class="term-condition-con">
                    <div class="term-con">
                        <h3>terms & condition</h3>
                        <p>use this product with good manner and use for it purposely and perfectly</p>
                    </div>
                    <div class="total-con">
                        <div class="smal-div">
                        </div>
                        <p>sub total<span>$2345</span></p>
                        <p>total value<span>$257</span></p>
                        <div class="grand-total">
                            grandTotal<span> $${totalprice}</span>
                        </div>
                    </div>
                </div>
                <div class="icn-cont">
                    <div class="icn-li">
                        <div class="icn">
                            <i class="fa-solid fa-phone"></i>
                        </div>
                        <p>098-9876-098<br>076-098-6578</p>
                    </div>
                    <div class="icn-li">
                        <div class="icn">
                            <i class="fa-solid fa-link"></i>
                        </div>
                        <p>meta@gmail.com<br>www.meta.com</p>
                    </div>
                    <div class="icn-li">
                        <div class="icn">
                            <i class="fa-solid fa-location-dot"></i>
                        </div>
                        <p>united states<br>california</p>
                    </div>
            
            
                </div>
                <div class="img-con img-dup">
                    <img src="../../public/assests/b2.png" />
                </div>
                <!-- </div> -->
            
            </body>
                        </html>`
                const fileName = `${Date.now()}.pdf`
                const filePath = path.join("uploads", fileName)
                const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
                const page = await browser.newPage();

                await page.setContent(html);

                const pdfFile = await page.pdf({ path: filePath, format: 'A4' });

                // convert them in to buffer
                const pdfFileBuffer = fs.readFileSync(filePath);

                await browser.close();

                res.json({ response: pdfFileBuffer, fileName: fileName })

                try {
                    await fs.promises.unlink(filePath);
                    console.log(`File deleted successfully: ${filePath}`);
                } catch (error) {
                    res.status(500).json({ message: 'Something went wrong' })
                    console.error(`Error deleting file: ${filePath}`, error);
                }
                // Generate PDF
            }
        }
        else {
            res.json({ response: 'NoProducts were found', fileName: '' })

        }
    }
    catch (error) {
        console.log("error in order invoice", error);
        res.status(500).json({ message: 'Something went wrong' })
    }
}

const dashboardDetails = async (req, res) => {
    try {
        const inventory = await Inventory.find({ storeId: req?.params?.id })
        const sales = await Sale.find({ storeId: req?.params?.id })
        const Staffs = await Staff.find({ storeId: req?.params?.id })

        const findAllSaleLogs = sales[0]?.saleMonitor
        const findAllStaffs = Staffs[0]?.wholeStaffData
        const findAllProducts = inventory[0]?.InventoryData

        function getDateString(date) {
            return date.toISOString().split('T')[0];
        }

        let now = new Date();
        // 📌 This month current date
        let thisMonthCurrentDate = getDateString(now);
        // 📌 This month start date
        let thisMonthStartDate = getDateString(new Date(now.getFullYear(), now.getMonth(), 1));
        // 📌 Previous month start date
        let previousMonthStartDate = getDateString(new Date(now.getFullYear(), now.getMonth() - 1, 1));
        // 📌 Previous month end date — set to day 0 of this month → gives last day of previous month
        let previousMonthEndDate = getDateString(new Date(now.getFullYear(), now.getMonth(), 0));

        // add all sale amount from the given array
        function totalSaleSum(intial, current) {
            return current?.todaySaleAmount + intial
        }

        // to calculate percenatge
        function crossCalculator(current, previous) {
            if (previous > 0) {
                return Math.round(((current - previous) / previous) * 100)
            }
            else {
                return 0
            }
        }

        // total amount for monthly sales
        let thisMonth = await commonRange(findAllSaleLogs, thisMonthStartDate, thisMonthCurrentDate)
        let currentMonthSales = thisMonth?.reduce(totalSaleSum, 0)
        let prevMonth = await commonRange(findAllSaleLogs, previousMonthStartDate, previousMonthEndDate)
        let prevMonthSales = prevMonth?.reduce(totalSaleSum, 0) || 0

        let todaySaleAmounts = await commonRange(findAllSaleLogs, thisMonthCurrentDate, thisMonthCurrentDate)
        if (todaySaleAmounts?.length > 0) {
            todaySaleAmounts = todaySaleAmounts[0]?.todaySaleAmount
        }
        else {
            todaySaleAmounts = 0
        }

        // cross percentage calculator //
        let salesPercenatge = Math.round(((currentMonthSales - prevMonthSales) / prevMonthSales) * 100)

        //........ staff Section

        let staff_Present = 0
        let staff_Absent = 0
        let today_date = new Date()

        let active_Staffs = []

        if (findAllStaffs?.length > 0) {
            for (let index in findAllStaffs) {
                let data = findAllStaffs[index].staffPresent
                if (data[data.length - 1]?.updatedAt.toISOString().split('T')[0] == getDateString(today_date)) {
                    staff_Present++
                }
                else {
                    staff_Absent++
                }
                //filter this month date
                if (new Date(data[data.length - 1]?.updatedAt) >= new Date(thisMonthStartDate)) {
                    active_Staffs.push({ name: findAllStaffs[index].name, role: findAllStaffs[index].role, salary: findAllStaffs[index].salary, createdAt: findAllStaffs[index].updatedAt, })
                }
            }
        }

        let currentMonthSalary = 0
        // total salary for staff
        if (active_Staffs?.length > 0) {
            currentMonthSalary = active_Staffs.reduce((intial, item) => item?.salary + intial, 0)
        }


        let newStaffs = findAllStaffs?.map((item, index) => {
            return {
                name: item.name,
                salary: item.salary,
                createdAt: item.staffPresent[item.staffPresent.length - 1]?.updatedAt.toISOString().split('T')[0] || item?.updatedAt.toISOString().split('T')[0],
                sortDate: item.staffPresent[item.staffPresent.length - 1]?.updatedAt || item?.updatedAt
            }
        })
        let prev_Month = await commonRange(newStaffs, previousMonthStartDate, previousMonthEndDate)
        let prevMonthSalary = prev_Month?.reduce((intial, current) => current.salary + intial, 0) || 0

        let totalStaffSalaryPercentage = crossCalculator(currentMonthSalary, prevMonthSalary)


        //........ product section

        let newproducts = findAllProducts?.map((item) => {
            return {
                name: item.productName,
                createdAt: item?.createdAt ? item.createdAt?.split('T')[0] : '',
                sortDate: item?.createdAt ? item.createdAt : '',
                id: item.id,
                price: item.price || 0,
                quantity: item.quantity + " " + item.quantityType
            }
        }).filter((i) => i.createdAt != '' && i.sortDate != '')

        let lastestAddedproducts = await commonRange(newproducts, thisMonthStartDate, thisMonthCurrentDate)
        lastestAddedproducts?.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

        let currentMonthProductPrice = lastestAddedproducts?.reduce((intial, current) => current.price + intial, 0) || 0

        let prev_Month_products = await commonRange(newproducts, previousMonthStartDate, previousMonthEndDate)

        let prevMonthProductPrice = prev_Month_products?.reduce((intial, current) => current.price + intial, 0) || 0

        let totalProductSalaryPercentage = crossCalculator(currentMonthProductPrice ?? 0, prevMonthProductPrice ?? 0)


        // .... store revenue

        let currentMonthPayments = currentMonthSalary + currentMonthProductPrice
        let currentMonthRevenue = Math.abs(currentMonthPayments - currentMonthSales)

        let prevMonthPayments = prevMonthSalary + prevMonthProductPrice
        let prevMonthRevenue = Math.abs(prevMonthPayments - prevMonthSales)


        let overAllRevenue = crossCalculator(currentMonthRevenue, prevMonthRevenue)

        console.log("prevMonthSalary + prevMonthProductPrice", currentMonthRevenue)

        if (inventory && Staffs) {
            res.json(
                {
                    sale: { todaySale: todaySaleAmounts || 0, percentage: salesPercenatge || 0, monthSale: currentMonthSales || 0 },
                    staff: {
                        totalStaff: findAllStaffs?.length || 0, present: staff_Present || 0, absent: staff_Absent || 0, salaryCross: totalStaffSalaryPercentage || 0,
                        currentMonth: currentMonthSalary,
                    },
                    products: {
                        count: findAllProducts?.length, newlyadded: lastestAddedproducts, productCross: totalProductSalaryPercentage ?? 0,
                        currentMonths: currentMonthProductPrice,
                    },
                    data: active_Staffs,
                    storeRevenue: overAllRevenue,
                    monthlyturnOver: currentMonthRevenue || 0
                }
            )

        }
    }
    catch (error) {
        res.status(500).json({ error: error })
        console.log("error", error);
    }

}

const dashboardGraphData = async (req, res) => {
    try {
        console.log("hello")
        let { type, isReport } = req.query
        console.log("hello ty[e", JSON.stringify(req.query))
        if (type != '') {
            const sales = await Sale.find({ storeId: req?.params?.id })

            const findAllSales = sales[0]?.saleMonitor

            console.log("findAllSales", sales[0]?.saleMonitor);


            const findGraphType = () => {
                let value = 0
                switch (type) {
                    case 'FULL_YEAR':
                        value = 12
                        break
                    case 'HALF':
                        value = 6
                        break
                    case 'QUARTER':
                        value = 3
                        break
                }
                return value
            }

            function getDateString(date) {
                return date.toISOString().split('T')[0];
            }

            let now = new Date()

            let saleType = findGraphType()

            let index = saleType
            let salaryGraph = []
            if (findAllSales) {
                while (index <= saleType && index) {
                    let startDate = new Date(now.getFullYear(), now.getMonth() - index, 1)
                    let endDate = new Date(now.getFullYear(), now.getMonth() - index, 31)
                    let monthlySale = await commonRange(findAllSales || [], getDateString(startDate), getDateString(endDate))
                    let totalSum = monthlySale.reduce((intial, current) => intial + current.todaySaleAmount, 0)
                    salaryGraph.push({ month: startDate.toLocaleString('default', { month: 'short' }), totalSales: totalSum, year: startDate.getFullYear() })
                    index--
                }

                if (isReport) {
                    const findUser = (await signUp.find()).filter((i) => i._id == req?.params?.id)
                    let userDetails = findUser[0]
                    let totalSum = salaryGraph.reduce((intial, current) => intial + current?.totalSales, 0) || 0
                    let salesGraphData = { name: userDetails?.name, email: userDetails?.email, number: userDetails?.phoneNumber, storeName: userDetails?.storeName, data: salaryGraph, total: totalSum }
                    let html = saleTemplate(salesGraphData)
                    const fileName = `${Date.now()}.pdf`
                    const filePath = path.join("uploads", fileName)
                    const browser = await puppeteer.launch();
                    const page = await browser.newPage();

                    await page.setContent(html);

                    const pdfFile = await page.pdf({ path: filePath, format: 'A4', });

                    // convert them in to buffer
                    const pdfFileBuffer = fs.readFileSync(filePath);

                    res.json({ response: pdfFileBuffer, fileName: fileName, types: saleType, data: salaryGraph })

                    try {
                        await fs.promises.unlink(filePath);
                        console.log(`File deleted successfully: ${filePath}`);
                    } catch (error) {
                        console.error(`Error deleting file: ${filePath}`, error);
                    }


                }
                else {
                    res.json({ types: saleType, data: salaryGraph })
                }
            }
            else {
                res.json({ types: saleType, data: [] })
            }


            // fullYear 3month  6month

        }
        else {
            res.json({ message: 'type is missing' })
        }
    }
    catch (error) {
        res.status(500).json({ error: error })

    }

}

const userHistoryData = async (req, res) => {
    try {
        let { id } = req?.params
        const userHistory = await signInUsers.find({ storeAccessId: id })
        if (userHistory.length > 0) {
            let val = userHistory
            const userLoginHistory = new Map()
            for (let item of val) {
                userLoginHistory.set(item.deviceName, (userLoginHistory.get(item.deviceName) || 0) + 1)
            }
            const result = Array.from(userLoginHistory, ([deviceName, count]) => ({ deviceName, count }))
            res.json({ data: result });

            // const result = userHistory.reduce((acc, curr) => {
            //     const key = curr.deviceName;
            //     if (!acc[key]) {
            //         acc[key] = [];
            //     }
            //     acc[key].push(curr);
            //     return acc;
            // }, {});
        }
        else {
            res.json({ data: userHistory })
        }
    }
    catch (error) {
        res.json({ error: error })

    }
}


module.exports = { addNewStock, getAllStock, getOneStock, updateOneStockDetails, deleteOneStock, totalStoreExpenditure, storeInvoice, dashboardDetails, dashboardGraphData, userHistoryData }


