import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import VillageDashboard from './pages/VillageDashboard';
import HouseholdDashboard from './pages/HouseholdDashboard';
import SolarPage from './pages/SolarPage';
import WaterPage from './pages/WaterPage';
import WastePage from './pages/WastePage';
import RecommendationsPage from './pages/RecommendationsPage';
import AlertsPage from './pages/AlertsPage';
import ScorePage from './pages/ScorePage';
import AIAssistantPage from './pages/AIAssistantPage';

function AppRoutes() {
  const { role } = useAuth();

  return (
    <Routes>
      {/* Login is outside the layout */}
      <Route path="/login" element={<LoginPage />} />

      {/* Everything else inside layout */}
      <Route path="/" element={<Layout><LandingPage /></Layout>} />
      <Route path="/village" element={
        role === 'citizen'
          ? <Navigate to="/household" replace />
          : <Layout><VillageDashboard /></Layout>
      } />
      <Route path="/household" element={
        role === 'official'
          ? <Navigate to="/village" replace />
          : <Layout><HouseholdDashboard /></Layout>
      } />
      <Route path="/solar" element={<Layout><SolarPage /></Layout>} />
      <Route path="/water" element={<Layout><WaterPage /></Layout>} />
      <Route path="/waste" element={<Layout><WastePage /></Layout>} />
      <Route path="/recommendations" element={<Layout><RecommendationsPage /></Layout>} />
      <Route path="/alerts" element={<Layout><AlertsPage /></Layout>} />
      <Route path="/score" element={<Layout><ScorePage /></Layout>} />
      <Route path="/ai" element={<Layout><AIAssistantPage /></Layout>} />
      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
