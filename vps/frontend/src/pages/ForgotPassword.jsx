import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await authAPI.forgotPassword({ email });
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--gradient-hero)', padding: 'var(--spacing-lg)' }}>
            <div className="card-glass" style={{ maxWidth: '450px', width: '100%' }}>
                <div className="text-center mb-xl">
                    <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>🔑</div>
                    <h2>Forgot Password</h2>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Enter your email to receive a password reset link</p>
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
                        <div style={{ marginTop: 'var(--spacing-lg)' }}>
                            <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block' }}>Back to Login</Link>
                        </div>
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
                            <label className="input-label">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
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
