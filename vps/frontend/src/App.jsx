import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Terminal from './pages/Terminal';
import ThankYou from './pages/ThankYou';
import Billing from './pages/Billing';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AgentManagement from './pages/admin/AgentManagement';
import AdminLayout from './components/AdminLayout';
import PlanManagement from './pages/admin/PlanManagement';
import Maintenance from './pages/admin/Maintenance';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ToS from './pages/legal/ToS';
import Privacy from './pages/legal/Privacy';
import Contact from './pages/Contact';
import VPS from './pages/seo/VPS';
import Hosting from './pages/seo/Hosting';
import Install from './pages/seo/Install';
import Deploy from './pages/seo/Deploy';
import './index.css';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh' }}>
                <div className="text-center">
                    <h2 className="text-gradient">Loading...</h2>
                </div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh' }}>
                <div className="text-center">
                    <h2 className="text-gradient">Loading...</h2>
                </div>
            </div>
        );
    }

    return isAuthenticated && isAdmin ? children : <Navigate to="/dashboard" />;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/tos" element={<ToS />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/openclaw-vps" element={<VPS />} />
                    <Route path="/openclaw-hosting" element={<Hosting />} />
                    <Route path="/install-openclaw" element={<Install />} />
                    <Route path="/deploy-openclaw" element={<Deploy />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/terminal/:instanceId"
                        element={
                            <ProtectedRoute>
                                <Terminal />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/thank-you"
                        element={
                            <ProtectedRoute>
                                <ThankYou />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/billing"
                        element={
                            <ProtectedRoute>
                                <Billing />
                            </ProtectedRoute>
                        }
                    />
                    {/* Admin Routes */}
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminLayout>
                                    <AdminDashboard />
                                </AdminLayout>
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/users"
                        element={
                            <AdminRoute>
                                <AdminLayout>
                                    <UserManagement />
                                </AdminLayout>
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/agents"
                        element={
                            <AdminRoute>
                                <AdminLayout>
                                    <AgentManagement />
                                </AdminLayout>
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/plans"
                        element={
                            <AdminRoute>
                                <AdminLayout>
                                    <PlanManagement />
                                </AdminLayout>
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/maintenance"
                        element={
                            <AdminRoute>
                                <AdminLayout>
                                    <Maintenance />
                                </AdminLayout>
                            </AdminRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
