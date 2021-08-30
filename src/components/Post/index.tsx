import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FiCalendar, FiUser } from 'react-icons/fi';
import styles from './styles.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  return (
    <Link href={`/post/${post.uid}`}>
      <a>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <p>{post.data.subtitle}</p>
          <ul>
            <li>
              <FiCalendar />
              <time
                dateTime={new Date(post.first_publication_date).toDateString()}
              >
                {format(parseISO(post.first_publication_date), 'dd LLL yyyy', {
                  locale: ptBR,
                })}
              </time>
            </li>
            <li>
              <FiUser />
              <span>{post.data.author}</span>
            </li>
          </ul>
        </article>
      </a>
    </Link>
  );
}
