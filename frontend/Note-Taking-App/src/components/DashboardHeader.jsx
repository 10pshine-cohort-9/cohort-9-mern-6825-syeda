import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";

const SearchIcon = () => (
  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="7" />
    <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const WarnIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.731 0 2.814-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

const formatDate = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const labelClass = "text-[10.5px] font-mono uppercase tracking-wider text-gray-400";

/**
 * LogoutConfirmModal — small centered dialog asking the user to confirm
 * before actually signing out. Shared by both the standalone logout icon
 * and the profile drawer's "Log out" button.
 */
const LogoutConfirmModal = ({ onConfirm, onCancel }) => {
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
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
        aria-labelledby="logout-confirm-title"
        className="modal-pop-in relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="px-6 pt-6 pb-5 flex flex-col items-center text-center">
          <div className="w-11 h-11 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-3">
            <WarnIcon />
          </div>
          <p id="logout-confirm-title" className="font-['Space_Grotesk'] font-bold text-base text-[#10151F]">
            Log out?
          </p>
          <p className="text-sm text-gray-500 mt-1.5">
            You'll need to sign in again to access your notes.
          </p>
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
            Yes, log out
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * ProfileDrawer — full-height slide-over shown when the user chip is pressed.
 * Reads phone/location/bio/avatar from useProfile (the same source the
 * full Settings page edits), real name/email/createdAt from the user, and
 * note stats from `counts` (same object the Sidebar uses).
 */
const ProfileDrawer = ({ user, profile, counts, onClose, onLogoutRequest }) => {
  const navigate = useNavigate();
  const memberSince = formatDate(user?.createdAt);
  const hasDetails = profile.phone || profile.location || profile.bio;

  const stats = [
    { label: "Total notes", value: counts?.all ?? 0 },
    { label: "Pinned", value: counts?.pinned ?? 0 },
    { label: "Trash", value: counts?.trash ?? 0 },
  ];

  return (
    <div className="fixed inset-0 z-[60]">
      <style>{`
        @keyframes drawerBackdropIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes drawerPanelIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .drawer-backdrop-in { animation: drawerBackdropIn 150ms ease-out both; }
        .drawer-panel-in { animation: drawerPanelIn 220ms cubic-bezier(0.32, 0.72, 0, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .drawer-backdrop-in, .drawer-panel-in { animation: none; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="drawer-backdrop-in absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="drawer-panel-in absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/90 text-gray-500 hover:bg-white hover:text-gray-800 shadow-sm transition-colors duration-150"
          aria-label="Close profile"
        >
          <CloseIcon />
        </button>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Big avatar banner */}
          <div className="relative bg-[#10151F] pt-14 pb-8 px-6 flex flex-col items-center text-center">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt=""
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white/10 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#FFC93C] flex items-center justify-center shadow-lg">
                <span className="font-['Space_Grotesk'] text-3xl font-bold text-[#10151F]">
                  {getInitials(user?.name)}
                </span>
              </div>
            )}
            <p className="font-['Space_Grotesk'] font-bold text-lg text-white mt-4">
              {user?.name || "—"}
            </p>
            <p className="text-sm text-white/60 break-all">{user?.email || "—"}</p>

            {memberSince && (
              <div className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 border border-dashed border-white/25 rounded-md -rotate-1 font-mono text-[10px] uppercase tracking-wider text-white/60 mt-4">
                Member since {memberSince}
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 border-b border-gray-100">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`py-5 flex flex-col items-center gap-0.5 ${
                  i !== stats.length - 1 ? "border-r border-gray-100" : ""
                }`}
              >
                <span className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-[#10151F]">
                  {s.value}
                </span>
                <span className={labelClass}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Details */}
          <div className="px-6 py-5 flex flex-col gap-4">
            {profile.phone && (
              <div>
                <p className={labelClass}>Phone</p>
                <p className="text-sm text-gray-700 mt-0.5">{profile.phone}</p>
              </div>
            )}
            {profile.location && (
              <div>
                <p className={labelClass}>Location</p>
                <p className="text-sm text-gray-700 mt-0.5">{profile.location}</p>
              </div>
            )}
            {profile.bio && (
              <div>
                <p className={labelClass}>Bio</p>
                <p className="text-sm text-gray-600 italic leading-snug mt-0.5">
                  “{profile.bio}”
                </p>
              </div>
            )}
            {!hasDetails && (
              <p className="text-xs text-gray-400">
                No extra details yet — add a phone, location, or bio from your profile.
              </p>
            )}
          </div>
        </div>

        {/* Actions (pinned to bottom) */}
        <div className="p-4 border-t border-gray-100 flex items-center gap-2">
          <button
            onClick={() => {
              onClose();
              navigate("/settings");
            }}
            className="flex-1 h-10 text-sm font-semibold text-[#10151F] bg-[#FFC93C] rounded-lg hover:bg-[#f5bf2f] transition-colors duration-150"
          >
            Edit profile
          </button>
          <button
            onClick={onLogoutRequest}
            className="flex items-center justify-center gap-1.5 h-10 px-4 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-150"
          >
            <LogoutIcon />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * DashboardHeader — hamburger (mobile only) + search input + logged-in user chip.
 * `onMenuClick` opens the Sidebar's mobile drawer (owned by the parent page).
 * Pressing the avatar or name opens a full-height profile drawer with real
 * account details and note stats. Both the standalone logout icon and the
 * drawer's "Log out" button now route through a confirmation modal — the
 * real `onLogout` prop only fires once the user confirms.
 */
const DashboardHeader = ({ search, onSearchChange, user, onLogout, counts, onMenuClick }) => {
  const { profile } = useProfile();
  const [open, setOpen] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  // Lock body scroll while the profile drawer is open, and support Escape.
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const requestLogout = () => setConfirmingLogout(true);

  const confirmLogout = () => {
    setConfirmingLogout(false);
    setOpen(false);
    onLogout();
  };

  return (
    <div className="flex items-center justify-between gap-3 sm:gap-6 mb-6">
      {/* Hamburger — mobile / tablet only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-150"
        aria-label="Open menu"
      >
        <MenuIcon />
      </button>

      <div className="relative flex-1 min-w-0 max-w-md">
        <span className="absolute left-3 top-1/2 -translate-y-1/2">
          <SearchIcon />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search notes..."
          className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C] transition-shadow duration-150"
        />
      </div>

      <div className="relative shrink-0">
        <div className="flex items-center gap-1 sm:gap-2.5 bg-white border border-gray-100 rounded-full pl-1.5 pr-1 py-1 shadow-sm">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 sm:gap-2.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC93C]"
            aria-haspopup="true"
            aria-expanded={open}
          >
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#10151F] flex items-center justify-center shrink-0">
                <span className="font-['Space_Grotesk'] text-xs font-bold text-[#FFC93C]">
                  {user?.name?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>
            )}
            <span className="text-sm font-medium text-gray-700 hidden md:block pr-1">
              {user?.name}
            </span>
          </button>
          <button
            onClick={requestLogout}
            className="flex items-center justify-center w-7 h-7 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
            title="Log out"
          >
            <LogoutIcon />
          </button>
        </div>

        {open && (
          <ProfileDrawer
            user={user}
            profile={profile}
            counts={counts}
            onClose={() => setOpen(false)}
            onLogoutRequest={requestLogout}
          />
        )}
      </div>

      {confirmingLogout && (
        <LogoutConfirmModal
          onConfirm={confirmLogout}
          onCancel={() => setConfirmingLogout(false)}
        />
      )}
    </div>
  );
};

export default DashboardHeader;