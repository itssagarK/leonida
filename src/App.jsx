import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GrainOverlay from './components/common/GrainOverlay';
import TickerHeader from './components/common/TickerHeader';
import Navbar from './components/common/Navbar';
import LandingScreen from './screens/LandingScreen';
import CaseListScreen from './screens/CaseListScreen';
import CaseIntroScreen from './screens/CaseIntroScreen';
import CustodyLogScreen from './screens/CustodyLogScreen';
import EditorScreen from './screens/EditorScreen';
import DriftStatusScreen from './screens/DriftStatusScreen';
import RevealScreen from './screens/RevealScreen';

export default function App() {
  return (
    <BrowserRouter>
      {/* Subtle CRT film-grain and scanline texture */}
      <GrainOverlay />

      {/* Global wire-service ticker across all despatches */}
      <TickerHeader />

      {/* Persistent classified desk navigation */}
      <Navbar />

      <main className="wire-app-content">
        <Routes>
          <Route path="/" element={<LandingScreen />} />
          <Route path="/cases" element={<CaseListScreen />} />
          <Route path="/case/:id" element={<CaseIntroScreen />} />
          <Route path="/case/:id/custody" element={<CustodyLogScreen />} />
          <Route path="/case/:id/edit" element={<EditorScreen />} />
          <Route path="/case/:id/status" element={<DriftStatusScreen />} />
          <Route path="/case/:id/reveal" element={<RevealScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
