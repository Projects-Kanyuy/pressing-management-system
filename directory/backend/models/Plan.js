const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
    currency: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
}, { _id: false });

const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ['Trial', 'Basic', 'Pro'],
    },
    description: {
        type: String,
        default: '',
    },
    prices: [priceSchema],
    features: [{
        type: String,
    }],
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Plan', planSchema);


