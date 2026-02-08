"use client";

interface TaskData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  created_at: string;
}

interface TaskCardProps {
  task: TaskData;
  onEdit: (task: TaskData) => void;
  onDelete: (task: TaskData) => void;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-orange-100 text-orange-700",
  high: "bg-red-100 text-red-700",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-gray-900">{task.title}</h3>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
              {task.description}
            </p>
          )}
        </div>
        <div className="ml-4 flex gap-2">
          <button
            onClick={() => onEdit(task)}
            className="rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task)}
            className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[task.status] || ""}`}
        >
          {STATUS_LABELS[task.status] || task.status}
        </span>
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[task.priority] || ""}`}
        >
          {PRIORITY_LABELS[task.priority] || task.priority}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(task.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
