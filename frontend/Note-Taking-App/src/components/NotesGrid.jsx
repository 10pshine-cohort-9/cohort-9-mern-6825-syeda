import NoteCard from "./NoteCard";

/**
 * NotesGrid — pulls the view-switch rendering logic (all / pinned / trash,
 * plus empty states) out of Dashboard.
 */
const NotesGrid = ({ view, search, loading, filteredActive, filteredTrash, cardProps }) => {
  const pinnedNotes = filteredActive.filter((n) => n.pinned);
  const unpinnedNotes = filteredActive.filter((n) => !n.pinned);

  if (loading) {
    return <p className="text-gray-400 text-sm">Loading notes...</p>;
  }

  if (view === "trash") {
    if (filteredTrash.length === 0) {
      return <p className="text-gray-400 text-sm">Trash is empty.</p>;
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTrash.map((note) => (
          <NoteCard key={note._id} note={note} view="trash" {...cardProps} />
        ))}
      </div>
    );
  }

  if (view === "pinned") {
    if (pinnedNotes.length === 0) {
      return <p className="text-gray-400 text-sm">No pinned notes yet.</p>;
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pinnedNotes.map((note) => (
          <NoteCard key={note._id} note={note} view="pinned" {...cardProps} />
        ))}
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
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
          All Notes
        </h2>
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