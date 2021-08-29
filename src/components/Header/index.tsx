import { useRouter } from 'next/router';
import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function Header(): JSX.Element {
  const router = useRouter();

  return (
    <header className={styles.container}>
      <div className={commonStyles.container}>
        <button type="button" onClick={() => router.push('/')}>
          <img src="/logo.svg" alt="logo" />
        </button>
      </div>
    </header>
  );
}
