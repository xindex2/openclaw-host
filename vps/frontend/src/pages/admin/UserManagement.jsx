import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faCheckCircle, faTimesCircle, faShieldAlt, faGem } from '@fortawesome/free-solid-svg-icons';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    useEffect(() => {
        loadUsers();
    }, [page, search]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getUsers({ search, page, limit: 10 });
            setUsers(response.data.users);
            setTotalPages(response.data.pagination.totalPages);
            setTotalUsers(response.data.pagination.total);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            await adminAPI.updateUser(userId, { is_active: !currentStatus });
            await loadUsers();
        } catch (error) {
            alert('Failed to update user status');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user? This will also delete all their agents.')) return;
        try {
            await adminAPI.deleteUser(userId);
            await loadUsers();
        } catch (error) {
            alert('Failed to delete user');
        }
    };

    const handleChangeRole = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            await adminAPI.updateUser(userId, { role: newRole });
            await loadUsers();
        } catch (error) {
            alert('Failed to change user role');
        }
    };

    const handleChangePlan = async (userId) => {
        const plans = ['One Agent', '5 Agents', '10 Agents', 'Enterprise'];
        const currentPlan = users.find(u => u.id === userId)?.plan || 'One Agent';
        const currentIndex = plans.indexOf(currentPlan);
        const nextPlan = plans[(currentIndex + 1) % plans.length];

        try {
            await adminAPI.updateUser(userId, { plan: nextPlan });
            await loadUsers();
        } catch (error) {
            alert('Failed to update plan');
        }
    };

    if (loading) return <div className="flex-center" style={{ minHeight: '400px' }}><LoadingSpinner /></div>;

    return (
        <div className="animate-fade-in">
            <div className="flex-between mb-xl">
                <h1 style={{ margin: 0 }}>User Management</h1>
                <div style={{ position: 'relative', width: '300px' }}>
                    <input
                        type="text"
                        placeholder="Search users..."
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

            <div className="card table-responsive" style={{ padding: 0, overflowX: 'auto', marginBottom: 'var(--spacing-lg)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--color-bg-elevated)', borderBottom: '1px solid var(--color-border)' }}>
                        <tr>
                            <th style={{ padding: 'var(--spacing-md)', textAlign: 'left' }}>User</th>
                            <th style={{ padding: 'var(--spacing-md)', textAlign: 'left' }}>Email</th>
                            <th style={{ padding: 'var(--spacing-md)', textAlign: 'left' }}>Role</th>
                            <th style={{ padding: 'var(--spacing-md)', textAlign: 'left' }}>Plan</th>
                            <th style={{ padding: 'var(--spacing-md)', textAlign: 'left' }}>Source</th>
                            <th style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>Agents</th>
                            <th style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>Status</th>
                            <th style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan="8" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                                    <LoadingSpinner />
                                </td>
                            </tr>
                        )}
                        {!loading && users.length === 0 && (
                            <tr>
                                <td colSpan="8" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    No users found matching your search.
                                </td>
                            </tr>
                        )}
                        {!loading && users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: 'var(--spacing-md)' }}>
                                    <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                                        {u.avatar_url ? (
                                            <img src={u.avatar_url} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                                        ) : (
                                            <div className="flex-center" style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-bg-border)', fontSize: '0.7rem' }}>
                                                {u.full_name?.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>{u.full_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>ID: {u.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: 'var(--spacing-md)' }}>{u.email}</td>
                                <td style={{ padding: 'var(--spacing-md)' }}>
                                    <span
                                        onClick={() => handleChangeRole(u.id, u.role)}
                                        className={`badge ${u.role === 'admin' ? 'badge-primary' : ''}`}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {u.role}
                                    </span>
                                </td>
                                <td style={{ padding: 'var(--spacing-md)' }}>
                                    <span
                                        onClick={() => handleChangePlan(u.id)}
                                        className={`badge ${u.plan === 'Enterprise' ? 'badge-success' : u.plan === '10 Agents' ? 'badge-primary' : u.plan === '5 Agents' ? 'badge-secondary' : 'badge-ghost'}`}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <FontAwesomeIcon icon={faGem} style={{ marginRight: '4px', fontSize: '0.7rem' }} />
                                        {u.plan || 'Free'}
                                    </span>
                                </td>
                                <td style={{ padding: 'var(--spacing-md)' }}>
                                    <span style={{
                                        fontSize: '0.85rem',
                                        color: u.acquisition_source === 'Direct' ? 'var(--color-text-dim)' : 'var(--color-primary)',
                                        background: 'rgba(255,255,255,0.05)',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        {u.acquisition_source || 'Unknown'}
                                    </span>
                                </td>
                                <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>{u.agent_count}</td>
                                <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                                    <button
                                        onClick={() => handleToggleStatus(u.id, u.is_active)}
                                        className="btn btn-ghost"
                                        style={{ padding: '4px' }}
                                    >
                                        <FontAwesomeIcon
                                            icon={u.is_active ? faCheckCircle : faTimesCircle}
                                            style={{ color: u.is_active ? 'var(--color-success)' : 'var(--color-error)' }}
                                        />
                                    </button>
                                </td>
                                <td style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>
                                    <div className="flex gap-sm" style={{ justifyContent: 'flex-end' }}>
                                        <button onClick={() => handleDeleteUser(u.id)} className="btn btn-ghost" style={{ color: 'var(--color-error)' }}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex-between" style={{ padding: '0 var(--spacing-md)' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        Showing {users.length} of {totalUsers} users
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
