import mongoose from 'mongoose';

const parkingLotSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    cityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
        required: true
    },
    location: {
        type: String,
        required: true
    },
    totalSlots: {
        type: Number,
        required: true
    },
    carPrice: {
        type: Number,
        required: true,
        default: 50
    },
    bikePrice: {
        type: Number,
        required: true,
        default: 20
    },
    type: {
        type: String,
        enum: ['Standard', 'Premium', 'Government', 'Private', 'Hospital', 'Mall'],
        default: 'Standard'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('ParkingLot', parkingLotSchema);
