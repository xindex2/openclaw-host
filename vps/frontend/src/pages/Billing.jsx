import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faGem,
    faCheckCircle,
    faExternalLinkAlt,
    faCrown,
    faArrowRight,
    faSignOutAlt,
    faChevronLeft,
    faRocket,
    faShieldAlt,
    faHistory
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Logo from '../components/Logo';
import Footer from '../components/Footer';

export default function Billing() {
    const { user, logout, loading: authLoading } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const plans = [
        {
            id: 'plan_Ke7ZeyJO29DwZ',
            name: "One Agent",
            price: "$19",
            limit: 1,
            features: ["Dedicated VPS Instance", "1-Click Tool Installation", "Web Terminal SSH", "Persistent Storage"],
            checkoutUrl: "https://whop.com/checkout/plan_Ke7ZeyJO29DwZ",
            color: 'var(--color-primary)'
        },
        {
            id: 'plan_9NRNdPMrVzwi8',
            name: "5 Agents",
            price: "$69",
            limit: 5,
            features: ["Dedicated CPU/RAM", "Priority Support", "Multi-Agent Dashboard", "Weekly Backups"],
            popular: true,
            checkoutUrl: "https://whop.com/checkout/plan_9NRNdPMrVzwi8",
            color: 'var(--coral-bright)'
        },
        {
            id: 'plan_XXO2Ey0ki51AI',
            name: "10 Agents",
            price: "$99",
            limit: 10,
            features: ["High-Performance VPS", "Advanced Monitoring", "Global Edge Network", "24/7 Priority Support"],
            checkoutUrl: "https://whop.com/checkout/plan_XXO2Ey0ki51AI",
            color: 'var(--color-success)'
        },
    ];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/instances');
                setStats({ agentCount: res.data.instances.length });
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchStats();
        document.title = "Billing & Subscription - OpenClaw Host";
    }, [user]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (authLoading || (loading && !stats)) return (
        <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
            <LoadingSpinner />
        </div>
    );

    const currentPlan = plans.find(p => p.name === user?.plan) || {
        name: user?.plan || 'Free Tier',
        limit: user?.maxInstances || 0,
        color: 'var(--color-text-muted)'
    };

    const usagePercent = Math.min(((stats?.agentCount || 0) / (currentPlan.limit || 1)) * 100, 100);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{
                background: 'var(--color-bg-elevated)',
                borderBottom: '1px solid var(--color-border)',
                padding: 'var(--spacing-md) 0',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backdropFilter: 'blur(10px)'
            }}>
                <div className="container flex-between">
                    <div className="flex gap-md" style={{ alignItems: 'center' }}>
                        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                                <Logo size={28} />
                                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>OpenClaw Host</h3>
                            </div>
                        </Link>
                    </div>
                    <div className="flex gap-md" style={{ alignItems: 'center' }}>
                        <Link to="/dashboard" className="btn btn-ghost btn-sm desktop-only">
                            Dashboard
                        </Link>
                        <div style={{ height: '24px', width: '1px', background: 'var(--color-border)', margin: '0 8px' }} className="desktop-only" />
                        <div style={{ textAlign: 'right' }} className="desktop-only">
                            <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: '0.9rem' }}>{user?.full_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{user?.plan || 'Free'}</div>
                        </div>
                        <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)' }}>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1, padding: 'var(--spacing-2xl) 0' }}>
                <div className="container">
                    {/* Breadcrumbs */}
                    <nav style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <Link to="/dashboard" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FontAwesomeIcon icon={faChevronLeft} size="xs" /> Back to Dashboard
                        </Link>
                    </nav>

                    <header className="mb-2xl flex-between" style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--spacing-lg)' }}>
                        <div>
                            <h1 className="text-gradient mb-xs">Subscription & Billing</h1>
                            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Manage your plan, limits, and secure payments via Whop Hub.</p>
                        </div>
                        <a href="https://whop.com/hub/" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ boxShadow: 'var(--shadow-primary)' }}>
                            <FontAwesomeIcon icon={faExternalLinkAlt} style={{ marginRight: '8px' }} /> Open Whop Hub
                        </a>
                    </header>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--spacing-2xl)', marginBottom: 'var(--spacing-3xl)' }}>
                        {/* Current Plan High-Fidelity Card */}
                        <div className="card-glass" style={{
                            padding: 'var(--spacing-2xl)',
                            borderLeft: `4px solid ${currentPlan.color || 'var(--color-primary)'}`,
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05 }}>
                                <FontAwesomeIcon icon={faGem} style={{ fontSize: '10rem' }} />
                            </div>

                            <div className="flex-between mb-xl">
                                <div>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        color: currentPlan.color,
                                        background: `${currentPlan.color}15`,
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        marginBottom: '12px',
                                        display: 'inline-block'
                                    }}>
                                        Active Subscription
                                    </span>
                                    <h2 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 800 }}>{currentPlan.name}</h2>
                                </div>
                                <FontAwesomeIcon icon={faGem} style={{ fontSize: '3rem', color: currentPlan.color, opacity: 0.8 }} />
                            </div>

                            <div className="mb-xl">
                                <div className="flex-between mb-sm">
                                    <span style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>Agent Usage</span>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{stats?.agentCount || 0} / {currentPlan.limit}</span>
                                </div>
                                <div style={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{
                                        width: `${usagePercent}%`,
                                        height: '100%',
                                        background: usagePercent >= 100 && currentPlan.limit > 0 ? 'var(--color-error)' : `linear-gradient(90deg, ${currentPlan.color} 0%, var(--coral-bright) 100%)`,
                                        boxShadow: `0 0 15px ${currentPlan.color}40`,
                                        transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)'
                                    }} />
                                </div>
                                {usagePercent >= 100 && currentPlan.limit > 0 && (
                                    <p style={{ color: 'var(--color-error)', fontSize: '0.85rem', marginTop: '8px', fontWeight: '500' }}>
                                        Limit reached! Upgrade to create more agents.
                                    </p>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                <div className="card-glass" style={{ padding: 'var(--spacing-md)', background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Billing Cycle</div>
                                    <div style={{ fontWeight: 'bold' }}>Monthly</div>
                                </div>
                                <div className="card-glass" style={{ padding: 'var(--spacing-md)', background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</div>
                                    <div style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>Active</div>
                                </div>
                            </div>
                        </div>

                        {/* Plan Benefits & Info */}
                        <div className="flex flex-column gap-lg">
                            <div className="card-glass" style={{ padding: 'var(--spacing-xl)', flex: 1 }}>
                                <h3 className="mb-lg flex items-center gap-sm">
                                    <FontAwesomeIcon icon={faShieldAlt} style={{ color: 'var(--color-primary)' }} />
                                    Security & Support
                                </h3>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'var(--color-success)' }} />
                                        <span>Instant auto-synchronization with Whop</span>
                                    </li>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'var(--color-success)' }} />
                                        <span>Encrypted payment processing</span>
                                    </li>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'var(--color-success)' }} />
                                        <span>24/7 technical infrastructure monitoring</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="card-glass" style={{ padding: 'var(--spacing-xl)', background: 'rgba(255,107,107,0.03)' }}>
                                <h4 className="mb-md flex items-center gap-sm">
                                    <FontAwesomeIcon icon={faHistory} />
                                    Need historical invoices?
                                </h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                                    All billing history and downloadable PDFs are available in your personal <a href="https://whop.com/hub/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--coral-bright)' }}>Whop Library</a>.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Upgrade Options */}
                    <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
                        <h2 className="text-gradient">Available Upgrades</h2>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Scale your AI operations instantly with our premium tiers.</p>
                    </div>

                    <div className="responsive-grid" style={{ marginBottom: 'var(--spacing-3xl)' }}>
                        {plans.map((plan, i) => {
                            const isCurrent = plan.name === user?.plan;
                            const isUpgrade = plan.limit > (currentPlan.limit || 0);

                            return (
                                <div key={i} className={`card-glass ${plan.popular ? 'popular-card' : ''}`} style={{
                                    padding: 'var(--spacing-2xl)',
                                    border: isCurrent ? `2px solid ${plan.color}` : '1px solid var(--color-border)',
                                    background: isCurrent ? `${plan.color}05` : 'var(--color-bg-elevated)',
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                }}>
                                    {plan.popular && <div className="popular-badge">Most Popular</div>}

                                    <div className="flex-between mb-lg">
                                        <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{plan.name}</h3>
                                        {isCurrent && <span className="badge badge-success" style={{ padding: '4px 12px' }}>Current</span>}
                                    </div>

                                    <div className="mb-xl">
                                        <span style={{ fontSize: '3rem', fontWeight: 800, color: 'white' }}>{plan.price}</span>
                                        <span style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}> / month</span>
                                    </div>

                                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: 'var(--spacing-2xl)', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {plan.features.map((f, j) => (
                                            <li key={j} style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <FontAwesomeIcon icon={faCheckCircle} style={{ color: plan.color, fontSize: '1rem' }} />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    {isUpgrade ? (
                                        <a href={plan.checkoutUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', padding: '1rem', fontWeight: 'bold', fontSize: '1rem' }}>
                                            Upgrade now <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: '8px' }} />
                                        </a>
                                    ) : isCurrent ? (
                                        <button className="btn btn-ghost" disabled style={{ width: '100%', border: '1px solid var(--color-border)', opacity: 0.5, cursor: 'default' }}>
                                            Current Active Plan
                                        </button>
                                    ) : (
                                        <button className="btn btn-ghost" disabled style={{ width: '100%', border: '1px solid var(--color-border)', opacity: 0.3, cursor: 'default' }}>
                                            Lower Tier
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />

            <style>{`
                .popular-badge {
                    position: absolute;
                    top: -15px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(90deg, var(--coral-bright) 0%, #ff8e8e 100%);
                    color: white;
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
                    z-index: 2;
                }
                .popular-card {
                    box-shadow: 0 15px 40px rgba(255, 107, 107, 0.1);
                    transform: scale(1.02);
                }
                .popular-card:hover {
                    transform: scale(1.04);
                }
                .card-glass:hover {
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }
                @media (max-width: 768px) {
                    .desktop-only { display: none !important; }
                    .popular-card { transform: none !important; }
                }
            `}</style>
        </div>
    );
}
