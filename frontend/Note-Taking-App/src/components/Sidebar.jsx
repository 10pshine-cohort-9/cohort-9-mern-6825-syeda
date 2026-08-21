import ExportMenu from "./ExportMenu";

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
  settings:
    "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
  help: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  plus: "M12 4v16m8-8H4",
  upload: "M12 16V4m0 0l-4 4m4-4l4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2",
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

const Sidebar = ({ view, onViewChange, onNewNote, onImportClick, counts }) => {
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

      <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-gray-100">
        <ExportMenu />
        <button
          onClick={onImportClick}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-150"
        >
          <NavIcon path={ICONS.upload} />
          Import Notes
        </button>
      </div>

      <div className="mt-auto flex flex-col gap-1 pt-6 border-t border-gray-100">
        <NavItem icon={ICONS.settings} label="Settings" active={false} onClick={() => {}} />
        <NavItem icon={ICONS.help} label="Help" active={false} onClick={() => {}} />
      </div>
    </aside>
  );
};

export default Sidebar;