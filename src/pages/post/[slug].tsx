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
import { Comments } from '../../components/Comments';
import { PostLink } from '../../components/PostLink';

interface Post {
  uid: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
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
  nextPost?: Post;
  prevPost?: Post;
  previewRef?: string;
}

export default function Post({
  post,
  nextPost,
  prevPost,
  previewRef,
}: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <main className={commonStyles.container}>
        <strong>Carregando...</strong>
      </main>
    );
  }

  const exitPreview = (): Promise<void> =>
    fetch('http://localhost:3000/api/exit-preview').then(response => {
      if (response.redirected) {
        window.location.href = response.url;
      }
    });

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
        <article>
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

            {post.last_publication_date && (
              <div>
                * editado em{' '}
                {format(
                  parseISO(post.last_publication_date),
                  "dd LLL yyyy, 'às' HH:mm",
                  {
                    locale: ptBR,
                  }
                )}
              </div>
            )}
          </div>

          {post.data.content.map(({ heading, body }, index) => (
            <section className={styles.postSection} key={String(index)}>
              <h2>{heading}</h2>
              <div
                dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }}
              />
            </section>
          ))}
        </article>

        <hr className={styles.divider} />

        <nav className={styles.postNav}>
          {prevPost && (
            <PostLink href={`/post/${prevPost.uid}`}>
              {prevPost.data.title}
            </PostLink>
          )}

          {nextPost && (
            <PostLink href={`/post/${nextPost.uid}`} nextPost>
              {nextPost.data.title}
            </PostLink>
          )}
        </nav>

        <Comments />

        {previewRef && (
          <button
            type="button"
            onClick={exitPreview}
            className={styles.exitPreviewBtn}
          >
            Sair do modo Preview
          </button>
        )}
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

export const getStaticProps: GetStaticProps = async ({
  params,
  previewData,
}) => {
  const previewRef = previewData ? previewData.ref : null;
  const refOption = previewRef ? { ref: previewRef } : null;

  const postSlug = params.slug.toString();

  const prismic = getPrismicClient();
  const post = await prismic.getByUID('posts', postSlug, refOption);

  const [prevPost, nextPost] = await Promise.all([
    prismic.query(Prismic.predicates.at('document.type', 'posts'), {
      pageSize: 1,
      after: post.id,
      orderings: '[document.first_publication_date]',
    }),
    prismic.query(Prismic.predicates.at('document.type', 'posts'), {
      pageSize: 1,
      after: post.id,
      orderings: '[document.first_publication_date desc]',
    }),
  ]);

  return {
    props: {
      post,
      previewRef,
      prevPost: prevPost.results[0] ?? null,
      nextPost: nextPost.results[0] ?? null,
    },
    revalidate: 1,
  };
};
