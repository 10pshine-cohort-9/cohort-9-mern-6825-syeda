import { useState, useRef } from "react";
import api from "../api/axios";

const UploadIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
  </svg>
);

const ImportModal = ({ onClose, onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setError("");
    setResult(null);
    setFile(e.target.files[0] || null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please choose a file first");
      return;
    }

    setUploading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/notes/import", formData);
      setResult(res.data);
      onImportSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Import failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-fade-in-up"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-modal-in"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-['Space_Grotesk'] text-lg font-semibold text-gray-900">
            Import Notes
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors duration-150"
          >
            ✕
          </button>
        </div>

        {!result && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Upload a .csv, .txt, or .xlsx file. Each row/entry becomes a note.
            </p>

            <label
              htmlFor="import-file-input"
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-lg py-8 px-4 cursor-pointer hover:border-[#FFC93C] hover:bg-[#FFC93C]/5 transition-colors duration-150"
            >
              <span className="text-gray-400">
                <UploadIcon />
              </span>
              <span className="text-sm text-gray-600 text-center">
                {file ? file.name : "Click to choose a file"}
              </span>
              <span className="text-xs text-gray-400">CSV, TXT, or XLSX — up to 5MB</span>
            </label>
            <input
              id="import-file-input"
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mt-4">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-500 hover:text-gray-800 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !file}
                className="px-4 py-2 bg-[#FFC93C] hover:bg-[#f5bf2f] text-[#10151F] font-semibold rounded-lg disabled:opacity-50 transition-colors duration-150"
              >
                {uploading ? "Importing..." : "Import"}
              </button>
            </div>
          </>
        )}

        {result && (
          <div className="animate-fade-in-up">
            <div className="bg-green-50 text-green-700 text-sm px-3 py-2 rounded-lg mb-3">
              {result.message}
            </div>

            <div className="text-sm text-gray-600 space-y-1 mb-4">
              <p>✅ Imported: <strong>{result.imported}</strong></p>
              {result.skippedCount > 0 && (
                <p>⚠️ Skipped: <strong>{result.skippedCount}</strong></p>
              )}
            </div>

            {result.skipped?.length > 0 && (
              <div className="max-h-32 overflow-y-auto border border-gray-100 rounded-lg p-2 mb-4">
                {result.skipped.map((s, i) => (
                  <p key={i} className="text-xs text-gray-500">
                    Row {s.index + 1}: {s.reason}
                  </p>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-500 hover:text-gray-800 transition-colors duration-150"
              >
                Import another
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#FFC93C] hover:bg-[#f5bf2f] text-[#10151F] font-semibold rounded-lg transition-colors duration-150"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportModal;