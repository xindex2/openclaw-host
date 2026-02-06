import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGem, faCheckCircle, faUsers, faSave, faTrash, faPlus, faKey } from '@fortawesome/free-solid-svg-icons';

export default function PlanManagement() {
    const [stats, setStats] = useState(null);
    const [whopPlans, setWhopPlans] = useState([]);
    const [whopSettings, setWhopSettings] = useState({ WHOP_API_KEY: '', WHOP_WEBHOOK_SECRET: '' });
    const [loading, setLoading] = useState(true);
    const [newWhopPlan, setNewWhopPlan] = useState({ whop_plan_id: '', plan_name: '', max_instances: 1 });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsRes, plansRes, settingsRes] = await Promise.all([
                adminAPI.getStats(),
                adminAPI.getWhopPlans(),
                adminAPI.getWhopSettings()
            ]);
            setStats(statsRes.data);
            setWhopPlans(plansRes.data.plans || []);
            setWhopSettings(settingsRes.data.settings || { WHOP_API_KEY: '', WHOP_WEBHOOK_SECRET: '' });
        } catch (error) {
            console.error('Failed to load plan data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddWhopPlan = async () => {
        if (!newWhopPlan.whop_plan_id || !newWhopPlan.plan_name) return;
        try {
            await adminAPI.updateWhopPlan(newWhopPlan);
            setNewWhopPlan({ whop_plan_id: '', plan_name: '', max_instances: 1 });
            await loadData();
        } catch (error) {
            alert('Failed to add Whop plan');
        }
    };

    const handleDeleteWhopPlan = async (id) => {
        try {
            await adminAPI.deleteWhopPlan(id);
            await loadData();
        } catch (error) {
            alert('Failed to delete Whop plan');
        }
    };

    const handleUpdateSettings = async () => {
        try {
            await adminAPI.updateWhopSettings(whopSettings);
            alert('Settings updated successfully');
        } catch (error) {
            alert('Failed to update settings');
        }
    };

    if (loading) return <div className="flex-center" style={{ minHeight: '400px' }}><LoadingSpinner /></div>;

    const plans = [
        { name: "One Agent", price: "$19", limit: 1, color: 'var(--color-text-muted)' },
        { name: "5 Agents", price: "$69", limit: 5, color: 'var(--color-secondary)' },
        { name: "10 Agents", price: "$99", limit: 10, color: 'var(--color-primary)' },
        { name: "Enterprise", price: "Custom", limit: 100, color: 'var(--color-success)' }
    ];

    return (
        <div className="animate-fade-in pb-2xl">
            <h1 className="mb-xl">Plan & Billing Management</h1>

            <div className="flex-between mb-lg">
                <h2 style={{ fontSize: '1.25rem' }}>Whop API Settings</h2>
            </div>

            <div className="card-glass mb-2xl" style={{ padding: 'var(--spacing-xl)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-xl)' }}>
                    <div className="input-group">
                        <label className="input-label"><FontAwesomeIcon icon={faKey} style={{ marginRight: '8px' }} /> Whop API Key</label>
                        <input
                            type="password"
                            value={whopSettings.WHOP_API_KEY}
                            onChange={(e) => setWhopSettings({ ...whopSettings, WHOP_API_KEY: e.target.value })}
                            placeholder="sk_..."
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label"><FontAwesomeIcon icon={faKey} style={{ marginRight: '8px' }} /> Webhook Secret</label>
                        <input
                            type="password"
                            value={whopSettings.WHOP_WEBHOOK_SECRET}
                            onChange={(e) => setWhopSettings({ ...whopSettings, WHOP_WEBHOOK_SECRET: e.target.value })}
                            placeholder="whsec_..."
                        />
                    </div>
                </div>
                <div className="mt-md">
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        Webhook URL: <code>{window.location.origin}/api/webhooks/whop</code>
                    </p>
                </div>
                <button onClick={handleUpdateSettings} className="btn btn-primary mt-lg">
                    <FontAwesomeIcon icon={faSave} style={{ marginRight: '8px' }} /> Save Whop Settings
                </button>
            </div>

            <div className="flex-between mb-lg">
                <h2 style={{ fontSize: '1.25rem' }}>Whop Plan Identifiers</h2>
            </div>

            <div className="card-glass mb-2xl" style={{ padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--color-bg-elevated)', borderBottom: '1px solid var(--color-border)' }}>
                        <tr>
                            <th style={{ padding: 'var(--spacing-md)', textAlign: 'left' }}>Whop Plan ID</th>
                            <th style={{ padding: 'var(--spacing-md)', textAlign: 'left' }}>Internal Name</th>
                            <th style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>Agent Limit</th>
                            <th style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {whopPlans.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: 'var(--spacing-md)' }}><code>{p.whop_plan_id}</code></td>
                                <td style={{ padding: 'var(--spacing-md)' }}>{p.plan_name}</td>
                                <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>{p.max_instances}</td>
                                <td style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>
                                    <button onClick={() => handleDeleteWhopPlan(p.id)} className="btn btn-ghost" style={{ color: 'var(--color-error)' }}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td style={{ padding: 'var(--spacing-md)' }}>
                                <input
                                    className="input-sm"
                                    style={{ width: '100%' }}
                                    placeholder="plan_..."
                                    value={newWhopPlan.whop_plan_id}
                                    onChange={(e) => setNewWhopPlan({ ...newWhopPlan, whop_plan_id: e.target.value })}
                                />
                            </td>
                            <td style={{ padding: 'var(--spacing-md)' }}>
                                <input
                                    className="input-sm"
                                    style={{ width: '100%' }}
                                    placeholder="Pro Plan"
                                    value={newWhopPlan.plan_name}
                                    onChange={(e) => setNewWhopPlan({ ...newWhopPlan, plan_name: e.target.value })}
                                />
                            </td>
                            <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                                <input
                                    type="number"
                                    className="input-sm"
                                    style={{ width: '60px' }}
                                    value={newWhopPlan.max_instances}
                                    onChange={(e) => setNewWhopPlan({ ...newWhopPlan, max_instances: parseInt(e.target.value) })}
                                />
                            </td>
                            <td style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>
                                <button onClick={handleAddWhopPlan} className="btn btn-primary btn-sm">
                                    <FontAwesomeIcon icon={faPlus} />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-lg)' }}>Usage Statistics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-xl)' }}>
                {plans.map((plan) => {
                    const planStats = stats?.plans?.find(p => p.plan === plan.name) || { count: 0 };
                    return (
                        <div key={plan.name} className="card-glass" style={{ padding: 'var(--spacing-xl)', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: 'var(--spacing-md)', right: 'var(--spacing-md)', color: plan.color }}>
                                <FontAwesomeIcon icon={faGem} size="lg" />
                            </div>
                            <h3 style={{ margin: '0 0 var(--spacing-xs) 0' }}>{plan.name}</h3>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: 'var(--spacing-md)' }}>
                                {plan.price} <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>/mo</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xl)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                    <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'var(--color-success)' }} />
                                    <span>{plan.limit} Agent Limit</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                    <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'var(--color-success)' }} />
                                    <span>Syncs with Whop</span>
                                </div>
                            </div>

                            <div style={{
                                background: 'rgba(255,255,255,0.03)',
                                padding: 'var(--spacing-md)',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                justifyConnection: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Active Subscribers</span>
                                <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FontAwesomeIcon icon={faUsers} style={{ fontSize: '0.8rem', color: 'var(--color-secondary)' }} />
                                    {planStats.count}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

