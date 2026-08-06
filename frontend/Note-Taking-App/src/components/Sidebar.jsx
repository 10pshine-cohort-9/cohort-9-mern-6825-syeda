const NavIcon = ({ path }) => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const ICONS = {
  all: "M4 6h16M4 12h16M4 18h7",
  pinned: "M9 4v6l-2 4v2h10v-2l-2-4V4M12 16v5",
  trash: "M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16z",
  plus: "M12 4v16m8-8H4",
};

const NavItem = ({ icon, label, count, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
      active
        ? "bg-[#FFC93C]/20 text-[#10151F]"
        : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
    }`}
  >
    <span className="flex items-center gap-2.5">
      <NavIcon path={icon} />
      {label}
    </span>
    {typeof count === "number" && count > 0 && (
      <span className="text-xs text-gray-400">{count}</span>
    )}
  </button>
);

const Sidebar = ({ view, onViewChange, onNewNote, counts }) => {
  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-100 h-screen sticky top-0 flex flex-col px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-6">
        <span className="w-2 h-2 rounded-full bg-[#E8553D]" />
        <span className="font-['Space_Grotesk'] font-bold text-lg text-[#10151F]">
          Library
        </span>
      </div>

      <button
        onClick={onNewNote}
        className="flex items-center justify-center gap-2 bg-[#FFC93C] hover:bg-[#f5bf2f] text-[#10151F] font-semibold text-sm rounded-lg py-2.5 mb-6 transition-colors duration-150"
      >
        <NavIcon path={ICONS.plus} />
        New Note
      </button>

      <nav className="flex flex-col gap-1">
        <NavItem
          icon={ICONS.all}
          label="All Notes"
          count={counts.all}
          active={view === "all"}
          onClick={() => onViewChange("all")}
        />
        <NavItem
          icon={ICONS.pinned}
          label="Pinned"
          count={counts.pinned}
          active={view === "pinned"}
          onClick={() => onViewChange("pinned")}
        />
        <NavItem
          icon={ICONS.trash}
          label="Trash"
          count={counts.trash}
          active={view === "trash"}
          onClick={() => onViewChange("trash")}
        />
      </nav>

      {/*
        Settings and Help are intentionally omitted until real destinations
        exist for them — wiring them to no-op handlers gave users dead
        buttons with no feedback. Re-add once routes/pages are implemented.
      */}
    </aside>
  );
};

export default Sidebar;