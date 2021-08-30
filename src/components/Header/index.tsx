/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useRouter } from 'next/router';
import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function Header(): JSX.Element {
  const router = useRouter();

  return (
    <header className={styles.container}>
      <div className={commonStyles.container}>
        <img
          src="/logo.svg"
          alt="logo"
          onClick={() => router.push('/', {}, {})}
        />
      </div>
    </header>
  );
}
