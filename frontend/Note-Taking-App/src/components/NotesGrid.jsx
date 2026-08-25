import NoteCard from "./NoteCard";
import SortDropdown from "./SortDropdown";

/**
 * NotesGrid — pulls the view-switch rendering logic (all / pinned / trash,
 * plus empty states) out of Dashboard. Sort dropdown sits next to the
 * section heading (e.g. "ALL NOTES").
 */
const NotesGrid = ({
  view,
  search,
  loading,
  filteredActive,
  filteredTrash,
  sortBy,
  onSortChange,
  cardProps,
}) => {
  const pinnedNotes = filteredActive.filter((n) => n.pinned);
  const unpinnedNotes = filteredActive.filter((n) => !n.pinned);

  if (loading) {
    return <p className="text-gray-400 text-sm">Loading notes...</p>;
  }

  if (view === "trash") {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Trash</h2>
        </div>
        {filteredTrash.length === 0 ? (
          <p className="text-gray-400 text-sm">Trash is empty.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTrash.map((note) => (
              <NoteCard key={note._id} note={note} view="trash" {...cardProps} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === "pinned") {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Pinned</h2>
          <SortDropdown value={sortBy} onChange={onSortChange} />
        </div>
        {pinnedNotes.length === 0 ? (
          <p className="text-gray-400 text-sm">No pinned notes yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map((note) => (
              <NoteCard key={note._id} note={note} view="pinned" {...cardProps} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (filteredActive.length === 0) {
    return (
      <p className="text-gray-400 text-sm">
        {search ? "No notes match your search." : "No notes yet. Create your first one!"}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {pinnedNotes.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            Pinned Notes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map((note) => (
              <NoteCard key={note._id} note={note} view="all" {...cardProps} />
            ))}
          </div>
        </section>
      )}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            All Notes
          </h2>
          <SortDropdown value={sortBy} onChange={onSortChange} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {unpinnedNotes.map((note) => (
            <NoteCard key={note._id} note={note} view="all" {...cardProps} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default NotesGrid;