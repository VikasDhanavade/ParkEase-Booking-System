import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
    lotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ParkingLot',
        required: true
    },
    slotNumber: {
        type: String,
        required: true
    },
    floor: {
        type: String
    },
    status: {
        type: String,
        enum: ['available', 'blocked'],
        default: 'available'
    }
});

export default mongoose.model('Slot', slotSchema);
