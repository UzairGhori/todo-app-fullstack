"use client";

import { useState } from "react";
import { fetchWithAuth } from "@/lib/api";

interface TaskData {
  id?: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
}

interface TaskFormProps {
  task?: TaskData;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function TaskForm({ task, onSuccess, onCancel }: TaskFormProps) {
  const isEditing = !!task;
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState(task?.status || "pending");
  const [priority, setPriority] = useState(task?.priority || "medium");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);

    try {
      const body = {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
      };

      if (isEditing) {
        const res = await fetchWithAuth(`/api/tasks/${task.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || "Failed to update task");
        }
      } else {
        const res = await fetchWithAuth("/api/tasks", {
          method: "POST",
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || "Failed to create task");
        }
      }

      if (!isEditing) {
        setTitle("");
        setDescription("");
        setStatus("pending");
        setPriority("medium");
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card-premium animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/[0.08] bg-[#1A2035] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isEditing ? "bg-[#F6C445]/15" : "bg-[#F6C445]/15"}`}>
            {isEditing ? (
              <svg className="h-4 w-4 text-[#F6C445]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-[#F6C445]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            )}
          </div>
          <h2 className="text-lg font-bold text-[#F1F5F9]">
            {isEditing ? "Edit Task" : "Create New Task"}
          </h2>
        </div>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
            <svg className="h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm font-medium text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-semibold text-[#94A3B8]">
              Task Title <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={255}
              placeholder="What needs to be done?"
              className="input-premium"
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-semibold text-[#94A3B8]">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="Add more details about this task..."
              className="input-premium resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="mb-2 block text-sm font-semibold text-[#94A3B8]">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="select-premium"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="mb-2 block text-sm font-semibold text-[#94A3B8]">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="select-premium"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary text-sm">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0A0E1A]/30 border-t-[#0A0E1A]" />
                {isEditing ? "Updating..." : "Creating..."}
              </span>
            ) : isEditing ? (
              "Update Task"
            ) : (
              "Create Task"
            )}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-secondary text-sm">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
