import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "updated", label: "Recently edited" },
  { value: "title", label: "Title A–Z" },
];

export const DATE_RANGE_OPTIONS = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
];

/**
 * Dropdown — custom-styled single-select, swap-in replacement for <select>.
 * Controlled: value / onChange / options in, no internal source of truth
 * for the selected value.
 */
const Dropdown = ({ value, onChange, options, label }) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const listRef = useRef(null);

  const selected = options.find((o) => o.value === value) ?? options[0];

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // reset keyboard focus to current selection whenever menu opens
  useEffect(() => {
    if (open) {
      const idx = options.findIndex((o) => o.value === value);
      setActiveIndex(idx === -1 ? 0 : idx);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const commit = (val) => {
    onChange(val);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (activeIndex >= 0) commit(options[activeIndex].value);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        title={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        className={`group flex items-center gap-2 h-9 pl-3 pr-2.5 text-sm rounded-lg border bg-white
          transition-all duration-150 cursor-pointer select-none
          ${open ? "border-[#FFC93C] ring-2 ring-[#FFC93C]" : "border-gray-200 hover:border-gray-300"}`}
      >
        <span className="text-gray-600">{selected?.label}</span>
        <ChevronDown
          size={15}
          strokeWidth={2}
          className={`text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <ul
        ref={listRef}
        role="listbox"
        tabIndex={-1}
        className={`absolute z-20 mt-1.5 min-w-[10.5rem] py-1 bg-white border border-gray-200
          rounded-lg shadow-lg shadow-black/5 origin-top
          transition-all duration-150 ease-out
          ${
            open
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-95 pointer-events-none"
          }`}
      >
        {options.map((opt, i) => {
          const isSelected = opt.value === value;
          const isActive = i === activeIndex;
          return (
            <li
              key={opt.value}
              role="option"
              aria-selected={isSelected}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => commit(opt.value)}
              className={`flex items-center justify-between gap-3 px-3 py-1.5 text-sm cursor-pointer
                transition-colors duration-100
                ${isActive ? "bg-[#FFF7DE]" : "bg-white"}
                ${isSelected ? "text-gray-900 font-medium" : "text-gray-600"}`}
            >
              {opt.label}
              {isSelected && (
                <Check size={14} strokeWidth={2.5} className="text-[#E8A800]" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

/**
 * FilterBar — sort order + date range controls for the notes grid.
 * Pure controlled component: parent (Dashboard) owns the state.
 */
const FilterBar = ({ sortBy, onSortChange, dateRange, onDateRangeChange }) => (
  <div className="flex items-center gap-2 mb-4">
    <Dropdown
      value={sortBy}
      onChange={onSortChange}
      options={SORT_OPTIONS}
      label="Sort notes"
    />
    <Dropdown
      value={dateRange}
      onChange={onDateRangeChange}
      options={DATE_RANGE_OPTIONS}
      label="Filter by date"
    />
  </div>
);

export default FilterBar;