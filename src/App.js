import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import LandingPage from './pages/LandingPage';
import DemosPage from './pages/DemosPage';
import BlogPage from './pages/BlogPage';
import HireMePage from './pages/HireMePage';
import JigsawPuzzlePage from './pages/JigsawPuzzlePage';
import CopilotWidget from './components/CopilotWidget';

function App() {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/demos" element={<DemosPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/hire-me" element={<HireMePage />} />
          <Route path="/demos/jigsaw-puzzle" element={<JigsawPuzzlePage />} />
        </Route>
      </Routes>
      <CopilotWidget />
    </>
  );
}

export default App;
