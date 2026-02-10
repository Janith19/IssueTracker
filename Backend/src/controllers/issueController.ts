import { Response, Request } from "express";
import mongoose from "mongoose";
import Issue from "../models/Issue";

// validate mongo id before doing lookups
const isValidObjectId = (id: string | string[] | undefined): boolean => {
  if (!id || Array.isArray(id)) return false;
  return mongoose.Types.ObjectId.isValid(id);
};

export const createIssue = async (req: Request, res: Response) => {
  try {
    const issue = new Issue({ ...req.body, createdBy: req.user?.userId });
    await issue.save();
    res.status(201).json({ message: "Issue created", issue });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getIssues = async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    title,
    priority,
    status,
  } = req.query as { [key: string]: string };

  const query: any = { createdBy: req.user?.userId };

  if (title) query.title = { $regex: title, $options: "i" };
  if (priority) query.priority = priority;
  if (status) query.status = status;

  try {
    const issues = await Issue.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Issue.countDocuments(query);

    const statusCounts = await Issue.aggregate([
      {
        $match: { createdBy: new mongoose.Types.ObjectId(req.user?.userId) },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]).then((agg) =>
      agg.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {}),
    );
    res.json({
      issues,
      totalPages: Math.ceil(total / Number(limit)),
      statusCounts,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getIssue = async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid issue ID format" });
  }
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue || issue.createdBy.toString() !== req.user?.userId)
      return res.status(404).json({ message: "Issue Id Not found" });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

export const updateIssue = async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid issue ID format" });
  }
  try {
    const issue = await Issue.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user!.userId },
      req.body,
      { new: true },
    );
    if (!issue) return res.status(404).json({ message: "Not found" });
    res.json(issue);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteIssue = async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid issue ID format" });
  }
  try {
    const issue = await Issue.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user!.userId,
    });
    if (!issue) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
