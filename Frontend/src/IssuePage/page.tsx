import { useEffect, useState } from "react";
import { useIssueStore } from "../store/issuesStore";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import type { Issue } from "../types/index";

const STATUS_OPTIONS = ["Open", "In Progress", "Resolved", "Closed"] as const;
const SEVERITY_OPTIONS = ["Low", "Medium", "High"] as const;
const PRIORITY_OPTIONS = ["Low", "Medium", "High"] as const;

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

export default function IssuePage() {
  const {
    issues,
    statusCounts,
    loading,
    totalPages,
    currentPage,
    fetchIssues,
    createIssue,
    updateIssue,
    deleteIssue,
  } = useIssueStore();
  const { logout } = useAuthStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [searchTitle, setSearchTitle] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  // form fields
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSeverity, setFormSeverity] = useState<string>("Medium");
  const [formPriority, setFormPriority] = useState<string>("Medium");
  const [formStatus, setFormStatus] = useState<string>("Open");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusChangeIssue, setStatusChangeIssue] = useState<{
    issue: Issue;
    newStatus: string;
  } | null>(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  useEffect(() => {
    fetchIssues({
      title: searchTitle || undefined,
      status: filterStatus || undefined,
      priority: filterPriority || undefined,
      page: 1,
    });
  }, [searchTitle, filterStatus, filterPriority]);

  const goToPage = (page: number) => {
    fetchIssues({
      title: searchTitle || undefined,
      status: filterStatus || undefined,
      priority: filterPriority || undefined,
      page,
    });
  };

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormSeverity("Medium");
    setFormPriority("Medium");
    setFormStatus("Open");
    setEditingIssue(null);
    setShowCreateModal(false);
  };

  const openEditModal = (issue: Issue) => {
    setEditingIssue(issue);
    setFormTitle(issue.title);
    setFormDescription(issue.description || "");
    setFormSeverity(issue.severity || "Medium");
    setFormPriority(issue.priority || "Medium");
    setFormStatus(issue.status);
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    try {
      const data = {
        title: formTitle,
        description: formDescription,
        severity: formSeverity as Issue["severity"],
        priority: formPriority as Issue["priority"],
        status: formStatus as Issue["status"],
      };

      // show confirmation before resolving/closing
      if (
        editingIssue &&
        (data.status === "Resolved" || data.status === "Closed") &&
        editingIssue.status !== data.status
      ) {
        setStatusChangeIssue({ issue: editingIssue, newStatus: data.status! });
        return;
      }

      if (editingIssue) {
        await updateIssue(editingIssue._id, data);
        toast.success("Issue updated");
      } else {
        await createIssue(data);
        toast.success("Issue created");
      }
      resetForm();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const confirmStatusChange = async () => {
    if (!statusChangeIssue || !editingIssue) return;
    try {
      const data = {
        title: formTitle,
        description: formDescription,
        severity: formSeverity as Issue["severity"],
        priority: formPriority as Issue["priority"],
        status: statusChangeIssue.newStatus as Issue["status"],
      };
      await updateIssue(editingIssue._id, data);
      toast.success(`Issue marked as ${statusChangeIssue.newStatus}`);
      setStatusChangeIssue(null);
      resetForm();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteIssue(deleteId);
      toast.success("Issue deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const exportToJSON = () => {
    const blob = new Blob([JSON.stringify(issues, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "issues.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as JSON");
  };

  const exportToCSV = () => {
    const headers = [
      "Title",
      "Description",
      "Status",
      "Severity",
      "Priority",
      "Created",
    ];
    const rows = issues.map((i) => [
      `"${i.title.replace(/"/g, '""')}"`,
      `"${(i.description || "").replace(/"/g, '""')}"`,
      i.status,
      i.severity || "Medium",
      i.priority || "Medium",
      new Date(i.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "issues.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as CSV");
  };

  const totalIssues = Object.values(statusCounts || {}).reduce(
    (sum, count) => sum + count,
    0,
  );

  return (
    <div className="min-h-screen bg-blue-950">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Issue Tracker</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-400 hover:text-white transition cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <button
            onClick={() => setFilterStatus("")}
            className={`bg-purple-500/15 border rounded-xl p-4 text-left transition cursor-pointer ${
              filterStatus === ""
                ? "border-purple-400 ring-1 ring-purple-400"
                : "border-purple-500/30 hover:border-purple-400/50"
            }`}
          >
            <p className="text-sm text-purple-300">All</p>
            <p className="text-2xl font-bold text-white">{totalIssues}</p>
          </button>
          {STATUS_OPTIONS.map((status) => {
            const tileStyles: Record<
              string,
              {
                bg: string;
                border: string;
                activeBorder: string;
                label: string;
              }
            > = {
              Open: {
                bg: "bg-blue-500/15",
                border: "border-blue-500/30 hover:border-blue-400/50",
                activeBorder: "border-blue-400 ring-1 ring-blue-400",
                label: "text-blue-300",
              },
              "In Progress": {
                bg: "bg-yellow-500/15",
                border: "border-yellow-500/30 hover:border-yellow-400/50",
                activeBorder: "border-yellow-400 ring-1 ring-yellow-400",
                label: "text-yellow-300",
              },
              Resolved: {
                bg: "bg-green-500/15",
                border: "border-green-500/30 hover:border-green-400/50",
                activeBorder: "border-green-400 ring-1 ring-green-400",
                label: "text-green-300",
              },
              Closed: {
                bg: "bg-slate-500/15",
                border: "border-slate-500/30 hover:border-slate-400/50",
                activeBorder: "border-slate-400 ring-1 ring-slate-400",
                label: "text-slate-400",
              },
            };
            const style = tileStyles[status];
            return (
              <button
                key={status}
                onClick={() =>
                  setFilterStatus(filterStatus === status ? "" : status)
                }
                className={`${style.bg} border rounded-xl p-4 text-left transition cursor-pointer ${
                  filterStatus === status ? style.activeBorder : style.border
                }`}
              >
                <p className={`text-sm ${style.label}`}>{status}</p>
                <p className="text-2xl font-bold text-white">
                  {statusCounts?.[status] || 0}
                </p>
              </button>
            );
          })}
        </div>

        {/* toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search issues..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            className="flex-1 rounded-lg bg-white/5 border border-white/15 px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
          />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-lg bg-white/5 border border-white/15 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition text-center justify-center items-center appearance-none"
          >
            <option value="" className="bg-slate-900">
              All Priorities
            </option>
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p} className="bg-slate-900">
                {p}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="px-4 py-2.5 rounded-lg font-medium bg-white/5 border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer text-sm"
            >
              CSV
            </button>
            <button
              onClick={exportToJSON}
              className="px-4 py-2.5 rounded-lg font-medium bg-white/5 border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer text-sm"
            >
              JSON
            </button>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="px-6 py-2.5 rounded-lg font-semibold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer whitespace-nowrap"
          >
            + New Issue
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">Loading issues...</p>
          </div>
        ) : (issues || []).length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">No issues found</p>
            <p className="text-slate-500 text-sm mt-1">
              Create your first issue to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <div
                key={issue._id}
                className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        to={`/issues/${issue._id}`}
                        className="text-white font-semibold text-lg truncate hover:text-blue-300 transition"
                      >
                        {issue.title}
                      </Link>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full border ${statusColors[issue.status]}`}
                      >
                        {issue.status}
                      </span>
                    </div>
                    {issue.description && (
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                        {issue.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>
                        Severity:{" "}
                        <span
                          className={`font-medium ${severityColors[issue.severity || "Medium"]}`}
                        >
                          {issue.severity || "Medium"}
                        </span>
                      </span>
                      <span>
                        Priority:{" "}
                        <span
                          className={`font-medium ${priorityColors[issue.priority || "Medium"]}`}
                        >
                          {issue.priority || "Medium"}
                        </span>
                      </span>
                      <span>
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEditModal(issue)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(issue._id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* pagination - only show if more than 1 page */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-lg text-sm bg-white/5 border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-1.5 rounded-lg text-sm transition cursor-pointer ${
                  page === currentPage
                    ? "bg-blue-600 text-white"
                    : "bg-white/5 border border-white/15 text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg text-sm bg-white/5 border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-5">
              {editingIssue ? "Edit Issue" : "New Issue"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Issue title"
                  className="w-full rounded-lg bg-white/5 border border-white/15 px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                />
              </div>
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Description
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe the issue..."
                  rows={3}
                  className="w-full rounded-lg bg-white/5 border border-white/15 px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1.5">
                    Severity
                  </label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value)}
                    className="w-full rounded-lg bg-white/5 border border-white/15 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                  >
                    {SEVERITY_OPTIONS.map((s) => (
                      <option key={s} value={s} className="bg-slate-900">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1.5">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="w-full rounded-lg bg-white/5 border border-white/15 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p} className="bg-slate-900">
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {editingIssue && (
                <div>
                  <label className="block text-sm font-medium text-white mb-1.5">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full rounded-lg bg-white/5 border border-white/15 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s} className="bg-slate-900">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg font-semibold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer"
                >
                  {editingIssue ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2.5 rounded-lg font-semibold bg-white/5 border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* confirm before marking resolved/closed */}
      {statusChangeIssue && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <h3 className="text-lg font-bold text-white mb-2">
              Mark as {statusChangeIssue.newStatus}?
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Are you sure you want to change the status of "
              {statusChangeIssue.issue.title}" to{" "}
              <span className="text-white font-medium">
                {statusChangeIssue.newStatus}
              </span>
              ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmStatusChange}
                className="flex-1 py-2.5 rounded-lg font-semibold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer"
              >
                Confirm
              </button>
              <button
                onClick={() => setStatusChangeIssue(null)}
                className="flex-1 py-2.5 rounded-lg font-semibold bg-white/5 border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <h3 className="text-lg font-bold text-white mb-2">Delete Issue?</h3>
            <p className="text-slate-400 text-sm mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-lg font-semibold bg-red-600/50 hover:bg-red-500/50 text-white transition cursor-pointer"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-lg font-semibold bg-white/5 border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
