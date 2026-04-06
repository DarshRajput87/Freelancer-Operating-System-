import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Invoices from './pages/Invoices';
import Proposals from './pages/Proposals';
import Settings from './pages/Settings';
import { Login, Register } from './pages/Auth';
import { AIAnalyzer, AIProposal, AITaskBreakdown, AIReplyAssistant } from './pages/AIPages';
import { Spinner } from './components/ui';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { isAuthenticated, fetchMe, token } = useAuthStore();

  useEffect(() => {
    if (token && isAuthenticated) fetchMe();
  }, []);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#1f2937', color: '#f9fafb', border: '1px solid #374151', fontSize: '13px' },
          success: { iconTheme: { primary: '#10b981', secondary: '#f9fafb' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#f9fafb' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected */}
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/:id" element={<ClientDetail />} />
          <Route path="projects" element={<Projects />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="proposals" element={<Proposals />} />
          <Route path="settings" element={<Settings />} />
          <Route path="ai/analyzer" element={<AIAnalyzer />} />
          <Route path="ai/proposal" element={<AIProposal />} />
          <Route path="ai/tasks" element={<AITaskBreakdown />} />
          <Route path="ai/reply" element={<AIReplyAssistant />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
