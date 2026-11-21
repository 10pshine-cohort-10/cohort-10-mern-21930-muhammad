/**
 * Strips HTML tags and extracts readable plain text.
 * @param {string} html
 * @returns {string}
 */
export function extractPlainText(html) {
  if (!html) return '';
  const temporaryDiv = document.createElement('div');
  temporaryDiv.innerHTML = html;
  return temporaryDiv.textContent || temporaryDiv.innerText || '';
}

/**
 * Returns a human-friendly relative time string.
 * @param {string} dateString
 * @returns {string}
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
