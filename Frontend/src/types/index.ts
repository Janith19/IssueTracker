export interface Issue {
  _id: string;
  title: string;
  description?: string;
  severity?: "Low" | "Medium" | "High";
  priority?: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  createdAt: string;
}
