import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useIssueStore } from "../store/issuesStore";

const statusColors: Record<string, string> = {
  Open: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "In Progress": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Resolved: "bg-green-500/20 text-green-300 border-green-500/30",
  Closed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const severityColors: Record<string, string> = {
  Low: "text-green-400",
  Medium: "text-yellow-400",
  High: "text-red-400",
};

const priorityColors: Record<string, string> = {
  Low: "text-green-400",
  Medium: "text-yellow-400",
  High: "text-red-400",
};

export default function IssueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentIssue, loading, fetchIssue } = useIssueStore();

  useEffect(() => {
    if (id) fetchIssue(id);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-950 flex items-center justify-center">
        <p className="text-slate-400 text-lg">Loading issue...</p>
      </div>
    );
  }

  if (!currentIssue) {
    return (
      <div className="min-h-screen bg-blue-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-lg mb-4">Issue not found</p>
          <Link to="/" className="text-blue-400 hover:text-white transition">
            ← Back to issues
          </Link>
        </div>
      </div>
    );
  }

  const severity = currentIssue.severity || "Medium";
  const priority = currentIssue.priority || "Medium";

  return (
    <div className="min-h-screen bg-blue-950">
      <header className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="text-sm text-slate-400 hover:text-white transition"
          >
            ← Back to issues
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold text-white">
              {currentIssue.title}
            </h1>
            <span
              className={`text-sm px-3 py-1 rounded-full border whitespace-nowrap ${statusColors[currentIssue.status]}`}
            >
              {currentIssue.status}
            </span>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-6 mb-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Severity:</span>
              <span className={`font-semibold ${severityColors[severity]}`}>
                {severity}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Priority:</span>
              <span className={`font-semibold ${priorityColors[priority]}`}>
                {priority}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Created:</span>
              <span className="text-slate-300">
                {new Date(currentIssue.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-white/10 pt-6">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
              Description
            </h2>
            {currentIssue.description ? (
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {currentIssue.description}
              </p>
            ) : (
              <p className="text-slate-500 italic">No description provided.</p>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-white/10 pt-6 mt-8 flex gap-3">
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2 rounded-lg font-semibold bg-white/5 border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              Back to List
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
