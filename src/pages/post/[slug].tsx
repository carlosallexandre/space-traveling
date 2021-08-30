import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <strong>Carregando...</strong>;
  }

  const wordsTotal = post.data.content.reduce<number>((accumulator, cont) => {
    return (
      accumulator +
      cont.heading.split(' ').length +
      cont.body
        .map(({ text }) => text.split(' ').length)
        .reduce((acc, wordAmount) => acc + wordAmount)
    );
  }, 0);

  const estimatedReadTimeMinutes = Math.ceil(wordsTotal / 200);

  return (
    <>
      <div className={styles.banner}>
        <img src={post.data.banner.url} alt="" />
      </div>

      <main className={commonStyles.container}>
        <h1 className={styles.postTitle}>{post.data.title}</h1>

        <div className={styles.postInfo}>
          <span>
            <FiCalendar />
            <time>
              {format(parseISO(post.first_publication_date), 'dd LLL yyyy', {
                locale: ptBR,
              })}
            </time>
          </span>
          <span>
            <FiUser />
            <span>{post.data.author}</span>
          </span>
          <span>
            <FiClock />
            <span>{estimatedReadTimeMinutes} min</span>
          </span>
        </div>

        {post.data.content.map(({ heading, body }, index) => (
          <section className={styles.postSection} key={String(index)}>
            <h2>{heading}</h2>
            <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }} />
          </section>
        ))}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    { pageSize: 2 }
  );

  const paths = posts.results.map(post => ({ params: { slug: post.uid } }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  console.log(params);

  const prismic = getPrismicClient();
  const response = await prismic.getByUID(
    'posts',
    params.slug?.toString(),
    null
  );

  return {
    props: { post: response },
    revalidate: 1,
  };
};
