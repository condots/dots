import { useEffect, useState } from 'react';
import { useReactFlow } from 'reactflow';

import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import { updateOntology } from '@/store/onto';
import { updateMediaTypes } from '@/store/app';
import InfoDialog from '@/components/InfoDialog';
import ProfileMenu from '@/components/ProfileMenu';
import Canvas from '@/components/Canvas';
import AlertDialog from '@/components/AlertDialog';
import HelpDialog from '@/components/HelpDialog';
import AlertToast from '@/components/AlertToast';
import AboutDialog from '@/components/AboutDialog';
import Loader from '@/components/Loader';
import PreviewDialog from '@/components/PreviewDialog';
import { importExample } from '@/scripts/app-utils';

export default function App() {
  const { fitView } = useReactFlow();
  const [exampleLoaded, setExampleLoaded] = useState(false);

  useEffect(() => {
    updateMediaTypes().then(async () => {
      const source = 'spdx-model.ttl';
      const jsonLdContextSource =
        'https://spdx.github.io/spdx-spec/v3.0.0/rdf/spdx-context.jsonld';
      const jsonLdContextUrl = 'https://spdx.org/rdf/3.0.0/spdx-context.jsonld';
      const model = 'model.json';
      await updateOntology(
        source,
        jsonLdContextSource,
        jsonLdContextUrl,
        model
      );
      if (import.meta.env.PROD) {
        await importExample();
        setExampleLoaded(true);
      }
    });
  }, []);

  useEffect(() => {
    if (exampleLoaded) {
      fitView({ duration: 200 });
    }
  }, [exampleLoaded, fitView]);

  return (
    <div className="fixed h-screen w-screen bg-[#fafafa]">
      <AlertDialog />
      <AlertToast />
      <InfoDialog />
      <Loader />
      <HelpDialog />
      <AboutDialog />
      <PreviewDialog />
      <ProfileMenu />
      <Canvas />
    </div>
  );
}
