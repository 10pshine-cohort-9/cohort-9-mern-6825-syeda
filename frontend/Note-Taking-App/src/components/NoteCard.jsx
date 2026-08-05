const ACCENT_COLORS = ["#FFC93C", "#E8553D", "#4F8CFF", "#2FBF8F", "#B57BFF"];

const getAccent = (id) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return ACCENT_COLORS[Math.abs(hash) % ACCENT_COLORS.length];
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  if (isToday) return "Today";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const PinIcon = ({ filled }) => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 4v6l-2 4v2h10v-2l-2-4V4M12 16v5" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16z" />
  </svg>
);

const RestoreIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 1 0 2.6-6.4M3 4v5h5" />
  </svg>
);

const NoteCard = ({ note, view, onOpen, onTogglePin, onTrash, onRestore, onPermanentDelete }) => {
  const preview = note.content?.length > 110 ? `${note.content.slice(0, 110)}...` : note.content;
  const accent = getAccent(note._id);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(note);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(note)}
      onKeyDown={handleKeyDown}
      aria-label={`Open note: ${note.title}`}
      style={{ borderLeftColor: accent }}
      className="group bg-white rounded-xl shadow-sm hover:shadow-md focus:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC93C] border-l-4 p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 animate-fade-in-up"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-['Space_Grotesk'] font-semibold text-gray-900 line-clamp-1">
          {note.title}
        </h3>
        {view !== "trash" && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(note);
            }}
            aria-pressed={note.pinned}
            aria-label={note.pinned ? "Unpin note" : "Pin note"}
            className={`shrink-0 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC93C] rounded ${
              note.pinned ? "text-[#E8553D]" : "text-gray-300 hover:text-gray-500"
            }`}
          >
            <PinIcon filled={note.pinned} />
          </button>
        )}
      </div>

      <p className="text-gray-500 text-sm mt-1.5 line-clamp-3 whitespace-pre-line">
        {preview || "No content yet."}
      </p>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
        <span className="text-xs text-gray-400">{formatDate(note.updatedAt)}</span>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
          {view === "trash" ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore(note._id);
                }}
                className="text-gray-400 hover:text-green-600 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC93C] rounded"
                title="Restore"
                aria-label="Restore note"
              >
                <RestoreIcon />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPermanentDelete(note._id);
                }}
                className="text-gray-400 hover:text-red-600 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC93C] rounded"
                title="Delete permanently"
                aria-label="Delete note permanently"
              >
                <TrashIcon />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTrash(note._id);
              }}
              className="text-gray-400 hover:text-red-600 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC93C] rounded"
              title="Move to trash"
              aria-label="Move note to trash"
            >
              <TrashIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteCard;