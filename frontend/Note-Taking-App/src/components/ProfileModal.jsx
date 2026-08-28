import { useEffect } from "react";
import { X, Mail, Phone, MapPin, FileText, Pin, Trash2, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotes } from "../hooks/useNotes";
import { useProfile } from "../hooks/useProfile";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const labelClass = "text-[10.5px] font-mono uppercase tracking-wider text-gray-400 dark:text-gray-500";

/** Small pill row used for email / phone / location */
const InfoRow = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/[0.04]">
    <div className="w-7 h-7 rounded-md bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center shrink-0">
      <Icon size={13} className="text-gray-500 dark:text-gray-400" />
    </div>
    <span className="text-sm text-gray-700 dark:text-gray-200 truncate">{children}</span>
  </div>
);

/** Colored mini stat card, echoes the StatCard used on the Settings overview tab */
const MiniStat = ({ icon: Icon, label, value, accent }) => (
  <div
    className="relative flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-lg overflow-hidden bg-white dark:bg-[#14141f] border border-gray-100 dark:border-white/5 min-w-0"
  >
    <span className="absolute left-0 top-0 right-0 h-[3px]" style={{ backgroundColor: accent.bar }} />
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center mb-0.5"
      style={{ backgroundColor: accent.bg }}
    >
      <Icon size={13} style={{ color: accent.icon }} />
    </div>
    <span className="font-['Space_Grotesk'] font-bold text-base text-gray-900 dark:text-white leading-none">
      {value}
    </span>
    <span className={labelClass}>{label}</span>
  </div>
);

/**
 * ProfileModal — centered dialog showing the signed-in user's avatar,
 * contact info, bio, and a quick notes summary. Triggered from the
 * avatar chip in DashboardHeader.
 */
const ProfileModal = ({ onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { notes, trashedNotes } = useNotes();

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const pinnedCount = notes.filter((n) => n.pinned).length;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <style>{`
        @keyframes profileBackdropIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes profilePopIn {
          from { opacity: 0; transform: scale(0.94) translateY(6px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes avatarRingPulse {
          0% { box-shadow: 0 0 0 0 rgba(253,184,19,0.35); }
          100% { box-shadow: 0 0 0 8px rgba(253,184,19,0); }
        }
        .profile-backdrop-in { animation: profileBackdropIn 150ms ease-out both; }
        .profile-pop-in { animation: profilePopIn 220ms cubic-bezier(0.32, 0.72, 0, 1) both; }
        .avatar-ring-pulse { animation: avatarRingPulse 1.8s ease-out 1; }
        @media (prefers-reduced-motion: reduce) {
          .profile-backdrop-in, .profile-pop-in, .avatar-ring-pulse { animation: none; }
        }
      `}</style>

      <div
        className="profile-backdrop-in absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-[3px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        className="profile-pop-in relative w-full max-w-sm bg-white dark:bg-[#191924] rounded-2xl shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white/90 bg-black/20 hover:bg-black/35 backdrop-blur-sm transition-colors duration-150"
        >
          <X size={16} />
        </button>

        {/* Gradient cover with dot-grid texture */}
        <div
          style={{
            height: "96px",
            backgroundImage:
              "linear-gradient(135deg, #FDB813 0%, #FB7185 55%, #6C5CE7 100%), radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1.4px)",
            backgroundBlendMode: "overlay",
            backgroundSize: "auto, 14px 14px",
          }}
        />

        <div className="px-6 pb-6">
          {/* Avatar + name, overlapping the cover */}
          <div className="flex items-end gap-3.5 -mt-10 mb-5">
            <div className="avatar-ring-pulse rounded-full shrink-0">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-white dark:ring-[#191924] shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FDB813] via-[#FB7185] to-[#6C5CE7] text-white flex items-center justify-center font-['Space_Grotesk'] font-bold text-2xl ring-4 ring-white dark:ring-[#191924] shadow-md">
                  {getInitials(user?.name)}
                </div>
              )}
            </div>
            <div className="pb-1.5 min-w-0">
              <p
                id="profile-modal-title"
                className="font-['Space_Grotesk'] font-bold text-lg text-gray-900 dark:text-white leading-tight truncate"
              >
                {user?.name || "—"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Member since {formatDate(user?.createdAt)}
              </p>
            </div>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <p
              className="text-sm text-gray-600 dark:text-gray-300 mb-5 leading-relaxed pl-3"
              style={{ borderLeft: "2px solid rgba(253,184,19,0.6)" }}
            >
              {profile.bio}
            </p>
          )}

          {/* Contact info */}
          <div className="flex flex-col gap-2 mb-5">
            <InfoRow icon={Mail}>{user?.email || "—"}</InfoRow>
            {profile?.phone && <InfoRow icon={Phone}>{profile.phone}</InfoRow>}
            {profile?.location && <InfoRow icon={MapPin}>{profile.location}</InfoRow>}
          </div>

          {/* Quick stats — flexbox row, each card grows equally */}
          <div className="flex items-stretch gap-2 mb-5">
            <MiniStat
              icon={FileText}
              label="Notes"
              value={notes.length}
              accent={{ bar: "#FDB813", bg: "rgba(253,184,19,0.15)", icon: "#a8790e" }}
            />
            <MiniStat
              icon={Pin}
              label="Pinned"
              value={pinnedCount}
              accent={{ bar: "#E8553D", bg: "rgba(232,85,61,0.12)", icon: "#E8553D" }}
            />
            <MiniStat
              icon={Trash2}
              label="Trash"
              value={trashedNotes.length}
              accent={{ bar: "#9CA3AF", bg: "rgba(156,163,175,0.15)", icon: "#6B7280" }}
            />
          </div>

          {/* Footer action */}
          <button
            onClick={() => {
              onClose();
              navigate("/settings");
            }}
            className="w-full flex items-center justify-center gap-2 h-10 text-sm font-semibold text-white bg-gradient-to-r from-[#FDB813] via-[#FB7185] to-[#EC4899] rounded-lg hover:brightness-105 transition-[filter] duration-150"
          >
            <Settings size={14} />
            Edit profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;