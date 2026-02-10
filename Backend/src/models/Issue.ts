import mongoose, { Document, Schema, Types } from "mongoose";

export interface IIssue extends Document {
  title: string;
  description: string;
  severity: "Low" | "Medium" | "High";
  priority: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Closed" | "Resolved";
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const IssueSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: String,
  severity: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  status: {
    type: String,
    enum: ["Open", "In Progress", "Resolved", "Closed"],
    default: "Open",
  },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IIssue>("Issue", IssueSchema);
