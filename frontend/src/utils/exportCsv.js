// Escapes a single cell per RFC 4180: wrap in quotes and double-up any embedded
// quote whenever the value contains a delimiter, quote, or newline.
const escape = (val) => {
  const str = val == null ? '' : String(val);
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str.replace(/"/g, '""')}"`
    : str;
};

/**
 * Builds a CSV from the given headers and rows and triggers a browser download.
 * @param {string} filename - File name presented in the download dialog.
 * @param {string[]} headers - Header row.
 * @param {Array<Array<string|number|null>>} rows - Data rows (one array per row).
 */
export const downloadCsv = (filename, headers, rows) => {
  const lines = [headers, ...rows].map((row) => row.map(escape).join(','));
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
