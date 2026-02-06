import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faRobot, faChartLine, faServer, faGem, faMicrochip, faMemory, faHdd } from '@fortawesome/free-solid-svg-icons';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await adminAPI.getStats();
            setStats(response.data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex-center" style={{ minHeight: '400px' }}><LoadingSpinner /></div>;

    const system = stats?.system || { cpu: { usage: 0 }, ram: { percent: 0 }, disk: { percent: 0 } };

    return (
        <div className="animate-fade-in">
            <h1 className="mb-xl">Admin Dashboard</h1>

            {/* Summary Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 'var(--spacing-xl)',
                marginBottom: 'var(--spacing-2xl)'
            }}>
                <div className="card">
                    <div className="flex-between">
                        <div>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>Total Users</div>
                            <h2 style={{ margin: 0 }}>{stats?.summary?.totalUsers}</h2>
                        </div>
                        <div style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>
                            <FontAwesomeIcon icon={faUsers} />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex-between">
                        <div>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>Total Agents</div>
                            <h2 style={{ margin: 0 }}>{stats?.summary?.totalAgents}</h2>
                        </div>
                        <div style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>
                            <FontAwesomeIcon icon={faRobot} />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex-between">
                        <div>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>Active Agents</div>
                            <h2 style={{ margin: 0 }}>{stats?.summary?.activeAgents}</h2>
                        </div>
                        <div style={{ fontSize: '2rem', color: 'var(--color-success)' }}>
                            <FontAwesomeIcon icon={faServer} />
                        </div>
                    </div>
                </div>
            </div>

            {/* System Health Section */}
            <h2 className="mb-lg">System Health</h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'var(--spacing-xl)',
                marginBottom: 'var(--spacing-2xl)'
            }}>
                <div className="card-glass" style={{ padding: 'var(--spacing-xl)' }}>
                    <div className="flex-between mb-md">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FontAwesomeIcon icon={faMicrochip} style={{ color: 'var(--color-primary)' }} />
                            <span style={{ fontWeight: 'bold' }}>CPU Usage</span>
                        </div>
                        <span style={{ fontWeight: 'bold' }}>{system.cpu?.usage}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${system.cpu?.usage}%`, height: '100%', background: 'var(--gradient-primary)', borderRadius: '4px' }}></div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                        {system.cpu?.cores} Cores | Load: {system.cpu?.load}
                    </div>
                </div>

                <div className="card-glass" style={{ padding: 'var(--spacing-xl)' }}>
                    <div className="flex-between mb-md">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FontAwesomeIcon icon={faMemory} style={{ color: 'var(--color-secondary)' }} />
                            <span style={{ fontWeight: 'bold' }}>RAM Usage</span>
                        </div>
                        <span style={{ fontWeight: 'bold' }}>{system.ram?.percent}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${system.ram?.percent}%`, height: '100%', background: 'linear-gradient(90deg, #ec4899, #8b5cf6)', borderRadius: '4px' }}></div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                        {system.ram?.used} / {system.ram?.total}
                    </div>
                </div>

                <div className="card-glass" style={{ padding: 'var(--spacing-xl)' }}>
                    <div className="flex-between mb-md">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FontAwesomeIcon icon={faHdd} style={{ color: 'var(--color-success)' }} />
                            <span style={{ fontWeight: 'bold' }}>Disk Space</span>
                        </div>
                        <span style={{ fontWeight: 'bold' }}>{system.disk?.percent}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${system.disk?.percent}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #3b82f6)', borderRadius: '4px' }}></div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                        {system.disk?.used} used of {system.disk?.total}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--spacing-xl)', marginBottom: 'var(--spacing-2xl)' }}>
                {/* Growth Chart */}
                <div className="card">
                    <h3 className="mb-lg"><FontAwesomeIcon icon={faChartLine} /> User Growth (Last 7 Days)</h3>
                    <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: 'var(--spacing-md)', padding: 'var(--spacing-xl) 0' }}>
                        {stats?.growth?.map((day, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '100%',
                                    background: 'var(--gradient-primary)',
                                    height: `${(day.count / Math.max(...stats.growth.map(d => d.count), 1)) * 100}%`,
                                    borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                                    minHeight: '4px'
                                }}></div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Plan Distribution */}
                <div className="card">
                    <h3 className="mb-lg"><FontAwesomeIcon icon={faGem} /> Subscription Plans</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', padding: 'var(--spacing-lg) 0' }}>
                        {stats?.plans?.map((p, i) => (
                            <div key={i}>
                                <div className="flex-between mb-xs">
                                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{p.plan}</span>
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{p.count} users</span>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '8px',
                                    background: 'var(--color-bg)',
                                    borderRadius: 'var(--radius-full)',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${(p.count / (stats.summary.totalUsers || 1)) * 100}%`,
                                        height: '100%',
                                        background: p.plan === 'Enterprise' ? 'var(--color-success)' : p.plan === 'Pro' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                        borderRadius: 'var(--radius-full)'
                                    }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Agent Resource Usage Table */}
            <div className="card">
                <h3 className="mb-lg"><FontAwesomeIcon icon={faRobot} /> Agent Resource Usage</h3>
                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                                <th style={{ padding: 'var(--spacing-md)' }}>Agent / Subdomain</th>
                                <th style={{ padding: 'var(--spacing-md)' }}>Status</th>
                                <th style={{ padding: 'var(--spacing-md)' }}>CPU Usage</th>
                                <th style={{ padding: 'var(--spacing-md)' }}>Memory Usage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.agentUsage?.map((agent) => (
                                <tr key={agent.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: 'var(--spacing-md)' }}>
                                        <div style={{ fontWeight: 'bold' }}>{agent.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{agent.subdomain}</div>
                                    </td>
                                    <td style={{ padding: 'var(--spacing-md)' }}>
                                        <span className={`status-badge ${agent.status === 'running' ? 'status-active' : 'status-inactive'}`} style={{ fontSize: '0.7rem' }}>
                                            {agent.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: 'var(--spacing-md)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                                                <div style={{ width: `${Math.min(agent.cpu * 2, 100)}%`, height: '100%', background: 'var(--color-primary)', borderRadius: '2px' }}></div>
                                            </div>
                                            <span>{agent.cpu}%</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: 'var(--spacing-md)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                                                <div style={{ width: `${agent.memory.percent}%`, height: '100%', background: 'var(--color-secondary)', borderRadius: '2px' }}></div>
                                            </div>
                                            <span>{agent.memory.usage}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!stats?.agentUsage || stats?.agentUsage.length === 0) && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-muted)' }}>
                                        No active agents monitored
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
