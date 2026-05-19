import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ParkingLot',
        required: true
    },
    slotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Slot',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    vehicleNumber: {
        type: String,
        required: true
    },
    vehicleType: {
        type: String,
        enum: ['car', 'bike'],
        required: true,
        default: 'car'
    },
    status: {
        type: String,
        enum: ['active', 'cancelled', 'completed'],
        default: 'active'
    },
    amount: {
        type: Number
    },
    penaltyAmount: {
        type: Number,
        default: 0
    },
    qrCodeData: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

bookingSchema.index({ slotId: 1, status: 1, startTime: 1, endTime: 1 });

export default mongoose.model('Booking', bookingSchema);
