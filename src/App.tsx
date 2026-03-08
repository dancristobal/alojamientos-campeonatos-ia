import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import Campeonatos from './views/Campeonatos';
import CampeonatoDetalle from './views/CampeonatoDetalle';
import Reservas from './views/Reservas';
import Arqueros from './views/Arqueros';
import Calendario from './views/Calendario';
import Settings from './views/Settings';

import { Toaster } from 'sonner';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="campeonatos" element={<Campeonatos />} />
          <Route path="campeonatos/:id" element={<CampeonatoDetalle />} />
          <Route path="reservas" element={<Reservas />} />
          <Route path="arqueros" element={<Arqueros />} />
          <Route path="calendario" element={<Calendario />} />
          <Route path="settings" element={<Settings />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
