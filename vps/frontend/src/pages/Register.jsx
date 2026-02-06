import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [formData, setFormData] = useState({ full_name: '', email: '', password: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userData = params.get('user');
        const googleError = params.get('error');

        if (token && userData) {
            try {
                const user = JSON.parse(decodeURIComponent(userData));
                login(token, user);
                navigate('/dashboard');
            } catch (e) {
                console.error('Failed to parse user data from Google', e);
                setErrors({ submit: 'Google authentication failed. Please try again.' });
            }
        } else if (googleError) {
            setErrors({ submit: 'Google authentication failed. Please try again.' });
        }
    }, [location, login, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error for this field
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const validate = () => {
        const newErrors = {};

        if (formData.full_name.length < 2) {
            newErrors.full_name = 'Full name must be at least 2 characters';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (formData.password.length === 0) {
            newErrors.password = 'Password is required';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        return newErrors;
    };

    const handleGoogleLogin = () => {
        setLoading(true);
        // Using window.location.origin to stay on the same domain
        window.location.href = `${window.location.origin}/api/auth/google`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await authAPI.register({
                full_name: formData.full_name,
                email: formData.email,
                password: formData.password,
                acquisition_source: sessionStorage.getItem('acquisition_source') || 'Direct'
            });
            login(response.data.token, response.data.user);
            navigate('/dashboard');
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Registration failed. Please try again.';
            setErrors({ submit: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--gradient-hero)', padding: 'var(--spacing-lg)' }}>
            <div className="card-glass" style={{ maxWidth: '500px', width: '100%' }}>
                <div className="text-center mb-xl">
                    <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>🚀</div>
                    <h2>Create Your Account</h2>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Start hosting your OpenClaw instances</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {errors.submit && (
                        <div style={{
                            padding: 'var(--spacing-md)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid var(--color-error)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--spacing-lg)',
                            color: 'var(--color-error)',
                        }}>
                            {errors.submit}
                        </div>
                    )}

                    <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                            autoComplete="name"
                        />
                        {errors.full_name && <div className="input-error">{errors.full_name}</div>}
                    </div>

                    <div className="input-group">
                        <label className="input-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            required
                            autoComplete="email"
                        />
                        {errors.email && <div className="input-error">{errors.email}</div>}
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            autoComplete="new-password"
                        />
                        {errors.password && <div className="input-error">{errors.password}</div>}
                    </div>

                    <div className="input-group">
                        <label className="input-label">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            autoComplete="new-password"
                        />
                        {errors.confirmPassword && <div className="input-error">{errors.confirmPassword}</div>}
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>

                    <div style={{ margin: 'var(--spacing-lg) 0', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 'bold' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="btn btn-ghost"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', border: '1px solid var(--color-border)' }}
                        disabled={loading}
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18">
                            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285f4" />
                            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34a853" />
                            <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.172.282-1.712V4.956H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.044l3.007-2.332z" fill="#fbbc05" />
                            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.956l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z" fill="#ea4335" />
                        </svg>
                        Continue with Google
                    </button>
                </form>

                <div className="text-center" style={{ marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--color-border)' }}>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--color-primary)' }}>Login</Link>
                    </p>
                    <Link to="/" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: 'var(--spacing-sm)', display: 'inline-block' }}>
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}
