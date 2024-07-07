import React, { useEffect } from 'react';

import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import { updateOntology } from '@/store/onto';
import { updateMediaTypes } from '@/store/app';
import InfoDialog from '@/components/InfoDialog';
import ProfileMenu from '@/components/ProfileMenu';
import Canvas from '@/components/Canvas';

export default function App() {
  useEffect(() => {
    updateMediaTypes().then(() => {
      const source = 'spdx-model.ttl';
      const jsonLdContextSource =
        // 'https://spdx.org/rdf/3.0.0/spdx-context.jsonld';
        'https://spdx.github.io/spdx-spec/v3.0/model/spdx-context.jsonld';
      // const jsonLdContextSource = 'spdx-context.jsonld';
      const model = 'model.json';
      updateOntology(source, jsonLdContextSource, model);
    });
  }, []);

  return (
    <div className="fixed h-screen w-screen bg-[#fafafa]">
      <InfoDialog />
      <ProfileMenu />
      <Canvas />
    </div>
  );
}
