const Task = require("../models/Task");

// Create task
exports.createTask = async (req, res) => {
  const task = await Task.create({
    user: req.user._id,
    title: req.body.title,
  });
  res.status(201).json(task);
};

// Get tasks
exports.getTasks = async (req, res) => {
  const tasks = await Task.find({ user: req.user._id });
  res.json(tasks);
};

// Update task
exports.updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  task.completed = !task.completed;
  await task.save();
  res.json(task);
};

// Delete task
exports.deleteTask = async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task deleted" });
};
