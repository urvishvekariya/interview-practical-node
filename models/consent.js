const mongoose = require('mongoose')

const consentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    consents: {
        type: Array,
    }
}, {
    timestamps: true
})

const Consent = mongoose.model('Consent', consentSchema)

module.exports = Consent