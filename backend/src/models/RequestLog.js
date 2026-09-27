import mongoose from 'mongoose';

const requestLogSchema = new mongoose.Schema({
  ip: String,
  method: String,
  path: String,
  status: Number,
  timestamp: { type: Date, default: Date.now, expires: '30d' }
});

export default mongoose.model('RequestLog', requestLogSchema);
