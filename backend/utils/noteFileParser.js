const fs = require("fs");
const path = require("path");
const { parse: parseCsvSync } = require("csv-parse/sync");
const XLSX = require("xlsx");

// Matches an unescaped delimiter line. Escaped delimiter lines
// (originally part of a note's content) are written as "\-----"
// by the exporter and are therefore NOT matched here.
const TXT_RECORD_SEPARATOR = /\r?\n-----\r?\n/;
const ESCAPED_DELIMITER_LINE = /^\\-----\r?$/;

const unescapeTxtContent = (content) => {
  return content
    .split("\n")
    .map((line) => (ESCAPED_DELIMITER_LINE.test(line) ? line.slice(1) : line))
    .join("\n");
};

const parseTxt = (text) => {
  const blocks = text
    .split(TXT_RECORD_SEPARATOR)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks.map((block) => {
    const lines = block.split(/\r?\n/);
    const firstLine = lines[0] || "";
    const titleMatch = firstLine.match(/^Title:\s*(.*)$/i);

    if (titleMatch) {
      return {
        title: titleMatch[1].trim(),
        content: unescapeTxtContent(lines.slice(1).join("\n")).trim(),
      };
    }

    // Fallback: no "Title:" prefix found, treat first line as title anyway
    return {
      title: firstLine.trim(),
      content: unescapeTxtContent(lines.slice(1).join("\n")).trim(),
    };
  });
};

// Mirrors sanitizeCsvField in noteFileExporter.js: a leading apostrophe
// was added there to stop spreadsheet software from treating =, +, -, @
// prefixed values as formulas. Strip it back off on import so a
// round-tripped export/import doesn't accumulate a literal apostrophe.
const unescapeCsvField = (value) => {
  if (typeof value === "string" && /^'[=+\-@]/.test(value)) {
    return value.slice(1);
  }
  return value;
};

const parseCsv = (text) => {
  const records = parseCsvSync(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return records.map((row) => ({
    title: unescapeCsvField(row.title || row.Title || ""),
    content: unescapeCsvField(row.content || row.Content || ""),
  }));
};

const parseXlsx = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  return rows.map((row) => ({
    title: String(row.title || row.Title || ""),
    content: String(row.content || row.Content || ""),
  }));
};

/**
 * Reads and parses an uploaded file from disk into an array of { title, content }.
 * Uses Node's fs module to read the file contents.
 */
const parseImportFile = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".xlsx" || ext === ".xls") {
    return parseXlsx(filePath);
  }

  const text = fs.readFileSync(filePath, "utf-8");

  if (ext === ".csv") {
    return parseCsv(text);
  }

  if (ext === ".txt") {
    return parseTxt(text);
  }

  throw new Error(`Unsupported file extension: ${ext}`);
};

module.exports = { parseImportFile };