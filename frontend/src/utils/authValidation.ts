export interface LoginFieldErrors {
  email?: string;
  password?: string;
}

export interface SignupFieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_BCRYPT_BYTES = 72;

export function getUtf8ByteLength(value: string): number {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(value).length;
  }
  return unescape(encodeURIComponent(value)).length;
}

export function validateEmailField(email: string): string | undefined {
  if (!email.trim()) {
    return 'Enter your email.';
  }
  if (!EMAIL_PATTERN.test(email.trim())) {
    return "That email doesn't look right. Check for typos.";
  }
  return undefined;
}

export function validateLoginFields(email: string, password: string): LoginFieldErrors {
  const errors: LoginFieldErrors = {};
  const emailError = validateEmailField(email);
  if (emailError) {
    errors.email = emailError;
  }
  if (!password) {
    errors.password = 'Enter your password.';
  }
  return errors;
}

export function validateSignupFields(
  name: string,
  email: string,
  password: string
): SignupFieldErrors {
  const errors: SignupFieldErrors = {};
  if (!name.trim()) {
    errors.name = 'Enter your name.';
  }
  const emailError = validateEmailField(email);
  if (emailError) {
    errors.email = emailError;
  }
  if (!password) {
    errors.password = 'Enter your password.';
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = 'Use at least 8 characters.';
  } else if (getUtf8ByteLength(password) > MAX_BCRYPT_BYTES) {
    errors.password = 'That password is too long. Use a shorter one.';
  }
  return errors;
}

/**
 * Maps only the HTTP status codes the backend auth routes actually return
 * (400, 401, 409) plus network failures and a generic fallback.
 */
export function mapAuthError(err: unknown): string {
  const errorLike = err as { response?: { status?: number; data?: { error?: string } } };
  if (!errorLike?.response) {
    return "Couldn't reach the server. Check your connection and try again.";
  }

  const { status, data } = errorLike.response;
  if (status === 401) {
    return "That email and password don't match. Check them and try again.";
  }
  if (status === 409) {
    return 'An account with this email already exists. Log in instead, or use a different email.';
  }
  if (status === 400) {
    if (data?.error?.includes('72 bytes')) {
      return 'That password is too long. Use a shorter one.';
    }
    if (data?.error?.includes('8 characters')) {
      return 'Use at least 8 characters.';
    }
    return data?.error || 'Please check your details and try again.';
  }

  return 'Something went wrong. Please try again.';
}
