import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";
import ProfileModal from "./ProfileModal";

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

/**
 * DashboardHeader — search input + logged-in user chip with logout.
 * Clicking the avatar/name opens the ProfileModal; the logout icon
 * still requires a separate confirmation dialog.
 */
const DashboardHeader = ({ search, onSearchChange, user, onLogout }) => {
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleConfirm = () => {
    setConfirmLogout(false);
    onLogout();
  };

  return (
    <div className="flex items-center justify-between gap-6 mb-6">
      <div className="relative flex-1 max-w-md">
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

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-full pl-1.5 pr-1 py-1 shadow-sm">
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2.5 rounded-full pr-1 hover:opacity-80 transition-opacity duration-150"
            title="View profile"
          >
            <div className="w-7 h-7 rounded-full bg-[#10151F] flex items-center justify-center shrink-0">
              <span className="font-['Space_Grotesk'] text-xs font-bold text-[#FFC93C]">
                {user?.name?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {user?.name}
            </span>
          </button>
          <button
            onClick={() => setConfirmLogout(true)}
            className="flex items-center justify-center w-7 h-7 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
            title="Log out"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>

      {confirmLogout && (
        <ConfirmDialog
          title="Log out?"
          message="You'll need to sign in again to access your notes."
          confirmLabel="Log out"
          danger
          onConfirm={handleConfirm}
          onCancel={() => setConfirmLogout(false)}
        />
      )}

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  );
};

export default DashboardHeader;