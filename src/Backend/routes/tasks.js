import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import Task from '../models/Task.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Get all tasks for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

// Create a new task
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { name, description, dueDate, priority } = req.body;
    if (!name || !description || !dueDate) {
      return res.status(400).json({ message: 'Task name, description and due date are required' });
    }

    const taskData = {
      name,
      description,
      dueDate: new Date(dueDate),
      priority: priority || 'medium',
      user: req.user.userId
    };

    if (req.file) {
      taskData.file = `/uploads/${req.file.filename}`;
      taskData.fileName = req.file.originalname;
    }

    const task = new Task(taskData);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
});

// Update a task
router.patch('/:id', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updates = {
      name: req.body.name,
      description: req.body.description,
      dueDate: new Date(req.body.dueDate),
      priority: req.body.priority
    };

    if (req.file) {
      updates.file = `/uploads/${req.file.filename}`;
      updates.fileName = req.file.originalname;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
});

// Toggle task completion status
router.patch('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      [{ $set: { completed: { $not: '$completed' } } }],
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling task completion', error: error.message });
  }
});

// Delete a task
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // If task has an associated file, you might want to delete it here
    if (task.file) {
      const filePath = path.join(__dirname, '..', task.file);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    res.json({ message: 'Task deleted successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
});

export default router;