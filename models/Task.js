import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    question: { type: String, required: true, trim: true },
    yesMeansSuccess: { type: Boolean, default: true },
    color: { type: String, default: '#4f46e5' },
    isArchived: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Task = mongoose.model('Task', taskSchema);
