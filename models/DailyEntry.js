import mongoose from 'mongoose';

const dailyEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
    date: { type: String, required: true },
    answer: { type: String, enum: ['yes', 'no'], required: true },
    success: { type: Boolean, required: true }
  },
  { timestamps: true }
);

dailyEntrySchema.index({ userId: 1, taskId: 1, date: 1 }, { unique: true });

export const DailyEntry = mongoose.model('DailyEntry', dailyEntrySchema);
