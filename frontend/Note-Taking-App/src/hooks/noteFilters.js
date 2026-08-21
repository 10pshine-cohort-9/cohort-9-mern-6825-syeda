/**
 * sortNotes — returns a new sorted array, doesn't mutate the input.
 * Works on either active or trashed notes (both have createdAt/updatedAt).
 */
export const sortNotes = (notes, sortBy) => {
  const sorted = [...notes];
  switch (sortBy) {
    case "oldest":
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case "updated":
      return sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "newest":
    default:
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

/**
 * filterByDateRange — keeps only notes created within the given window.
 * "today" / "week" / "month" are relative to the local browser time.
 */
export const filterByDateRange = (notes, dateRange) => {
  if (dateRange === "all") return notes;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let cutoff;
  if (dateRange === "today") {
    cutoff = startOfToday;
  } else if (dateRange === "week") {
    cutoff = new Date(startOfToday);
    cutoff.setDate(cutoff.getDate() - 7);
  } else if (dateRange === "month") {
    cutoff = new Date(startOfToday);
    cutoff.setMonth(cutoff.getMonth() - 1);
  } else {
    return notes;
  }

  return notes.filter((n) => new Date(n.createdAt) >= cutoff);
};