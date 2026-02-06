import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const t = params.get('token');
        if (t) {
            setToken(t);
        } else {
            setError('Missing reset token. Please check your email link.');
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        if (password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);

        try {
            const response = await authAPI.resetPassword({ token, password });
            setMessage(response.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password. The link might be expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--gradient-hero)', padding: 'var(--spacing-lg)' }}>
            <div className="card-glass" style={{ maxWidth: '450px', width: '100%' }}>
                <div className="text-center mb-xl">
                    <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>🔐</div>
                    <h2>Reset Password</h2>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Enter your new password below</p>
                </div>

                {message ? (
                    <div style={{
                        padding: 'var(--spacing-md)',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid var(--color-success)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--spacing-lg)',
                        color: 'var(--color-success)',
                        textAlign: 'center'
                    }}>
                        {message}
                        <p style={{ fontSize: '0.9rem', marginTop: 'var(--spacing-md)' }}>Redirecting to login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{
                                padding: 'var(--spacing-md)',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid var(--color-error)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 'var(--spacing-lg)',
                                color: 'var(--color-error)',
                            }}>
                                {error}
                            </div>
                        )}

                        <div className="input-group">
                            <label className="input-label">New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading || !token}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <div className="text-center" style={{ marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--color-border)' }}>
                    <Link to="/login" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        ← Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}
