import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  User,
  BarChart3,
  ShieldCheck,
  LogOut,
  Loader2,
  Check,
  Pin,
  Trash2,
  FileText,
  Calendar,
  TriangleAlert,
  Menu,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useNotes } from "../hooks/useNotes";
import { useProfile } from "../hooks/useProfile";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB
const MAX_BIO_LENGTH = 240;
const TAB_STEP = 60; // px between tab centers, used to drive the sliding rail indicator

const TABS = [
  { id: "profile", label: "Profile", hint: "Photo, contact & bio", icon: User },
  { id: "overview", label: "Notes overview", hint: "Your library at a glance", icon: BarChart3 },
  { id: "account", label: "Account", hint: "Email & sign out", icon: ShieldCheck },
];

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

const labelClass = "text-[11px] font-mono uppercase tracking-wider text-gray-400 dark:text-gray-500";

const fieldClass =
  "w-full h-10 px-3 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#14141f] " +
  "focus:outline-none focus:ring-2 focus:ring-[#FDB813]/60 transition-shadow duration-150";

const Field = ({ label, ...props }) => (
  <label className="flex flex-col gap-1.5">
    <span className={labelClass}>{label}</span>
    <input className={fieldClass} {...props} />
  </label>
);

const TabButton = ({ tab, active, onClick }) => {
  const Icon = tab.icon;
  return (
    <button
      onClick={onClick}
      className={`flex sm:flex-col flex-row items-center sm:items-start gap-2 sm:gap-0.5 shrink-0 sm:w-full
        h-11 sm:h-[56px] px-3.5 sm:px-3.5 sm:py-2 rounded-lg text-left transition-colors duration-150
        ${
          active
            ? "bg-gradient-to-r from-[#6C5CE7] to-[#A855F7] text-white shadow-lg shadow-purple-900/30"
            : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-800 dark:hover:text-white"
        }`}
    >
      <span className="flex items-center gap-2 sm:gap-2.5">
        <Icon size={15} strokeWidth={2} />
        <span className="text-sm font-medium whitespace-nowrap sm:whitespace-normal">{tab.label}</span>
      </span>
      <span
        className={`hidden sm:block font-mono text-[10.5px] uppercase tracking-wide pl-[23px] ${
          active ? "text-white/70" : "text-gray-400 dark:text-gray-500"
        }`}
      >
        {tab.hint}
      </span>
    </button>
  );
};

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div
    className="relative flex items-center gap-3 bg-white dark:bg-[#191924] border border-gray-100 dark:border-white/5 rounded-xl pl-4 pr-4 py-4 overflow-hidden
      transition-transform duration-150 hover:-translate-y-0.5 motion-reduce:transform-none"
  >
    <span className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: accent.bar }} />
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
      style={{ backgroundColor: accent.bg }}
    >
      <Icon size={16} style={{ color: accent.icon }} />
    </div>
    <div>
      <p className="text-xl font-['Space_Grotesk'] font-bold text-gray-900 dark:text-white leading-none mb-1">
        {value}
      </p>
      <p className={labelClass}>{label}</p>
    </div>
  </div>
);

/**
 * LogoutConfirmModal — small centered dialog asking the user to confirm
 * before actually signing out. Mirrors the one used in DashboardHeader so
 * logout behaves the same way everywhere in the app.
 */
