import { extractPlainText, formatRelativeTime } from '../utils/formatters';

describe('formatters', () => {
  describe('extractPlainText', () => {
    it('returns empty string for empty input', () => {
      expect(extractPlainText('')).toBe('');
    });

    it('preserves text across inline tags without inserting spaces', () => {
      expect(extractPlainText('<p>note<strong>book</strong></p>')).toBe('notebook');
      expect(extractPlainText('<span>code</span><em>base</em>')).toBe('codebase');
    });

    it('preserves spacing between block elements and breaks', () => {
      expect(extractPlainText('<p>Hello</p><p>World</p>')).toBe('Hello World');
      expect(extractPlainText('Line 1<br>Line 2')).toBe('Line 1 Line 2');
      expect(extractPlainText('<ul><li>Item 1</li><li>Item 2</li></ul>')).toBe('Item 1 Item 2');
    });

    it('decodes each HTML entity once without double-decoding nested entities', () => {
      expect(extractPlainText('<p>&amp;nbsp;</p>')).toBe('&nbsp;');
      expect(extractPlainText('&amp;lt;')).toBe('&lt;');
      expect(extractPlainText('&lt;div&gt;')).toBe('<div>');
      expect(extractPlainText('Rock &amp; Roll')).toBe('Rock & Roll');
    });

    it('converts non-breaking spaces to whitespace and normalizes whitespace', () => {
      expect(extractPlainText('Hello&nbsp;World')).toBe('Hello World');
      expect(extractPlainText('   Multiple    spaces   ')).toBe('Multiple spaces');
    });
  });

  describe('formatRelativeTime', () => {
    it('returns empty string for missing date', () => {
      expect(formatRelativeTime('')).toBe('');
    });

    it('returns Just now for recent dates', () => {
      const now = new Date().toISOString();
      expect(formatRelativeTime(now)).toBe('Just now');
    });
  });
});
