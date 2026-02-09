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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="card-premium animate-scale-in mx-4 w-full max-w-sm p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
            <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Delete Task</h2>
            <p className="text-sm text-gray-500">This action cannot be undone</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-600">
          Are you sure you want to delete &quot;<span className="font-medium text-gray-900">{task.title}</span>&quot;?
        </p>

        {error && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-3">
            <svg className="h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn-secondary flex-1 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="btn-danger flex-1 text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Deleting...
              </span>
            ) : (
              "Delete Task"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
