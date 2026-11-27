import { useState, type FormEvent, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import PinnateBrand from '../brand/PinnateBrand';
import { mapAuthError, validateSignupFields, type SignupFieldErrors } from '../../utils/authValidation';
import styles from '../../pages/AuthSplitLayout.module.css';

export interface SignupFormProps {
  email: string;
  onEmailChange: (value: string) => void;
  onSubmitSignup: (name: string, email: string, password: string) => Promise<void>;
  headingRef?: RefObject<HTMLHeadingElement | null>;
}

export default function SignupForm({
  email,
  onEmailChange,
  onSubmitSignup,
  headingRef,
}: SignupFormProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<SignupFieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setServerError('');

    const fieldErrors = validateSignupFields(name, email, password);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitSignup(name, email, password);
    } catch (err) {
      setServerError(mapAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formInner}>
      <Link to="/" className={styles.brand} aria-label="Pinnate home">
        <PinnateBrand markSize={34} />
      </Link>

      <h1 ref={headingRef} tabIndex={-1} className={styles.heading}>
        Create your account
      </h1>
      <p className={styles.subline}>Capture quickly, then move notes onto your board.</p>

      {serverError && (
        <div className={styles.bannerError} role="alert">
          {serverError}
        </div>
      )}

      <form name="signup" onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="signup-name">
            Name
          </label>
          <input
            id="signup-name"
            name="name"
            type="text"
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alice Doe"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'signup-name-error' : undefined}
          />
          {errors.name && (
            <span id="signup-name-error" className={styles.errorText}>
              {errors.name}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="signup-email">
            Email
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'signup-email-error' : undefined}
          />
          {errors.email && (
            <span id="signup-email-error" className={styles.errorText}>
              {errors.email}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="signup-password">
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'signup-password-error' : 'signup-password-helper'}
          />
          {errors.password ? (
            <span id="signup-password-error" className={styles.errorText}>
              {errors.password}
            </span>
          ) : (
            <span id="signup-password-helper" className={styles.helperText}>
              At least 8 characters.
            </span>
          )}
        </div>

        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className={styles.switchPrompt}>
        Already have an account?{' '}
        <Link to="/login" className={styles.switchLink}>
          Log in
        </Link>
      </p>
    </div>
  );
}
