"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import TaskForm from "@/components/task-form";
import TaskCard from "@/components/task-card";
import DeleteConfirm from "@/components/delete-confirm";

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

export default function DashboardPage() {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskData | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetchWithAuth("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch {
      // fetchWithAuth handles 401 redirect
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  function handleEdit(task: TaskData) {
    setEditingTask(task);
    setShowForm(true);
  }

  function handleDelete(task: TaskData) {
    setDeletingTask(task);
  }

  function handleFormSuccess() {
    setEditingTask(null);
    setShowForm(false);
    fetchTasks();
  }

  function handleDeleteSuccess() {
    setDeletingTask(null);
    fetchTasks();
  }

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            {tasks.length === 0
              ? "Get started by creating your first task"
              : `${tasks.length} task${tasks.length !== 1 ? "s" : ""} total`}
          </p>
        </div>
        {!showForm && !editingTask && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Task
          </button>
        )}
      </div>

      {/* Stats */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card-premium p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
            <p className="text-xs font-medium text-gray-500">Pending</p>
          </div>
          <div className="card-premium p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{inProgressCount}</p>
            <p className="text-xs font-medium text-gray-500">In Progress</p>
          </div>
          <div className="card-premium p-4 text-center">
            <p className="text-2xl font-bold text-emerald-500">{completedCount}</p>
            <p className="text-xs font-medium text-gray-500">Completed</p>
          </div>
        </div>
      )}

      {/* Form */}
      {(showForm || editingTask) && (
        <TaskForm
          task={editingTask || undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setEditingTask(null);
            setShowForm(false);
          }}
        />
      )}

      {/* Task List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="card-premium p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
              <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No tasks yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Create your first task to start organizing your work.
            </p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary mt-6 text-sm"
              >
                Create First Task
              </button>
            )}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={fetchTasks}
            />
          ))
        )}
      </div>

      {/* Delete Modal */}
      {deletingTask && (
        <DeleteConfirm
          task={deletingTask}
          onSuccess={handleDeleteSuccess}
          onCancel={() => setDeletingTask(null)}
        />
      )}
    </div>
  );
}
