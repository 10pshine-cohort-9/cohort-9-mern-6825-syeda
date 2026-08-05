import { useState, useEffect } from "react";

const NoteForm = ({ initialNote, onSubmit, onCancel }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(initialNote?.title || "");
    setContent(initialNote?.content || "");
  }, [initialNote]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({ title: title.trim(), content });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-fade-in-up"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-modal-in"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-['Space_Grotesk'] text-lg font-semibold text-gray-900">
              {initialNote ? "Edit Note" : "New Note"}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-700 transition-colors duration-150"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>
          )}

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFC93C] transition-shadow duration-150"
            autoFocus
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="Write your note..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFC93C] transition-shadow duration-150 resize-none"
          />

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-500 hover:text-gray-800 transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#FFC93C] hover:bg-[#f5bf2f] text-[#10151F] font-semibold rounded-lg disabled:opacity-50 transition-colors duration-150"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteForm;