import React, { useEffect } from 'react';

import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import { updateOntology } from '@/store/onto';
import { updateMediaTypes } from '@/store/app';
import InfoDialog from '@/components/Onto/InfoDialog';
import PropPanel from '@/components/Prop/PropPanel';
import ClassMenu from '@/components/Onto/ClassMenu';
import InstCanvas from '@/components/Inst/InstCanvas';

export default function App() {
  useEffect(() => {
    const source = 'spdx-model.ttl';
    const model = 'model.json';
    updateOntology(source, model);
    updateMediaTypes();
  }, []);

  return (
    <div className="h-screen w-screen bg-[#fafafa]">
      <InfoDialog />
      <PropPanel />
      <ClassMenu />
      <InstCanvas />
    </div>
  );
}
