import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a service name'],
    trim: true,
  },
    description: {
        type: String,
        required: [true, 'Please provide a service description'],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'Please provide a service price'],
        min: [0, 'Price cannot be negative'],
    },
    duration: {
        type: Number,
        required: [true, 'Please provide a service duration'],
        min: [0, 'Duration cannot be negative'],
    },
   availableSlots: [
    {
      _id : {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        default: () => new mongoose.Types.ObjectId(),
      },
      startTime: {
        type: Date,
        required: true,
      },
        endTime: {
            type: Date,
            required: true,
        },
        isBooked: {
            type: Boolean,
            default: false,
        },
    },
  ],
},{
    timestamps: true,
});

const Service = mongoose.model('Service', serviceSchema);
export default Service;