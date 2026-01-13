import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  type: String,
  data: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
});

// Check if model already exists to avoid overwrite errors
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

export default Event;
