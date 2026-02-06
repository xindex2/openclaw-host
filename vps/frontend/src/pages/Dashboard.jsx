import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { instanceAPI } from '../services/api';
import InstanceCard from '../components/InstanceCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faPlus, faSignOutAlt, faChartLine, faTimes, faRocket, faGem } from '@fortawesome/free-solid-svg-icons';
import Logo from '../components/Logo';

export default function Dashboard() {
    const [instances, setInstances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [subdomain, setSubdomain] = useState('');
    const [error, setError] = useState('');
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadInstances();
    }, []);

    const loadInstances = async () => {
        try {
            const response = await instanceAPI.getAll();
            setInstances(response.data.instances);
        } catch (error) {
            console.error('Failed to load instances:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateInstance = async (e) => {
        e.preventDefault();
        setError('');
        setCreating(true);

        try {
            await instanceAPI.create({ subdomain });
            setSubdomain('');
            setShowCreateForm(false);
            await loadInstances();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create instance');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteInstance = async (id) => {
        if (!confirm('Are you sure you want to delete this instance? This action cannot be undone.')) {
            return;
        }

        try {
            await instanceAPI.delete(id);
            await loadInstances();
        } catch (error) {
            alert('Failed to delete instance');
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh' }}>
                <div className="text-center">
                    <Logo size={60} className="mb-md" />
                    <h3 className="text-gradient">Loading your agents...</h3>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
            {/* Header */}
            <header style={{
                background: 'var(--color-bg-elevated)',
                borderBottom: '1px solid var(--color-border)',
                padding: 'var(--spacing-md) 0',
            }}>
                <div className="container flex-between">
                    <div className="flex gap-md" style={{ alignItems: 'center' }}>
                        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                                <Logo size={28} />
                                <h3 style={{ margin: 0, fontSize: 'clamp(0.9rem, 4vw, 1.25rem)' }}>OpenClaw Host</h3>
                            </div>
                        </Link>
                    </div>
                    <div className="flex gap-sm" style={{ alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Link to="/profile" className="flex gap-sm" style={{ textDecoration: 'none', color: 'inherit', alignItems: 'center' }}>
                            <div style={{ textAlign: 'right' }} className="user-info-desktop">
                                <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>{user?.full_name}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                    {user?.plan || 'Free'}
                                </div>
                            </div>
                            {user?.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt={user.full_name}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        border: '2px solid var(--color-primary)',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <div className="flex-center" style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'var(--gradient-primary)',
                                    color: 'white',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold'
                                }}>
                                    {user?.full_name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </Link>
                        {user?.role === 'admin' && (
                            <Link to="/admin" className="btn btn-ghost" style={{ color: 'var(--color-secondary)', padding: '0.5rem' }}>
                                <FontAwesomeIcon icon={faChartLine} />
                            </Link>
                        )}
                        <button onClick={logout} className="btn btn-ghost" style={{ padding: '0.5rem' }}>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="container" style={{ paddingTop: 'var(--spacing-2xl)', paddingBottom: 'var(--spacing-2xl)' }}>
                {/* Dashboard Header */}
                <div className="flex-between mb-xl" style={{ flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                    <div>
                        <h1 style={{ marginBottom: 'var(--spacing-sm)' }}>
                            Welcome, <span className="text-gradient">{user?.full_name?.split(' ')[0]}</span>
                        </h1>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                            Manage your agents and cloud resources.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="btn btn-primary"
                        style={{ alignSelf: 'flex-start' }}
                        disabled={instances.length >= (user?.maxInstances ?? 0)}
                    >
                        {showCreateForm ? <><FontAwesomeIcon icon={faTimes} /> Cancel</> : <><FontAwesomeIcon icon={faPlus} /> New Agent</>}
                    </button>
                </div>

                {/* Usage Alert */}
                {(user?.maxInstances ?? 0) === 0 && (
                    <div className="card-glass mb-xl animate-fade-in" style={{
                        border: '1px solid var(--color-primary)',
                        background: 'rgba(255, 107, 107, 0.05)',
                        padding: 'var(--spacing-md)'
                    }}>
                        <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                            <div className="flex gap-md">
                                <span style={{ fontSize: '1.5rem' }}>🚀</span>
                                <div>
                                    <h4 style={{ margin: 0, color: 'var(--color-primary)' }}>Upgrade Required</h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem' }}>You need to upgrade your plan to start creating agents.</p>
                                </div>
                            </div>
                            <Link to="/billing" className="btn btn-primary btn-sm">Upgrade Now</Link>
                        </div>
                    </div>
                )}

                {instances.length >= (user?.maxInstances ?? 0) && (user?.maxInstances ?? 0) > 0 && (
                    <div className="card-glass mb-xl animate-fade-in" style={{
                        border: '1px solid var(--color-error)',
                        background: 'rgba(239, 68, 68, 0.05)',
                        padding: 'var(--spacing-md)'
                    }}>
                        <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                            <div className="flex gap-md">
                                <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                                <div>
                                    <h4 style={{ margin: 0, color: 'var(--color-error)' }}>Usage Limit Reached</h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem' }}>You have reached your limit of {user?.maxInstances} agents. Upgrade your plan to create more.</p>
                                </div>
                            </div>
                            <Link to="/billing" className="btn btn-primary btn-sm">Upgrade Now</Link>
                        </div>
                    </div>
                )}

                {/* Subscription Management Card */}
                <div className="card-glass mb-xl animate-fade-in" style={{ padding: 'var(--spacing-lg)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-xl)' }}>
                        <div>
                            <h4 style={{ margin: 0, color: 'var(--color-primary)' }}>
                                <FontAwesomeIcon icon={faGem} style={{ marginRight: '8px' }} />
                                Account Usage
                            </h4>
                            <div style={{ marginTop: 'var(--spacing-md)' }}>
                                <div className="flex-between mb-xs">
                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Agents Used</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{instances.length} / {user?.maxInstances ?? 0}</span>
                                </div>
                                <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${Math.min((instances.length / (user?.maxInstances || 1)) * 100, 100)}%`,
                                        height: '100%',
                                        background: (user?.maxInstances ?? 0) === 0 || instances.length >= (user?.maxInstances || 1) ? 'var(--color-error)' : 'var(--gradient-primary)',
                                        transition: 'width 0.5s ease'
                                    }} />
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Current Plan</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{user?.plan || 'Free'}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Link to="/billing" className="btn btn-ghost" style={{ border: '1px solid var(--color-primary)' }}>
                                Manage Subscription
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Create Instance Modal */}
                {showCreateForm && (
                    <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
                        <div className="modal-card animate-scale-in" onClick={e => e.stopPropagation()}>
                            <div className="flex-between mb-lg">
                                <h3 style={{ margin: 0 }}>Create New Agent</h3>
                                <button className="btn btn-ghost" onClick={() => setShowCreateForm(false)}>
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>

                            {error && (
                                <div className="alert alert-error mb-lg">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleCreateInstance}>
                                <div className="input-group">
                                    <label className="input-label">Agent Name</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={subdomain}
                                        onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                                        placeholder="my-agent"
                                        pattern="[a-z0-9-]+"
                                        autoFocus
                                        required
                                    />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-xs)', marginBottom: 'var(--spacing-md)' }}>
                                        Lowercase letters, numbers, and hyphens only
                                    </p>
                                    <div style={{
                                        padding: 'var(--spacing-sm) var(--spacing-md)',
                                        background: 'rgba(52, 211, 153, 0.05)',
                                        border: '1px solid rgba(52, 211, 153, 0.2)',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.85rem',
                                        color: 'var(--color-text-secondary)',
                                        marginBottom: 'var(--spacing-md)'
                                    }}>
                                        <FontAwesomeIcon icon={faGem} style={{ color: 'var(--coral-bright)', marginRight: '8px' }} />
                                        <strong>Note:</strong> Provide your own API keys inside the agent after creation.
                                    </div>
                                </div>

                                <div className="flex gap-md mt-xl">
                                    <button type="submit" className="btn btn-primary" disabled={creating} style={{ flex: 1 }}>
                                        {creating ? <LoadingSpinner size="small" /> : <><FontAwesomeIcon icon={faRocket} /> Create Agent</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Instances Grid */}
                {instances.length === 0 ? (
                    <div className="card-glass text-center" style={{ padding: 'var(--spacing-2xl)' }}>
                        <FontAwesomeIcon icon={faRobot} style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)', color: 'var(--color-primary)' }} />
                        <h3>No Agents Yet</h3>
                        <p style={{ marginBottom: 'var(--spacing-xl)' }}>
                            Create your first OpenClaw agent to get started!
                        </p>
                        <button onClick={() => setShowCreateForm(true)} className="btn btn-primary" style={{ width: 'auto' }}>
                            <FontAwesomeIcon icon={faPlus} /> Create Your First Agent
                        </button>
                    </div>
                ) : (
                    <div className="responsive-grid">
                        {instances.map((instance) => (
                            <InstanceCard
                                key={instance.id}
                                instance={instance}
                                onRefresh={loadInstances}
                                onDelete={handleDeleteInstance}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
