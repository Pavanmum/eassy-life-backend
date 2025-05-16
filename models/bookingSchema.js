import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
    },
    slot: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: [ 'confirmed','canceled'],
        default: 'confirmed',
    },
    }, {
    timestamps: true,
    });
const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;