"use client";

import { useState } from "react";
import { fetchWithAuth } from "@/lib/api";

interface TaskData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface TaskCardProps {
  task: TaskData;
  onEdit: (task: TaskData) => void;
  onDelete: (task: TaskData) => void;
  onToggle: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; class: string; dot: string }> = {
  pending: { label: "Pending", class: "badge-pending", dot: "bg-[#fbbf24]" },
  in_progress: { label: "In Progress", class: "badge-in-progress", dot: "bg-[#60a5fa]" },
  completed: { label: "Completed", class: "badge-completed", dot: "bg-[#4ade80]" },
};

const PRIORITY_CONFIG: Record<string, { label: string; class: string }> = {
  low: { label: "Low", class: "badge-low" },
  medium: { label: "Medium", class: "badge-medium" },
  high: { label: "High", class: "badge-high" },
};

export default function TaskCard({ task, onEdit, onDelete, onToggle }: TaskCardProps) {
  const [toggling, setToggling] = useState(false);
  const isCompleted = task.status === "completed";
  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

  async function handleToggle() {
    setToggling(true);
    try {
      const res = await fetchWithAuth(`/api/tasks/${task.id}/complete`, {
        method: "PATCH",
      });
      if (res.ok) onToggle();
    } catch {
      // fetchWithAuth handles 401
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className={`card-premium animate-fade-in overflow-hidden p-5 ${isCompleted ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-4">
        {/* Toggle Checkbox */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`group mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
            isCompleted
              ? "border-[#4ade80] bg-[#4ade80]"
              : "border-[#64748B] hover:border-[#F6C445] hover:bg-[#F6C445]/10"
          }`}
        >
          {isCompleted ? (
            <svg className="h-3.5 w-3.5 text-[#0A0E1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-3 w-3 text-transparent group-hover:text-[#F6C445]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className={`text-base font-semibold ${isCompleted ? "text-[#64748B] line-through" : "text-[#F1F5F9]"}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className={`mt-1 line-clamp-2 text-sm leading-relaxed ${isCompleted ? "text-[#64748B]" : "text-[#94A3B8]"}`}>
                  {task.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => onEdit(task)}
                className="rounded-lg p-2 text-[#64748B] transition-colors hover:bg-[#F6C445]/10 hover:text-[#F6C445]"
                title="Edit task"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(task)}
                className="rounded-lg p-2 text-[#64748B] transition-colors hover:bg-red-500/10 hover:text-red-400"
                title="Delete task"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>

          {/* Badges */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`badge ${status.class}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <span className={`badge ${priority.class}`}>
              {priority.label}
            </span>
            <span className="text-xs text-[#64748B]">
              {new Date(task.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
