import { Link } from 'react-router-dom';
import PinnateBrand from './brand/PinnateBrand';
import { TransitionLink } from '../context/PageTransitionContext';
import styles from './PublicTopNav.module.css';

export default function PublicTopNav() {
  return (
    <header className={styles.topNav}>
      <div className={styles.topNavInner}>
        <Link to="/" className={styles.brand}>
          <PinnateBrand markSize={32} />
        </Link>

        <nav className={styles.navActions} aria-label="Public navigation">
          <TransitionLink to="/login" className={styles.secondaryLink}>
            Log in
          </TransitionLink>
          <TransitionLink to="/signup" className={styles.primaryCta}>
            Get started
          </TransitionLink>
        </nav>
      </div>
    </header>
  );
}
