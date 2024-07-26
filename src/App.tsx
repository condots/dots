import { useEffect } from 'react';

import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import { updateOntology } from '@/store/onto';
import { updateMediaTypes } from '@/store/app';
import InfoDialog from '@/components/InfoDialog';
import ProfileMenu from '@/components/ProfileMenu';
import Canvas from '@/components/Canvas';
import Alert from '@/components/Alert';
import HelpDialog from '@/components/HelpDialog';
import AboutDialog from '@/components/AboutDialog';

export default function App() {
  useEffect(() => {
    updateMediaTypes().then(() => {
      const source = 'spdx-model.ttl';
      const jsonLdContextSource =
        'https://spdx.github.io/spdx-spec/v3.0/model/spdx-context.jsonld';
      const jsonLdContextUrl = 'https://spdx.org/rdf/3.0.0/spdx-context.jsonld';
      const model = 'model.json';
      updateOntology(source, jsonLdContextSource, jsonLdContextUrl, model);
    });
  }, []);

  return (
    <div className="fixed h-screen w-screen bg-[#fafafa]">
      <Alert />
      <InfoDialog />
      <ProfileMenu />
      <HelpDialog />
      <AboutDialog />
      <Canvas />
    </div>
  );
}
