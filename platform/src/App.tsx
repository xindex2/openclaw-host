import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import Maintenance from './pages/Maintenance';
import ThankYou from './pages/ThankYou';
import Hosting from './pages/seo/Hosting';
import VPS from './pages/seo/VPS';
import Deploy from './pages/seo/Deploy';
import Install from './pages/seo/Install';
import Shell from './components/Shell';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
    const { token, user, loading } = useAuth();

    if (loading) return null;
    if (!token) return <Navigate to="/login" replace />;
    if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;

    return <Shell>{children}</Shell>;
}

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* SEO Pages */}
            <Route path="/hosting" element={<Hosting />} />
            <Route path="/vps" element={<VPS />} />
            <Route path="/deploy" element={<Deploy />} />
            <Route path="/install" element={<Install />} />
            <Route path="/thank-you" element={<ThankYou />} />

            {/* Protected User Routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                    <AdminDashboard />
                </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
                <ProtectedRoute adminOnly>
                    <UserManagement />
                </ProtectedRoute>
            } />
            <Route path="/admin/maintenance" element={
                <ProtectedRoute adminOnly>
                    <Maintenance />
                </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
