const express = require('express');
require('dotenv').config({ path: './config/dev.env' })
require('./db/mongoose')
const Consent = require('./models/consent')

const app = express()
app.use(express.json())
const PORT = process.env.port

app.get('/consents', async (req, res) => {
    try {

        const pageOption = {
            page: parseInt(req.query.page) || 0,
            limit: parseInt(req.query.limit) || 10
        }

        Consent.aggregate([
            {
                '$unset': [
                    '__v'
                ]
            },
            {
                $facet: {
                    metadata: [{ $count: 'count' }],
                    data: [{ $skip: pageOption.limit * pageOption.page },
                    { $limit: pageOption.limit }
                    ]
                }
            },
            {
                $addFields: {
                    totalRecord: { $arrayElemAt: ["$metadata.count", 0] }
                }
            },
            {
                $set: { page: { $divide: ['$totalRecord', pageOption.limit] } }
            },
            {
                $set: {
                    totalPage: { $ceil: '$page' }
                }
            },
            {
                '$unset': [
                    'metadata', 'page'
                ]
            }
        ]).then((result) => {
            const metadat = { totalPage: result[0].totalPage, totalRecord: result[0].totalRecord }
            const data = result[0].data

            res.status(200).send({ 'mess': "All consents", 'metadata': metadat, data: data })
        }).catch((err) => {
            console.log(err)
            res.status(500).send({ 'mess': "something went wrong" })
        })

    } catch (e) {
        console.log(e)
        res.status(500).send({ 'mess': "something went wrong" })
    }
})

app.post('/give-consent', async (req, res) => {
    try {
        const { name, email, consents } = req.body

        if (!name || !email || !consents.length > 0) {
            return res.status(400).send({ 'message': "All field is required" })
        }

        let newcons = []

        if (consents.includes(1)) {
            newcons.push("Recevied newsletter")
        }
        if (consents.includes(2)) {
            newcons.push("Be shown targeted ads")
        }
        if (consents.includes(3)) {
            newcons.push("Contribute to anonymous visit statistics")
        }

        const consent = new Consent({
            name,
            email,
            consents: newcons
        })

        await consent.save().then((consent) => {
            res.status(201).send({ 'message': "Your consent has been saved", data: consent })
        }).catch((err) => {
            console.log(err)
            res.status(500).send({ 'message': "Something went wrong" })
        })
    } catch (e) {
        console.log(e)
        res.status(500).send({ 'message': "Something went wrong" })
    }
})


app.listen(PORT, () => {
    console.log('serevr is runing on port ' + PORT)
})



