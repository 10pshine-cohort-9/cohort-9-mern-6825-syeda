import { useState } from "react";
import RichTextEditor from "./RichTextEditor";

/**
 * NoteForm — modal for creating/editing a note.
 * Same public contract as before: initialNote, onSubmit(data), onCancel().
 * `content` is now an HTML string produced by the rich text editor.
 */
const NoteForm = ({ initialNote, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(initialNote?.title || "");
  const [content, setContent] = useState(initialNote?.content || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isEmpty = (html) => {
    const stripped = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, "").trim();
    return stripped.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Give your note a title.");
      return;
    }
    if (isEmpty(content)) {
      setError("Your note can't be empty.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), content });
    } catch (err) {
      setError("Failed to save note. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#10151F]">
              {initialNote ? "Edit note" : "New note"}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-[#10151F] transition-colors duration-150"
              title="Close"
            >
              ✕
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              className="w-full text-lg font-semibold text-[#10151F] placeholder:text-gray-300 focus:outline-none border-b border-transparent focus:border-[#FFC93C] pb-1 transition-colors duration-150"
              autoFocus
            />

            <RichTextEditor content={content} onChange={setContent} />

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-500 rounded-lg hover:bg-gray-100 transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#10151F] text-[#FFC93C] hover:opacity-90 transition-opacity duration-150 disabled:opacity-50"
            >
              {submitting ? "Saving..." : initialNote ? "Save changes" : "Create note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteForm;