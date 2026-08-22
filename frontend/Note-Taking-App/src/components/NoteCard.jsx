import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
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

const WarnIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.731 0 2.814-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

// Copy for the two destructive actions this card can confirm.
const CONFIRM_COPY = {
  trash: {
    title: "Move to trash?",
    body: "You can restore it from the trash later.",
    confirmLabel: "Move to trash",
  },
  permanent: {
    title: "Delete forever?",
    body: "This can't be undone — the note will be permanently deleted.",
    confirmLabel: "Delete forever",
  },
};

/**
 * DeleteConfirmModal — small centered dialog asking the user to confirm
 * before trashing or permanently deleting a note. Mirrors the logout
 * confirmation pattern used elsewhere in the app (DashboardHeader /
 * SettingsPage) so destructive actions feel consistent throughout.
 */
const DeleteConfirmModal = ({ mode, onConfirm, onCancel }) => {
  const copy = CONFIRM_COPY[mode];

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      onClick={(e) => e.stopPropagation()}
    >
      <style>{`
        @keyframes modalBackdropIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalPopIn {
          from { opacity: 0; transform: scale(0.95) translateY(4px); }
          to { opacity: 1; transform: none; }
        }
        .modal-backdrop-in { animation: modalBackdropIn 150ms ease-out both; }
        .modal-pop-in { animation: modalPopIn 180ms cubic-bezier(0.32, 0.72, 0, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .modal-backdrop-in, .modal-pop-in { animation: none; }
        }
      `}</style>

      <div className="modal-backdrop-in absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onCancel} />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
        className="modal-pop-in relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="px-6 pt-6 pb-5 flex flex-col items-center text-center">
          <div className="w-11 h-11 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-3">
            <WarnIcon />
          </div>
          <p id="delete-confirm-title" className="font-['Space_Grotesk'] font-bold text-base text-[#10151F]">
            {copy.title}
          </p>
          <p className="text-sm text-gray-500 mt-1.5">{copy.body}</p>
        </div>

        <div className="p-3 pt-0 flex items-center gap-2">
          <button
            onClick={onCancel}
            className="flex-1 h-10 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-10 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors duration-150"
          >
            {copy.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * NoteCard
 * Same props as before: note, view ("all" | "pinned" | "trash"),
 * onOpen, onTogglePin, onTrash, onRestore, onPermanentDelete.
 * note.content is now sanitized HTML from the rich text editor.
 * "Move to trash" and "Delete forever" now go through a confirmation
 * modal instead of firing immediately.
 */
const NoteCard = ({ note, view, onOpen, onTogglePin, onTrash, onRestore, onPermanentDelete }) => {
  const [confirmMode, setConfirmMode] = useState(null); // null | "trash" | "permanent"

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
    if (confirmMode === "trash") onTrash(note._id);
    if (confirmMode === "permanent") onPermanentDelete(note._id);
    setConfirmMode(null);
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
              onClick={stopPropagation(() => setConfirmMode("permanent"))}
              title="Delete forever"
              className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 px-2 py-1 rounded-md hover:bg-red-50 transition-colors duration-150"
            >
              <TrashIcon /> Delete forever
            </button>
          </>
        ) : (
          <button
            onClick={stopPropagation(() => setConfirmMode("trash"))}
            title="Move to trash"
            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red-600 px-2 py-1 rounded-md hover:bg-red-50 transition-colors duration-150"
          >
            <TrashIcon />
          </button>
        )}
      </div>

      {confirmMode && (
        <DeleteConfirmModal
          mode={confirmMode}
          onConfirm={stopPropagation(handleConfirm)}
          onCancel={stopPropagation(() => setConfirmMode(null))}
        />
      )}
    </div>
  );
};

export default NoteCard;