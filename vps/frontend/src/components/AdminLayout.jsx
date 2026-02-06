import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faUsers, faRobot, faArrowLeft, faGem, faTools } from '@fortawesome/free-solid-svg-icons';
import Logo from './Logo';

export default function AdminLayout({ children }) {
    const location = useLocation();

    const menuItems = [
        { path: '/admin', label: 'Overview', icon: faChartLine },
        { path: '/admin/users', label: 'Users', icon: faUsers },
        { path: '/admin/agents', label: 'Agents', icon: faRobot },
        { path: '/admin/plans', label: 'Plans', icon: faGem },
        { path: '/admin/maintenance', label: 'Maintenance', icon: faTools },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-deep)' }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                background: 'var(--color-bg-elevated)',
                borderRight: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 100
            }}>
                <div style={{ padding: 'var(--spacing-xl)', borderBottom: '1px solid var(--color-border)' }}>
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <Logo size={32} />
                        <h3 style={{ margin: 0 }}>OpenClaw Admin</h3>
                    </Link>
                </div>

                <nav style={{ flex: 1, padding: 'var(--spacing-lg) 0' }}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-md)',
                                    padding: 'var(--spacing-md) var(--spacing-xl)',
                                    textDecoration: 'none',
                                    color: isActive ? 'var(--coral-bright)' : 'var(--color-text-secondary)',
                                    background: isActive ? 'rgba(255, 77, 77, 0.05)' : 'transparent',
                                    borderLeft: isActive ? '3px solid var(--coral-bright)' : '3px solid transparent',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <FontAwesomeIcon icon={item.icon} style={{ width: '20px' }} />
                                <span style={{ fontWeight: isActive ? 'var(--font-weight-semibold)' : 'normal' }}>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ padding: 'var(--spacing-xl)', borderTop: '1px solid var(--color-border)' }}>
                    <Link to="/dashboard" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', gap: 'var(--spacing-sm)' }}>
                        <FontAwesomeIcon icon={faArrowLeft} /> Back to App
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ marginLeft: '260px', flex: 1, padding: 'var(--spacing-2xl)', position: 'relative' }}>
                <div className="container-fluid" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
