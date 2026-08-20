const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { stringify: stringifyCsv } = require("csv-stringify/sync");
const XLSX = require("xlsx");

const EXPORT_DIR = path.join(__dirname, "..", "tmp", "exports");

fs.mkdirSync(EXPORT_DIR, { recursive: true });

const SUPPORTED_FORMATS = ["csv", "txt", "xlsx"];
const MAX_EXPORT_NOTES = 2000;


const TXT_DELIMITER_LINE = /^-----\r?$/;


const sanitizeCsvField = (value) => {
  const str = String(value ?? "");
  if (/^[=+\-@]/.test(str)) {
    return `'${str}`;
  }
  return str;
};

const buildCsv = (notes) => {
  return stringifyCsv(
    notes.map((n) => ({
      title: sanitizeCsvField(n.title),
      content: sanitizeCsvField(n.content),
      pinned: n.pinned,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    })),
    {
      header: true,
      columns: ["title", "content", "pinned", "createdAt", "updatedAt"],
    }
  );
};

const escapeTxtContent = (content) => {
  return content
    .split("\n")
    .map((line) => (TXT_DELIMITER_LINE.test(line) ? `\\${line}` : line))
    .join("\n");
};

const buildTxt = (notes) => {
  return notes
    .map((n) => `Title: ${n.title}\n${escapeTxtContent(n.content)}`)
    .join("\n-----\n");
};

const buildXlsxBuffer = (notes) => {
  const rows = notes.map((n) => ({
    Title: n.title,
    Content: n.content,
    Pinned: n.pinned,
    CreatedAt: n.createdAt.toISOString(),
    UpdatedAt: n.updatedAt.toISOString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Notes");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
};


const buildExportFile = (notes, format) => {
  if (!SUPPORTED_FORMATS.includes(format)) {
    throw new Error(`Unsupported export format: ${format}`);
  }

  const boundedNotes = notes.slice(0, MAX_EXPORT_NOTES);
  const truncated = notes.length > MAX_EXPORT_NOTES;

  const uniqueId = crypto.randomBytes(6).toString("hex");
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `notewell-export-${dateStr}-${uniqueId}.${format}`;
  const filePath = path.join(EXPORT_DIR, filename);

  if (format === "csv") {
    fs.writeFileSync(filePath, buildCsv(boundedNotes), "utf-8");
  } else if (format === "txt") {
    fs.writeFileSync(filePath, buildTxt(boundedNotes), "utf-8");
  } else if (format === "xlsx") {
    fs.writeFileSync(filePath, buildXlsxBuffer(boundedNotes));
  }

  return { filePath, filename, exportedCount: boundedNotes.length, truncated };
};

module.exports = { buildExportFile, SUPPORTED_FORMATS, MAX_EXPORT_NOTES };