import { useState, useRef, useEffect } from "react";

const ChevronIcon = ({ open }) => (
  <svg
    className={`w-4 h-4 text-gray-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
  </svg>
);

const SortIcon = () => (
  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M6 12h12M10 18h4" />
  </svg>
);

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title-asc", label: "Title A–Z" },
  { value: "title-desc", label: "Title Z–A" },
];

/**
 * SortDropdown — custom styled select for sorting notes.
 * Props: value (string), onChange(value: string)
 */
const SortDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = SORT_OPTIONS.find((o) => o.value === value) || SORT_OPTIONS[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg pl-3 pr-2.5 py-2 text-sm text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFC93C] transition-shadow duration-150"
      >
        <SortIcon />
        <span className="whitespace-nowrap">{selected.label}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-44 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-10 animate-fade-in-up">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors duration-100 ${
                opt.value === value
                  ? "bg-[#FFF8E1] text-[#10151F] font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;