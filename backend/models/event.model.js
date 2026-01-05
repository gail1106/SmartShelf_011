import mongoose from 'mongoose';

const types = ['Irrigation Activation', 'Data Submission', 'Seedling Sow', 'Seedling Ready'];



const EventSchema = new mongoose.Schema({
    device:{
        type: mongoose.Types.ObjectId,
        ref: 'Device',
        required: true
    },
    eventDate:{
        type: Number,
        required: true,
        default: Date.now()
    },
    eventType:{
        type: String,
        enum: types,
        required: true,
        default: 'Data Submission'
    },
  isRaining:{
        type:Boolean,
        required: true,
        default: false
    },
    rainfallIntensity:{
        type:Number,
        required:true,
        default: 0
    },
    floodLevel:{
        type:Number,
        required:true,
        default:0
    },
    location:{
        type: String,
        default: ""
    }
});

const Event=mongoose.model('Event', EventSchema);

export default Event;