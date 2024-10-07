import { useEffect, useState, useCallback, useMemo } from 'react';
import { useReactFlow } from 'reactflow';

import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.min.css';

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

  const updateOntologyCallback = useCallback(async () => {
    const source = 'https://spdx.github.io/spdx-spec/v3.0.1/rdf/spdx-model.ttl';
    const jsonLdContextSource =
      'https://spdx.github.io/spdx-spec/v3.0.1/rdf/spdx-context.jsonld';
    const jsonLdContextUrl = 'https://spdx.org/rdf/3.0.1/spdx-context.jsonld';
    const model = 'spdx/3.0.1/model.json';
    await updateOntology(source, jsonLdContextSource, jsonLdContextUrl, model);
  }, []);

  const importExampleCallback = useCallback(async () => {
    if (import.meta.env.PROD) {
      await importExample();
      setExampleLoaded(true);
    }
  }, []);

  useEffect(() => {
    updateMediaTypes().then(async () => {
      await updateOntologyCallback();
      await importExampleCallback();
    });
  }, [updateOntologyCallback, importExampleCallback]);

  useEffect(() => {
    if (exampleLoaded) {
      fitView({ duration: 200 });
    }
  }, [exampleLoaded, fitView]);

  const appContent = useMemo(
    () => (
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
    ),
    []
  );

  return appContent;
}
