const mongoose = require('mongoose');

const priceListSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
    },
    itemType: {
        type: String,
        required: true,
        trim: true,
    },
    serviceType: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        default: 'FCFA',
    },
}, {
    timestamps: true,
});

priceListSchema.index({ tenantId: 1 });
priceListSchema.index({ itemType: 1, serviceType: 1 });

module.exports = mongoose.model('PriceList', priceListSchema);


