import { useEffect } from 'react';

export function Comments(): JSX.Element {
  const COMMENT_NODE_ID = 'comments';
  const REPO_NAME = 'carlosallexandre/space-traveling';

  useEffect(() => {
    const scriptParentNode = document.getElementById(COMMENT_NODE_ID);
    if (!scriptParentNode) return () => false;

    // docs - https://utteranc.es/
    const script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    script.async = true;
    script.setAttribute('repo', REPO_NAME);
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('label', 'comment :speech_balloon:');
    script.setAttribute('theme', 'photon-dark');
    script.setAttribute('crossorigin', 'anonymous');

    scriptParentNode.appendChild(script);

    return () => {
      // cleanup - remove the older script with previous theme
      scriptParentNode.removeChild(scriptParentNode.firstChild as Node);
    };
  }, []);

  return <section id={COMMENT_NODE_ID} />;
}
