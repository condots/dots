import React, { useEffect } from 'react';

import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import { updateOntology } from '@/store/onto';
import { updateMediaTypes } from '@/store/app';
import InfoDialog from '@/components/InfoDialog';
import ProfileMenu from '@/components/ProfileMenu';
import Canvas from '@/components/Canvas';
import DraggedClass from './components/DraggedClass';

export default function App() {
  useEffect(() => {
    updateMediaTypes().then(() => {
      const source = 'spdx-model.ttl';
      const model = 'model.json';
      updateOntology(source, model);
    });
  }, []);

  return (
    <div className="fixed h-screen w-screen bg-[#fafafa]">
      <InfoDialog />
      <ProfileMenu />
      <Canvas />
      <DraggedClass />
    </div>
  );
}
