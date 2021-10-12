import NextLink from 'next/link';
import styles from './styles.module.scss';

interface PostLinkProps {
  href: string;
  children: string;
  nextPost?: boolean;
}

export function PostLink({
  href,
  children,
  nextPost = false,
}: PostLinkProps): JSX.Element {
  return (
    <NextLink href={href}>
      <a
        className={styles.container}
        style={{ textAlign: nextPost ? 'right' : 'initial' }}
      >
        <span>{children}</span>
        <strong>{nextPost ? 'Próximo post' : 'Post anterior'}</strong>
      </a>
    </NextLink>
  );
}
