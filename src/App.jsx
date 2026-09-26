import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import GrainOverlay from './components/common/GrainOverlay';
import TickerHeader from './components/common/TickerHeader';
import WireAudioScanner from './components/common/WireAudioScanner';
import Navbar from './components/common/Navbar';
import LandingScreen from './screens/LandingScreen';
import CaseListScreen from './screens/CaseListScreen';
import CaseIntroScreen from './screens/CaseIntroScreen';
import CustodyLogScreen from './screens/CustodyLogScreen';
import EditorScreen from './screens/EditorScreen';
import DriftStatusScreen from './screens/DriftStatusScreen';
import RevealScreen from './screens/RevealScreen';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingScreen />} />
        <Route path="/cases" element={<CaseListScreen />} />
        <Route path="/case/:id" element={<CaseIntroScreen />} />
        <Route path="/case/:id/custody" element={<CustodyLogScreen />} />
        <Route path="/case/:id/edit" element={<EditorScreen />} />
        <Route path="/case/:id/status" element={<DriftStatusScreen />} />
        <Route path="/case/:id/reveal" element={<RevealScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Subtle CRT film-grain and scanline texture */}
      <GrainOverlay />

      {/* Global wire-service ticker across all despatches */}
      <TickerHeader />

      {/* Interactive Police Wire Audio Scanner */}
      <WireAudioScanner />

      {/* Persistent classified desk navigation */}
      <Navbar />

      <main className="wire-app-content">
        <AnimatedRoutes />
      </main>
    </BrowserRouter>
  );
}
