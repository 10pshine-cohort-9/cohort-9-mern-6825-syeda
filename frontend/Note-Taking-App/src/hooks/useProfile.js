import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const STORAGE_PREFIX = "profile:";

const emptyProfile = {
  phone: "",
  location: "",
  bio: "",
  avatar: null, // data URL string, or null
};

/**
 * useProfile — temporary frontend-only profile store.
 *
 * TODO(next PR): replace the localStorage read/write below with real calls:
 *   GET   /api/auth/me         -> hydrate on load (name/email already come
 *                                  from useAuth, no change needed there)
 *   PATCH /api/auth/me         -> persist { phone, location, bio }
 *   POST  /api/auth/me/avatar  -> upload the photo, store the returned URL
 *
 * The public shape (profile, updateProfile, updateAvatar, saving, loaded)
 * is meant to stay identical once that swap happens, so ProfileModal
 * shouldn't need to change at all.
 */
export const useProfile = () => {
  const { user } = useAuth();
  const storageKey = user?._id ? `${STORAGE_PREFIX}${user._id}` : null;

  const [profile, setProfile] = useState(emptyProfile);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!storageKey) {
      setProfile(emptyProfile);
      setLoaded(true);
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey);
      setProfile(raw ? { ...emptyProfile, ...JSON.parse(raw) } : emptyProfile);
    } catch {
      setProfile(emptyProfile);
    }
    setLoaded(true);
  }, [storageKey]);

  // persist accepts either a plain object of fields to merge, or an updater
  // function (prevProfile) => nextProfile. Using the functional form of
  // setProfile means we always merge against the LATEST state, not a
  // profile value captured in a closure - this is what fixes the stale
  // overwrite bug (e.g. an avatar upload landing during a pending save).
  const persist = useCallback(
    (updater) => {
      setProfile((prev) => {
        const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
        if (storageKey) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(next));
          } catch {
            // localStorage can throw (quota, private mode) - profile still
            // updates in memory for this session even if it doesn't persist.
          }
        }
        return next;
      });
    },
    [storageKey]
  );

  const updateProfile = useCallback(
    async (fields) => {
      setSaving(true);
      // Simulated latency so Save behaves like it will once this hits a
      // real endpoint. Remove once updateProfile calls the API directly.
      await new Promise((resolve) => setTimeout(resolve, 350));
      persist((prev) => ({ ...prev, ...fields }));
      setSaving(false);
    },
    [persist]
  );

  const updateAvatar = useCallback(
    (dataUrl) => {
      persist((prev) => ({ ...prev, avatar: dataUrl }));
    },
    [persist]
  );

  return { profile, updateProfile, updateAvatar, saving, loaded };
};