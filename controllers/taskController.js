import mongoose from 'mongoose';
import { Task } from '../models/Task.js';
import { DailyEntry } from '../models/DailyEntry.js';
import { toDateKey } from '../utils/date.js';

export const getTasks = async (req, res) => {
  const tasks = await Task.find({ userId: req.user.id, isArchived: false }).sort({ createdAt: -1 });
  return res.json({ tasks });
};

export const createTask = async (req, res) => {
  const { title, question, yesMeansSuccess = true, color = '#4f46e5' } = req.body;

  if (!title || !question) {
    return res.status(400).json({ message: 'Title and question are required.' });
  }

  const task = await Task.create({
    userId: req.user.id,
    title,
    question,
    yesMeansSuccess,
    color
  });

  return res.status(201).json({ task });
};

export const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const updates = req.body;

  const task = await Task.findOneAndUpdate(
    { _id: taskId, userId: req.user.id },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!task) {
    return res.status(404).json({ message: 'Task not found.' });
  }

  return res.json({ task });
};

export const archiveTask = async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findOneAndUpdate(
    { _id: taskId, userId: req.user.id },
    { $set: { isArchived: true } },
    { new: true }
  );

  if (!task) {
    return res.status(404).json({ message: 'Task not found.' });
  }

  return res.json({ task });
};

export const upsertDailyEntry = async (req, res) => {
  const { taskId } = req.params;
  const { date, answer } = req.body;

  if (!['yes', 'no'].includes(answer)) {
    return res.status(400).json({ message: 'Answer must be yes or no.' });
  }

  const task = await Task.findOne({ _id: taskId, userId: req.user.id, isArchived: false });
  if (!task) {
    return res.status(404).json({ message: 'Task not found.' });
  }

  const dateKey = date ? toDateKey(date) : toDateKey(new Date());
  const success = task.yesMeansSuccess ? answer === 'yes' : answer === 'no';

  const entry = await DailyEntry.findOneAndUpdate(
    { userId: req.user.id, taskId, date: dateKey },
    { $set: { answer, success } },
    { new: true, upsert: true, runValidators: true }
  );

  return res.json({ entry });
};

export const getHeatmap = async (req, res) => {
  const { startDate, endDate } = req.query;

  const match = {
    userId: new mongoose.Types.ObjectId(req.user.id)
  };

  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = toDateKey(startDate);
    if (endDate) match.date.$lte = toDateKey(endDate);
  }

  const [entries, tasks] = await Promise.all([
    DailyEntry.find(match).sort({ date: 1 }),
    Task.find({ userId: req.user.id, isArchived: false }).sort({ createdAt: -1 })
  ]);

  const byTask = tasks.map((task) => ({
    task,
    entries: entries.filter((entry) => entry.taskId.toString() === task._id.toString())
  }));

  return res.json({ heatmaps: byTask });
};
