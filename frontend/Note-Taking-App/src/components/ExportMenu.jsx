import { useState, useRef, useEffect } from "react";
import api from "../api/axios";

const DownloadIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
  </svg>
);

const FORMATS = [

  { value: "txt", label: "Text (.txt)" },
  { value: "xlsx", label: "Excel (.xlsx)" },
];

const ExportMenu = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const extractFilename = (contentDisposition, fallback) => {
    if (!contentDisposition) return fallback;
    const match = contentDisposition.match(/filename="?([^"]+)"?/);
    return match ? match[1] : fallback;
  };

  const handleExport = async (format) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/notes/export?format=${format}`, {
        responseType: "blob",
      });

      const filename = extractFilename(
        res.headers["content-disposition"],
        `notewell-export.${format}`
      );

      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setOpen(false);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("You have no notes to export");
      } else {
        setError("Export failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-150"
      >
        <DownloadIcon />
        Export Notes
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1.5 z-20 animate-fade-in-up">
          {FORMATS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleExport(f.value)}
              disabled={loading}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50"
            >
              {loading ? "Exporting..." : f.label}
            </button>
          ))}
          {error && (
            <p className="px-3 pt-1.5 text-xs text-red-600">{error}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ExportMenu;