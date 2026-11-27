import {
  getUtf8ByteLength,
  mapAuthError,
  validateLoginFields,
  validateSignupFields,
} from '../utils/authValidation';

describe('authValidation', () => {
  it('validates login fields with exact copy', () => {
    expect(validateLoginFields('', '')).toEqual({
      email: 'Enter your email.',
      password: 'Enter your password.',
    });

    expect(validateLoginFields('bad-email', 'secret123')).toEqual({
      email: "That email doesn't look right. Check for typos.",
    });

    expect(validateLoginFields('user@example.com', 'secret123')).toEqual({});
  });

  it('validates signup name, 8-char minimum, and 72-byte UTF-8 limit', () => {
    expect(validateSignupFields('', 'user@example.com', 'short')).toEqual({
      name: 'Enter your name.',
      password: 'Use at least 8 characters.',
    });

    const multiBytePassword = '🔑'.repeat(19); // 19 * 4 = 76 bytes
    expect(getUtf8ByteLength(multiBytePassword)).toBe(76);
    expect(validateSignupFields('Alice', 'user@example.com', multiBytePassword)).toEqual({
      password: 'That password is too long. Use a shorter one.',
    });
  });

  it('maps only shipped backend status codes plus network and fallback errors', () => {
    expect(mapAuthError(new Error('Network Error'))).toBe(
      "Couldn't reach the server. Check your connection and try again."
    );
    expect(mapAuthError({ response: { status: 401 } })).toBe(
      "That email and password don't match. Check them and try again."
    );
    expect(mapAuthError({ response: { status: 409 } })).toBe(
      'An account with this email already exists. Log in instead, or use a different email.'
    );
    expect(mapAuthError({ response: { status: 500 } })).toBe(
      'Something went wrong. Please try again.'
    );
  });
});
