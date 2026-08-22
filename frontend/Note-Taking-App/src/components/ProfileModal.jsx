import { useState, useRef, useEffect } from "react";
import { X, Camera, Loader2, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../hooks/useProfile";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB, generous for a small avatar
const MAX_BIO_LENGTH = 240;

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

const fieldClass =
  "w-full h-10 px-3 text-sm text-gray-800 border border-gray-200 rounded-lg bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-[#FFC93C] transition-shadow duration-150";

const Field = ({ label, ...props }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs font-medium text-gray-500">{label}</span>
    <input className={fieldClass} {...props} />
  </label>
);

const ProfileModal = ({ onClose }) => {
  const { user } = useAuth();
  const { profile, updateProfile, updateAvatar, saving } = useProfile();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ phone: "", location: "", bio: "" });
  const [avatarError, setAvatarError] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  // Sync local edit buffer whenever the stored profile changes underneath
  // (e.g. first load, or a different user).
  useEffect(() => {
    setForm({
      phone: profile.phone || "",
      location: profile.location || "",
      bio: profile.bio || "",
    });
  }, [profile]);

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
    e.target.value = ""; // allow re-picking the same file later
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-['Space_Grotesk'] font-bold text-lg text-[#10151F]">
            Your profile
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-150"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5 max-h-[75vh] overflow-y-auto">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="relative">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#FFC93C]/25 text-[#10151F] flex items-center justify-center font-['Space_Grotesk'] font-bold text-xl">
                  {getInitials(user?.name)}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#10151F] text-white flex items-center justify-center border-2 border-white hover:bg-black transition-colors duration-150"
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
            {avatarError && <p className="text-xs text-red-500">{avatarError}</p>}
          </div>

          {/* Account details - real data from your auth session */}
          <div className="flex flex-col gap-3 mb-5 pb-5 border-b border-gray-100">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Name</p>
              <p className="text-sm text-gray-800">{user?.name || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Email</p>
              <p className="text-sm text-gray-800">{user?.email || "—"}</p>
            </div>
          </div>

          {/* Editable extra details */}
          <div className="flex flex-col gap-4">
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
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-500">Bio</span>
              <textarea
                rows={3}
                maxLength={MAX_BIO_LENGTH}
                placeholder="A short line about you"
                value={form.bio}
                onChange={handleField("bio")}
                className="w-full px-3 py-2 text-sm text-gray-800 border border-gray-200 rounded-lg bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#FFC93C] transition-shadow duration-150"
              />
              <span className="self-end text-[11px] text-gray-400">
                {form.bio.length}/{MAX_BIO_LENGTH}
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50">
          {justSaved && !isDirty && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 mr-auto">
              <Check size={14} /> Saved
            </span>
          )}
          <button
            onClick={onClose}
            className="px-3.5 h-9 text-sm font-medium text-gray-500 rounded-lg hover:bg-gray-100 transition-colors duration-150"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="flex items-center gap-1.5 px-3.5 h-9 text-sm font-semibold text-[#10151F] bg-[#FFC93C] rounded-lg hover:bg-[#f5bf2f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;