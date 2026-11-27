import { useState, type FormEvent, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { mapAuthError, validateLoginFields, type LoginFieldErrors } from '../../utils/authValidation';
import styles from '../../pages/AuthSplitLayout.module.css';

export interface LoginFormProps {
  email: string;
  onEmailChange: (value: string) => void;
  onSubmitCredentials: (email: string, password: string) => Promise<void>;
  headingRef?: RefObject<HTMLHeadingElement | null>;
}

export default function LoginForm({
  email,
  onEmailChange,
  onSubmitCredentials,
  headingRef,
}: LoginFormProps) {
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginFieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setServerError('');

    const fieldErrors = validateLoginFields(email, password);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitCredentials(email, password);
    } catch (err) {
      setServerError(mapAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formInner}>
      <div className={styles.brand}>
        <span className={styles.brandIcon} aria-hidden="true">
          <BookOpen size={18} />
        </span>
        <span className={styles.brandName}>Notes Workspace</span>
      </div>

      <h1 ref={headingRef} tabIndex={-1} className={styles.heading}>
        Welcome back
      </h1>
      <p className={styles.subline}>Your notes are where you left them.</p>

      {serverError && (
        <div className={styles.bannerError} role="alert">
          {serverError}
        </div>
      )}

      <form name="login" onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="you@example.com"
            autoComplete="username"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
          />
          {errors.email && (
            <span id="login-email-error" className={styles.errorText}>
              {errors.email}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
          />
          {errors.password && (
            <span id="login-password-error" className={styles.errorText}>
              {errors.password}
            </span>
          )}
        </div>

        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className={styles.switchPrompt}>
        New here?{' '}
        <Link to="/signup" className={styles.switchLink}>
          Create an account
        </Link>
      </p>
    </div>
  );
}
