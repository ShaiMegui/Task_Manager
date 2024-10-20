import asyncHandler from "express-async-handler";
import TaskModel from "../../models/task/taskModel.js";

export const createTask = asyncHandler(async (req, res) => {
    const { title, description, dueDate, priority, status } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({ message: "Title is required" });
    }
    if (!description || description.trim() === "") {
        return res.status(400).json({ message: "Description is required" });
    }

    const task = new TaskModel({
        title,
        description,
        dueDate,
        priority,
        status,
        user: req.user._id,
    });

    await task.save();
    res.status(201).json(task);
});

export const getTasks = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    if (!userId) {
        return res.status(400).json({ message: "User Not Found" });
    }

    const tasks = await TaskModel.find({ user: userId });
    res.status(200).json({
        length: tasks.length,
        tasks,
    });
});

export const getTask = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "Please Provide a task id" });
    }

    const task = await TaskModel.findById(id);
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }
    if (!task.user.equals(userId)) {
        return res.status(401).json({ message: "Not authorized!" });
    }

    res.status(200).json(task);
});

export const updateTask = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;
    const { title, description, dueDate, priority, status, completed } = req.body;

    if (!id) {
        return res.status(400).json({ message: "Please Provide a task id" });
    }

    const task = await TaskModel.findById(id);
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    // Check if the user is the owner of the task 
    if (!task.user.equals(userId)) {
        return res.status(401).json({ message: "Not authorized!" });
    }

    // Update the task with the new data
    task.title = title || task.title;
    task.description = description || task.description;
    task.dueDate = dueDate || task.dueDate;
    task.priority = priority || task.priority;
    task.status = status || task.status;
    task.completed = completed || task.completed;

    await task.save();

    res.status(200).json(task);
});

export const deleteTask = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "Please Provide a task id" });
    }

    const task = await TaskModel.findById(id);
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    // Check if the user is the owner of the task 
    if (!task.user.equals(userId)) {
        return res.status(401).json({ message: "Not authorized!" });
    }

    await TaskModel.findByIdAndDelete(id);

    res.status(200).json({ message: "Task deleted successfully" });
});
