import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUser, faLock, faCamera, faSave, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Logo from '../components/Logo';

export default function Profile() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        avatar_url: user?.avatar_url || '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                full_name: user.full_name,
                avatar_url: user.avatar_url || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password && formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);

        try {
            const updates = {
                full_name: formData.full_name,
                avatar_url: formData.avatar_url
            };
            if (formData.password) updates.password = formData.password;

            const response = await authAPI.updateProfile(updates);

            // Update local user state
            const token = localStorage.getItem('token');
            login(token, { ...user, ...response.data.user });

            setSuccess('Profile updated successfully!');
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
            <header style={{
                background: 'var(--color-bg-elevated)',
                borderBottom: '1px solid var(--color-border)',
                padding: 'var(--spacing-md) 0',
            }}>
                <div className="container flex-between">
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                            <Logo size={28} />
                            <h3 style={{ margin: 0 }}>OpenClaw Host</h3>
                        </div>
                    </Link>
                    <Link to="/dashboard" className="btn btn-ghost btn-sm">
                        <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '8px' }} />
                        Back to Dashboard
                    </Link>
                </div>
            </header>

            <div className="container" style={{ paddingTop: 'var(--spacing-2xl)', paddingBottom: 'var(--spacing-2xl)', maxWidth: '600px' }}>
                <div className="animate-fade-in">
                    <h1 className="mb-xl">Account Settings</h1>

                    <div className="card-glass" style={{ padding: 'var(--spacing-2xl)' }}>
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

                            {success && (
                                <div style={{
                                    padding: 'var(--spacing-md)',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    border: '1px solid var(--color-success)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: 'var(--spacing-lg)',
                                    color: 'var(--color-success)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                    {success}
                                </div>
                            )}

                            <div className="text-center mb-xl">
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    {formData.avatar_url ? (
                                        <img
                                            src={formData.avatar_url}
                                            alt="Avatar"
                                            style={{
                                                width: '100px',
                                                height: '100px',
                                                borderRadius: '50%',
                                                border: '3px solid var(--color-primary)',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    ) : (
                                        <div className="flex-center" style={{
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: '50%',
                                            background: 'var(--gradient-primary)',
                                            fontSize: '2.5rem',
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}>
                                            {formData.full_name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '0',
                                        right: '0',
                                        background: 'var(--color-bg-elevated)',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid var(--color-border)',
                                        color: 'var(--color-primary)'
                                    }}>
                                        <FontAwesomeIcon icon={faCamera} size="sm" />
                                    </div>
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label"><FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} /> Full Name</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label"><FontAwesomeIcon icon={faCamera} style={{ marginRight: '8px' }} /> Avatar URL</label>
                                <input
                                    type="url"
                                    name="avatar_url"
                                    value={formData.avatar_url}
                                    onChange={handleChange}
                                    placeholder="https://example.com/photo.jpg"
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                    Provide a public URL to your profile picture.
                                </p>
                            </div>

                            <hr style={{ margin: 'var(--spacing-xl) 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />

                            <h4 className="mb-md"><FontAwesomeIcon icon={faLock} style={{ marginRight: '8px' }} /> Change Password</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-md)' }}>
                                Leave blank to keep your current password.
                            </p>

                            <div className="input-group">
                                <label className="input-label">New Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--spacing-lg)' }} disabled={loading}>
                                {loading ? <LoadingSpinner size="small" /> : <><FontAwesomeIcon icon={faSave} style={{ marginRight: '8px' }} /> Save Changes</>}
                            </button>
                        </form>
                    </div>

                    <div className="card-glass mt-xl" style={{ padding: 'var(--spacing-xl)' }}>
                        <h4>Account Details</h4>
                        <div style={{ marginTop: 'var(--spacing-md)', fontSize: '0.9rem' }}>
                            <div className="flex-between mb-sm">
                                <span style={{ color: 'var(--color-text-muted)' }}>Email Address</span>
                                <span>{user?.email}</span>
                            </div>
                            <div className="flex-between mb-sm">
                                <span style={{ color: 'var(--color-text-muted)' }}>Memeber Since</span>
                                <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="flex-between">
                                <span style={{ color: 'var(--color-text-muted)' }}>Plan</span>
                                <span className="status-badge status-active" style={{ fontSize: '0.75rem' }}>{user?.plan}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
