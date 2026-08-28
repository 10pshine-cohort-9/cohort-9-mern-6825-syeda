import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ExportMenu from "./ExportMenu";

const NavIcon = ({ path }) => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const SparkleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="url(#notely-logo-grad)">
    <defs>
      <linearGradient id="notely-logo-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDB813" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
    </defs>
    <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
    <path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15z" opacity="0.85" />
  </svg>
);

const ICONS = {
  all: "M4 6h16M4 12h16M4 18h7",
  pinned: "M9 4v6l-2 4v2h10v-2l-2-4V4M12 16v5",
  trash: "M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16z",
  settings:
    "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
  plus: "M12 4v16m8-8H4",
  upload: "M12 16V4m0 0l-4 4m4-4l4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2",
};

const NavItem = ({ icon, label, count, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
      active
        ? "bg-gradient-to-r from-[#6C5CE7] to-[#A855F7] text-white shadow-lg shadow-purple-900/30"
        : "text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
    }`}
  >
    <span className="flex items-center gap-2.5">
      <NavIcon path={icon} />
      {label}
    </span>
    {typeof count === "number" && count > 0 && (
      <span className={`text-xs ${active ? "text-white/80" : "text-gray-400 dark:text-gray-500"}`}>{count}</span>
    )}
  </button>
);

const Sidebar = ({
  view,
  onViewChange,
  onNewNote,
  onImportClick,
  counts,
  mobileOpen,
  onMobileClose,
  syncStatus = { synced: true, label: "Just now" },
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onMobileClose?.();
    };
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen, onMobileClose]);

  const goToView = (v) => {
    if (location.pathname !== "/") navigate("/");
    onViewChange(v);
    onMobileClose?.();
  };

  const goToSettings = () => {
    navigate("/settings");
    onMobileClose?.();
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-[2px] z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw]
          lg:static lg:z-auto lg:w-64 lg:max-w-none lg:sticky lg:top-0 lg:h-screen
          shrink-0 bg-white dark:bg-[#14141f] border-r border-gray-100 dark:border-white/5 h-screen flex flex-col px-4 py-6
          transform transition-transform duration-200 ease-out overflow-y-auto
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        `}
      >
        <div className="flex items-center justify-between px-2 mb-6">
          <div className="flex items-center gap-2">
            <SparkleIcon />
            <div className="leading-tight">
              <p className="font-['Space_Grotesk'] font-bold text-base text-gray-900 dark:text-white">Notely</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">Your ideas, organized.</p>
            </div>
          </div>
          <button
            onClick={onMobileClose}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-full text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors duration-150"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        <button
          onClick={() => {
            onNewNote();
            onMobileClose?.();
          }}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#FDB813] via-[#FB7185] to-[#EC4899] hover:brightness-105 text-white font-semibold text-sm rounded-xl py-2.5 mb-6 shadow-lg shadow-pink-900/20 transition-[filter] duration-150"
        >
          <NavIcon path={ICONS.plus} />
          New Note
        </button>

        <nav className="flex flex-col gap-1">
          <NavItem icon={ICONS.all} label="All Notes" count={counts.all} active={view === "all"} onClick={() => goToView("all")} />
          <NavItem icon={ICONS.pinned} label="Pinned" count={counts.pinned} active={view === "pinned"} onClick={() => goToView("pinned")} />
          <NavItem icon={ICONS.trash} label="Trash" count={counts.trash} active={view === "trash"} onClick={() => goToView("trash")} />
        </nav>

        <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
          <button
            onClick={() => {
              onImportClick();
              onMobileClose?.();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors duration-150"
          >
            <NavIcon path={ICONS.upload} />
            Import Notes
          </button>
          <ExportMenu />
        </div>

        <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-gray-100 dark:border-white/5">
          <NavItem
            icon={ICONS.settings}
            label="Settings"
            active={location.pathname.startsWith("/settings")}
            onClick={goToSettings}
          />
        </div>

        <div className="mt-3 flex items-center gap-2.5 bg-black/[0.03] dark:bg-white/5 rounded-xl px-3 py-3">
          <span
            className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${
              syncStatus.synced
                ? "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                : "bg-gray-400/15 text-gray-500 dark:bg-gray-500/20 dark:text-gray-400"
            }`}
          >
            <CheckIcon />
          </span>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-gray-900 dark:text-white">
              {syncStatus.synced ? "All notes synced" : "Syncing…"}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">{syncStatus.label}</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;