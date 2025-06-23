const cron = require("node-cron")
const cronExpression = "* * * * *";
// const cronExpression = "30 18 * * *";
// '0 14 * * *
// 0 11 * * *
// 45 19 * * *'
const admin = require("firebase-admin")

const userData = require('../models/userSignInModel')

cron.schedule(cronExpression, async () => {

    try {

        const userDb = await userData.find({ isActive: true })
        // console.log("json.stringfy()--?", userDb);
        userDb.map(async (item) => {
            if (item.fcmToken != '') {
                // let mobileToken = 'e68-B3W1SHyrx-TcP-F690:APA91bEB0KyBkv1pTvSZy2jA_2x-mjaQ7XTl8zIYYLVvkCY8-rLSlZXMEbXK88AXq1OLIcVwSQdwIafv66MamJ0FBW9nJK4Uo7HdCK2Wvbnl8_oNX1att0s'
                console.log("triggered");

                await admin.messaging().send({
                    token: item?.fcmToken,
                    notification: {
                        title: "StockCheck",
                        body: "Have you take attendance on your staff",
                    },
                    webpush:
                    {
                        headers: {
                            Urgency: 'high' // 'high', 'normal', 'low'
                        },
                    },
                    android: {
                        notification: {
                            channelId: "default",
                        }
                    },
                }).catch(async (error) => {
                    console.log("error in cronExpression", error, item);
                })
            }
        })
    }
    catch (err) {
        user
        console.log(err);
    }
})
