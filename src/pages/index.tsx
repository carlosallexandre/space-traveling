import { GetStaticProps } from 'next';
import { useState } from 'react';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';
import Post from '../components/Post';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const { results, next_page } = postsPagination;
  const [posts, setPosts] = useState(results || []);
  const [nextPage, setNextPage] = useState(next_page || null);
  const [loading, setLoading] = useState(false);

  const loadMorePosts = async (): Promise<void> => {
    setLoading(true);

    const res = await fetch(nextPage);
    const postResponse = await res.json();

    setPosts([...posts, ...postResponse.results]);
    setNextPage(postResponse.next_page);
    setLoading(false);
  };

  return (
    <main className={commonStyles.container}>
      <ul className={styles.postList}>
        {posts.map(post => (
          <li key={post.uid}>
            <Post post={post} />
          </li>
        ))}
      </ul>

      {nextPage && (
        <button
          disabled={loading}
          type="button"
          className={styles.loadMoreButton}
          onClick={() => loadMorePosts()}
        >
          Carregar mais posts
        </button>
      )}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    { pageSize: 2 }
  );

  return {
    props: {
      postsPagination: postsResponse,
    },
    revalidate: 60 * 60 * 1, // 1 hour
  };
};
