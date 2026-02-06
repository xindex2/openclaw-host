import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faUser, faExternalLinkAlt, faStopCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { instanceAPI } from '../../services/api';

export default function AgentManagement() {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalAgents, setTotalAgents] = useState(0);

    useEffect(() => {
        loadAgents();
    }, [page, search]);

    const loadAgents = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAgents({ search, page, limit: 10 });
            setAgents(response.data.agents);
            setTotalPages(response.data.pagination.totalPages);
            setTotalAgents(response.data.pagination.total);
        } catch (error) {
            console.error('Failed to load agents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStopAgent = async (agentId) => {
        if (!confirm('Are you sure you want to stop this agent?')) return;
        try {
            await instanceAPI.stop(agentId);
            await loadAgents();
        } catch (error) {
            alert('Failed to stop agent');
        }
    };

    const handleDeleteAgent = async (agentId) => {
        if (!confirm('Are you sure you want to delete this agent? This action is irreversible.')) return;
        try {
            await instanceAPI.delete(agentId);
            await loadAgents();
        } catch (error) {
            alert('Failed to delete agent');
        }
    };

    if (loading) return <div className="flex-center" style={{ minHeight: '400px' }}><LoadingSpinner /></div>;

    return (
        <div className="animate-fade-in">
            <div className="flex-between mb-xl">
                <h1 style={{ margin: 0 }}>Agent Management</h1>
                <div style={{ position: 'relative', width: '300px' }}>
                    <input
                        type="text"
                        placeholder="Search subdomains or owners..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1); // Reset to first page on search
                        }}
                        style={{ paddingRight: '40px' }}
                    />
                    <FontAwesomeIcon
                        icon={faTrash}
                        style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, cursor: 'pointer' }}
                        onClick={() => setSearch('')}
                    />
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto', marginBottom: 'var(--spacing-lg)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--color-bg-elevated)', borderBottom: '1px solid var(--color-border)' }}>
                        <tr>
                            <th style={{ padding: 'var(--spacing-md)', textAlign: 'left' }}>Agent Name</th>
                            <th style={{ padding: 'var(--spacing-md)', textAlign: 'left' }}>Owner</th>
                            <th style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>Container ID</th>
                            <th style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>Status</th>
                            <th style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>Created</th>
                            <th style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan="6" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                                    <LoadingSpinner />
                                </td>
                            </tr>
                        )}
                        {!loading && agents.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    No agents found matching your search.
                                </td>
                            </tr>
                        )}
                        {!loading && agents.map(a => (
                            <tr key={a.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: 'var(--spacing-md)' }}>
                                    <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>{a.subdomain}</div>
                                </td>
                                <td style={{ padding: 'var(--spacing-md)' }}>
                                    <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                                        <FontAwesomeIcon icon={faUser} size="xs" style={{ color: 'var(--color-text-muted)' }} />
                                        <span>{a.owner_name}</span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{a.owner_email}</div>
                                </td>
                                <td style={{ padding: 'var(--spacing-md)', textAlign: 'center', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                    {a.container_id ? a.container_id.substring(0, 12) : 'N/A'}
                                </td>
                                <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                                    <span className={`badge ${a.status === 'running' ? 'badge-success' : 'badge-warning'}`}>
                                        {a.status}
                                    </span>
                                </td>
                                <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                                    {new Date(a.created_at).toLocaleDateString()}
                                </td>
                                <td style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>
                                    <div className="flex gap-sm" style={{ justifyContent: 'flex-end' }}>
                                        {a.status === 'running' && (
                                            <button
                                                onClick={() => handleStopAgent(a.id)}
                                                className="btn btn-ghost btn-sm"
                                                title="Stop Agent"
                                                style={{ color: 'var(--color-warning)' }}
                                            >
                                                <FontAwesomeIcon icon={faStopCircle} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteAgent(a.id)}
                                            className="btn btn-ghost btn-sm"
                                            title="Delete Agent"
                                            style={{ color: 'var(--color-error)' }}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div className="flex-between" style={{ padding: '0 var(--spacing-md)' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        Showing {agents.length} of {totalAgents} agents
                    </div>
                    <div className="flex gap-md">
                        <button
                            className="btn btn-ghost btn-sm"
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                        >
                            Previous
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setPage(i + 1)}
                                style={{ minWidth: '32px' }}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            className="btn btn-ghost btn-sm"
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
