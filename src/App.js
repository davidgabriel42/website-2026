import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import LandingPage from './pages/LandingPage';
import JigsawPuzzlePage from './pages/JigsawPuzzlePage';
import CopilotWidget from './components/CopilotWidget';

function App() {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/demos/jigsaw-puzzle" element={<JigsawPuzzlePage />} />
        </Route>
      </Routes>
      <CopilotWidget />
    </>
  );
}

export default App;