const LogoutConfirmModal = ({ loading, error, onConfirm, onCancel }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [loading, onCancel]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 ">
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

      <div
        className="modal-backdrop-in absolute inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-[2px]"
        onClick={() => !loading && onCancel()}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="logout-confirm-title"
        className="modal-pop-in relative w-full max-w-sm bg-white dark:bg-[#191924] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="px-6 pt-6 pb-5 flex flex-col items-center text-center">
          <div className="w-11 h-11 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center mb-3">
            <TriangleAlert size={20} />
          </div>
          <p id="logout-confirm-title" className="font-['Space_Grotesk'] font-bold text-base text-gray-900 dark:text-white">
            Log out?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
            You'll need to sign in again to access your notes.
          </p>
          {error && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-3 bg-red-50 dark:bg-red-500/10 rounded-lg px-3 py-2 w-full">
              {error}
            </p>
          )}
        </div>

        <div className="p-3 pt-0 flex items-center gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-10 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-50 transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-10 flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-60 transition-colors duration-150"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Yes, log out
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notes, trashedNotes, loading } = useNotes();
  const { profile, updateProfile, updateAvatar, saving, loaded } = useProfile();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("profile");
  const [form, setForm] = useState({ phone: "", location: "", bio: "" });
  const [avatarError, setAvatarError] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Only sync the form from the persisted profile once it has actually
  // finished loading, and again if the signed-in user changes. We deliberately
  // do NOT depend on `profile` itself here - otherwise an avatar upload
  // (which also updates `profile`) would blow away any unsaved edits the
  // user has typed into phone/location/bio.
  useEffect(() => {
    if (!loaded) return;
    setForm({
      phone: profile.phone || "",
      location: profile.location || "",
      bio: profile.bio || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, user?._id]);

  const isDirty =
    form.phone !== (profile.phone || "") ||
    form.location !== (profile.location || "") ||
    form.bio !== (profile.bio || "");

  const handleField = (key) => (e) => {
    setJustSaved(false);
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleAvatarPick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Image must be under 2MB");
      return;
    }

    setAvatarError("");
    const reader = new FileReader();
    reader.onload = () => updateAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    await updateProfile(form);
    setJustSaved(true);
  };

  // The "Log out" button now only opens the confirmation modal; the actual
  // sign-out happens in confirmLogout once the user says yes.
  const requestLogout = () => {
    setLogoutError("");
    setConfirmingLogout(true);
  };

  const confirmLogout = async () => {
    setLoggingOut(true);
    setLogoutError("");
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      setLogoutError(
        err?.response?.data?.message || err?.message || "Logout failed. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  };

  const pinnedCount = notes.filter((n) => n.pinned).length;
  const activeIndex = TABS.findIndex((t) => t.id === activeTab);

  return (
    <div className="flex bg-[#F7F7FA] dark:bg-[#14141f] min-h-screen">
      <style>{`
        @keyframes settingsFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: none; }
        }
        .settings-fade-in { animation: settingsFadeIn 220ms ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .settings-fade-in { animation: none; }
        }
      `}</style>

      <Sidebar
        view={null}
        onViewChange={() => navigate("/")}
        onNewNote={() => navigate("/")}
        onImportClick={() => navigate("/")}
        counts={{
          all: notes.length,
          pinned: pinnedCount,
          trash: trashedNotes.length,
        }}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <main className="flex-1 px-8 py-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden mb-4 w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>

          <div className="mb-1">
            <p className={`${labelClass} mb-2`}>Your account</p>
            <h1 className="font-['Space_Grotesk'] font-bold text-[28px] leading-tight tracking-tight text-gray-900 dark:text-white mb-1">
              Settings
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-md">
            Manage your profile, keep an eye on your notes, and control your account.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
            {/* Tab nav */}
            <nav className="relative flex sm:flex-col flex-row gap-1 sm:w-52 overflow-x-auto sm:overflow-visible -mx-1 px-1 sm:mx-0 sm:px-0">
              <span
                className="hidden sm:block absolute -left-1 w-[3px] h-[56px] rounded-full bg-[#FDB813] transition-transform duration-200 ease-out motion-reduce:transition-none"
                style={{ transform: `translateY(${activeIndex * TAB_STEP}px)` }}
              />
              {TABS.map((tab) => (
                <TabButton
                  key={tab.id}
                  tab={tab}
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                />
              ))}
            </nav>

            {/* Tab content */}
            <div className="flex-1 min-w-0">
              {activeTab === "profile" && (
                <div key="profile" className="settings-fade-in bg-white dark:bg-[#191924] border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden">
                  {/* Dot-grid cover band - the one signature flourish on this page */}
                  <div
                    className="h-20 dark:hidden"
                    style={{
                      backgroundColor: "#FFF8E7",
                      backgroundImage:
                        "radial-gradient(rgba(16,21,31,0.09) 1px, transparent 1.4px)",
                      backgroundSize: "14px 14px",
                    }}
                  />
                  <div
                    className="h-20 hidden dark:block"
                    style={{
                      backgroundColor: "#241c2e",
                      backgroundImage:
                        "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1.4px)",
                      backgroundSize: "14px 14px",
                    }}
                  />

                  <div className="px-6 pb-6">
                    <div className="flex items-end gap-4 -mt-10 mb-6">
                      <div className="relative shrink-0">
                        {profile.avatar ? (
                          <img
                            src={profile.avatar}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover ring-4 ring-white dark:ring-[#191924] shadow-md"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FDB813] to-[#EC4899] text-white flex items-center justify-center font-['Space_Grotesk'] font-bold text-2xl ring-4 ring-white dark:ring-[#191924] shadow-md">
                            {getInitials(user?.name)}
                          </div>
                        )}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#FDB813] text-[#10151F] flex items-center justify-center border-2 border-white dark:border-[#191924] hover:brightness-105 transition-[filter] duration-150"
                          aria-label="Change photo"
                          title="Change photo"
                        >
                          <Camera size={13} />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarPick}
                          className="hidden"
                        />
                      </div>
                      <div className="pb-1">
                        <p className="font-['Space_Grotesk'] font-bold text-lg text-gray-900 dark:text-white leading-tight">
                          {user?.name || "—"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || "—"}</p>
                      </div>
                    </div>
                    {avatarError && <p className="text-xs text-red-500 dark:text-red-400 -mt-4 mb-4">{avatarError}</p>}

                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <Field
                        label="Phone number"
                        type="tel"
                        placeholder="+1 555 000 1234"
                        value={form.phone}
                        onChange={handleField("phone")}
                      />
                      <Field
                        label="Location"
                        type="text"
                        placeholder="City, Country"
                        value={form.location}
                        onChange={handleField("location")}
                      />
                    </div>

                    <label className="flex flex-col gap-1.5 mb-6">
                      <span className={labelClass}>Bio</span>
                      <textarea
                        rows={4}
                        maxLength={MAX_BIO_LENGTH}
                        placeholder="A short line about you"
                        value={form.bio}
                        onChange={handleField("bio")}
                        className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#14141f] resize-none focus:outline-none focus:ring-2 focus:ring-[#FDB813]/60 transition-shadow duration-150"
                      />
                      <span className="self-end text-[11px] font-mono text-gray-400 dark:text-gray-500">
                        {form.bio.length}/{MAX_BIO_LENGTH}
                      </span>
                    </label>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSave}
                        disabled={!isDirty || saving}
                        className="flex items-center gap-1.5 px-4 h-9 text-sm font-semibold text-white bg-gradient-to-r from-[#FDB813] via-[#FB7185] to-[#EC4899] rounded-lg hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition-[filter] duration-150"
                      >
                        {saving && <Loader2 size={14} className="animate-spin" />}
                        Save changes
                      </button>
                      {justSaved && !isDirty && (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                          <Check size={14} /> Saved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "overview" && (
                <div key="overview" className="settings-fade-in">
                  <div className="grid sm:grid-cols-3 gap-3 mb-4">
                    <StatCard
                      icon={FileText}
                      label="Total notes"
                      value={loading ? "—" : notes.length}
                      accent={{ bar: "#FDB813", bg: "rgba(253,184,19,0.15)", icon: "#a8790e" }}
                    />
                    <StatCard
                      icon={Pin}
                      label="Pinned notes"
                      value={loading ? "—" : pinnedCount}
                      accent={{ bar: "#E8553D", bg: "rgba(232,85,61,0.12)", icon: "#E8553D" }}
                    />
                    <StatCard
                      icon={Trash2}
                      label="In trash"
                      value={loading ? "—" : trashedNotes.length}
                      accent={{ bar: "#9CA3AF", bg: "rgba(156,163,175,0.15)", icon: "#6B7280" }}
                    />
                  </div>
                  <div className="bg-white dark:bg-[#191924] border border-gray-100 dark:border-white/5 rounded-xl p-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {loading
                        ? "Loading your notes…"
                        : notes.length === 0
                        ? "You haven't written any notes yet — head back and create your first one."
                        : `You have ${notes.length} note${notes.length === 1 ? "" : "s"}, ${pinnedCount} pinned.`}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "account" && (
                <div key="account" className="settings-fade-in bg-white dark:bg-[#191924] border border-gray-100 dark:border-white/5 rounded-xl p-6">
                  <div className="flex flex-col gap-4 mb-5">
                    <div>
                      <p className={`${labelClass} mb-1`}>Email</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{user?.email || "—"}</p>
                    </div>
                    <div
                      className="inline-flex w-fit items-center gap-2 px-3 py-1.5 border border-dashed border-gray-300 dark:border-white/20 rounded-md -rotate-1 font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-500"
                    >
                      <Calendar size={12} />
                      Member since {formatDate(user?.createdAt)}
                    </div>
                  </div>

                  <div className="pt-5 border-t border-gray-100 dark:border-white/10">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Session</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Sign out of this device. You'll need your email and password to log back in.
                    </p>
                    <button
                      onClick={requestLogout}
                      disabled={loggingOut}
                      className="flex items-center gap-2 px-4 h-9 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50 transition-colors duration-150"
                    >
                      {loggingOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {confirmingLogout && (
        <LogoutConfirmModal
          loading={loggingOut}
          error={logoutError}
          onConfirm={confirmLogout}
          onCancel={() => {
            if (!loggingOut) {
              setConfirmingLogout(false);
              setLogoutError("");
            }
          }}
        />
      )}
    </div>
  );
};

export default SettingsPage;