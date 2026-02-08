"use client";

import { useState } from "react";
import { fetchWithAuth } from "@/lib/api";

interface DeleteConfirmProps {
  task: { id: string; title: string };
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DeleteConfirm({
  task,
  onSuccess,
  onCancel,
}: DeleteConfirmProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setLoading(true);
    setError("");

    try {
      const res = await fetchWithAuth(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });
      if (res.status === 204 || res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        throw new Error(data.detail || "Failed to delete task");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">Delete Task</h2>
        <p className="mt-2 text-sm text-gray-600">
          Are you sure you want to delete &quot;{task.title}&quot;? This action
          cannot be undone.
        </p>

        {error && (
          <div className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
