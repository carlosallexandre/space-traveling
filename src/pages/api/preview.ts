import { NextApiRequest, NextApiResponse } from 'next';
import { getPrismicClient } from '../../services/prismic';

function linkResolver(doc): string {
  // Pretty URLs for known types
  if (doc.type === 'posts') {
    return `/post/${doc.uid}`;
  }

  // Fallback for other types, in case new custom types get created
  return `/${doc.uid}`;
}

export default async function preview(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { token: ref, documentId } = req.query;

  // Check the token parameter against the Prismic SDK
  const prismicClient = getPrismicClient();
  const url = await prismicClient
    .getPreviewResolver(ref as string, documentId as string)
    .resolve(linkResolver, '/');

  if (!url) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  // Enable Preview Mode by setting the cookies
  res.setPreviewData({
    ref, // pass the ref to pages so that they can fetch the draft ref
  });

  // Redirect the user to the share endpoint from same origin. This is
  // necessary due to a Chrome bug:
  // https://bugs.chromium.org/p/chromium/issues/detail?id=696204
  res.write(
    `<!DOCTYPE html><html><head><meta http-equiv="Refresh" content="0; url=${url}" />
    <script>window.location.href = '${url}'</script>
    </head>`
  );

  return res.end();
}
