import { useState } from "react";
import DOMPurify from "dompurify";
import ConfirmDialog from "./ConfirmDialog";
import "./richTextContent.css";

const PinIcon = ({ filled }) => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 17v5M9 3h6l-1 6 4 3H6l4-3-1-6z" />
  </svg>
);
const TrashIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16z" />
  </svg>
);
const RestoreIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
  </svg>
);

/**
 * NoteCard
 * Same props as before: note, view ("all" | "pinned" | "trash"),
 * onOpen, onTogglePin, onTrash, onRestore, onPermanentDelete.
 * note.content is now sanitized HTML from the rich text editor.
 * Trash + permanent delete now require confirmation.
 */
const NoteCard = ({ note, view, onOpen, onTogglePin, onTrash, onRestore, onPermanentDelete }) => {
  const [confirmAction, setConfirmAction] = useState(null); // "trash" | "delete" | null

  const cleanHtml = DOMPurify.sanitize(note.content || "", {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3",
      "ul", "ol", "li", "blockquote", "a", "code", "mark", "hr",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
  });

  const stopPropagation = (fn) => (e) => {
    e.stopPropagation();
    fn();
  };

  const handleConfirm = () => {
    if (confirmAction === "trash") onTrash(note._id);
    if (confirmAction === "delete") onPermanentDelete(note._id);
    setConfirmAction(null);
  };

  return (
    <div
      onClick={() => onOpen(note)}
      className={`group relative bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-150 ${
        view === "trash" ? "cursor-default" : "cursor-pointer"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-['Space_Grotesk'] font-semibold text-[#10151F] text-sm truncate">
          {note.title}
        </h3>
        {view !== "trash" && (
          <button
            onClick={stopPropagation(() => onTogglePin(note))}
            title={note.pinned ? "Unpin" : "Pin"}
            className={`shrink-0 p-1 rounded-full transition-colors duration-150 ${
              note.pinned
                ? "text-[#FFC93C]"
                : "text-gray-300 opacity-0 group-hover:opacity-100 hover:text-[#FFC93C]"
            }`}
          >
            <PinIcon filled={note.pinned} />
          </button>
        )}
      </div>

      <div
        className="rich-content text-sm text-gray-500 line-clamp-4 [&_a]:text-[#E8553D]"
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />

      <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-gray-50">
        {view === "trash" ? (
          <>
            <button
              onClick={stopPropagation(() => onRestore(note._id))}
              title="Restore"
              className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-[#10151F] px-2 py-1 rounded-md hover:bg-gray-100 transition-colors duration-150"
            >
              <RestoreIcon /> Restore
            </button>
            <button
              onClick={stopPropagation(() => setConfirmAction("delete"))}
              title="Delete forever"
              className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 px-2 py-1 rounded-md hover:bg-red-50 transition-colors duration-150"
            >
              <TrashIcon /> Delete forever
            </button>
          </>
        ) : (
          <button
            onClick={stopPropagation(() => setConfirmAction("trash"))}
            title="Move to trash"
            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red-600 px-2 py-1 rounded-md hover:bg-red-50 transition-colors duration-150"
          >
            <TrashIcon />
          </button>
        )}
      </div>

      {confirmAction === "trash" && (
        <ConfirmDialog
          title="Move note to trash?"
          message={`"${note.title}" will be moved to Trash. You can restore it later.`}
          confirmLabel="Move to trash"
          danger
          onConfirm={stopPropagation(handleConfirm)}
          onCancel={stopPropagation(() => setConfirmAction(null))}
        />
      )}

      {confirmAction === "delete" && (
        <ConfirmDialog
          title="Delete forever?"
          message={`"${note.title}" will be permanently deleted. This action cannot be undone.`}
          confirmLabel="Delete forever"
          danger
          onConfirm={stopPropagation(handleConfirm)}
          onCancel={stopPropagation(() => setConfirmAction(null))}
        />
      )}
    </div>
  );
};

export default NoteCard;