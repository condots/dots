import { useEffect, useRef } from 'react';
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/github.css';
import json from 'highlight.js/lib/languages/json';

hljs.registerLanguage('json', json);

function JsonHighlight({ value }: { value: string }) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.dataset.highlighted = '';
      hljs.highlightElement(codeRef.current);
    }
  }, [value]);

  return (
    <pre>
      <code ref={codeRef} className={`language-json`}>
        {value}
      </code>
    </pre>
  );
}

export default JsonHighlight;
