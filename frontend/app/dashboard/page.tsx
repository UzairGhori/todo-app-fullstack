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
  }

  function handleDelete(task: TaskData) {
    setDeletingTask(task);
  }

  function handleFormSuccess() {
    setEditingTask(null);
    fetchTasks();
  }

  function handleDeleteSuccess() {
    setDeletingTask(null);
    fetchTasks();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {editingTask ? (
        <TaskForm
          task={editingTask}
          onSuccess={handleFormSuccess}
          onCancel={() => setEditingTask(null)}
        />
      ) : (
        <TaskForm onSuccess={handleFormSuccess} />
      )}

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-500">
              No tasks yet. Create your first task!
            </p>
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
