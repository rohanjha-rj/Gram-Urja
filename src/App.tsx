import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HouseholdProvider } from './context/HouseholdContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import VillageDashboard from './pages/VillageDashboard';
import HouseholdDashboard from './pages/HouseholdDashboard';
import SolarPage from './pages/SolarPage';
import WastePage from './pages/WastePage';
import RecommendationsPage from './pages/RecommendationsPage';
import AlertsPage from './pages/AlertsPage';
import ScorePage from './pages/ScorePage';
import AIAssistantPage from './pages/AIAssistantPage';

function AppRoutes() {
  const { role, loading } = useAuth();

  // Hold rendering until auth state is resolved (prevents flash / blank page)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(160deg,#0a0f1e 0%,#0a2e1c 60%,#030d07 100%)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
          <span className="text-emerald-300/70 text-sm font-medium">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root → role selector (LoginPage) */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Overview inside layout */}
      <Route path="/overview" element={<Layout><LandingPage /></Layout>} />
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
      <Route path="/waste" element={<Layout><WastePage /></Layout>} />
      <Route path="/recommendations" element={<Layout><RecommendationsPage /></Layout>} />
      <Route path="/alerts" element={<Layout><AlertsPage /></Layout>} />
      <Route path="/score" element={<Layout><ScorePage /></Layout>} />
      <Route path="/ai" element={<AIAssistantPage />} />
      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HouseholdProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </HouseholdProvider>
    </AuthProvider>
  );
}
