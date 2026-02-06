import { CreditCard, Check, Zap, Rocket, Star, Building2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const PLANS = [
    {
        name: 'Starter',
        price: '$19',
        icon: <Zap size={20} className="text-blue-500" />,
        agents: 1,
        link: 'https://whop.com/checkout/plan_Ke7ZeyJO29DwZ',
        features: ['1 Autonomous Agent', 'Standard Web Search', 'Community Support', 'Basic Logic Engine']
    },
    {
        name: 'Pro',
        price: '$69',
        popular: true,
        icon: <Rocket size={20} className="text-indigo-600" />,
        agents: 5,
        link: 'https://whop.com/checkout/plan_9NRNdPMrVzwi8',
        features: ['5 Autonomous Agents', 'Advanced Browser Tools', 'Priority Execution', 'Discord & Telegram Integration']
    },
    {
        name: 'Elite',
        price: '$99',
        icon: <Star size={20} className="text-amber-500" />,
        agents: 10,
        link: 'https://whop.com/checkout/plan_XXO2Ey0ki51AI',
        features: ['10 Autonomous Agents', 'All Skill Plugins', 'Dedicated Gateway', 'Unlimited Tool Iterations']
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        icon: <Building2 size={20} className="text-slate-600" />,
        agents: 'Unlimited',
        link: 'mailto:enterprise@simpleclaw.com',
        features: ['Unlimited Agents', 'Custom Skill Development', 'On-Premise Deployment', '24/7 Dedicated Support']
    }
];

export default function Billing() {
    return (
        <div className="space-y-12 max-w-6xl">
            <header>
                <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" /> Subscription Models
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Fleet Quota Management</h1>
                <p className="text-slate-500 text-sm font-medium mt-2">Scale your operational capacity with premium agent slots.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {PLANS.map((plan) => (
                    <div
                        key={plan.name}
                        className={cn(
                            "relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-300",
                            plan.popular
                                ? "bg-white border-indigo-600 shadow-2xl shadow-indigo-600/10 z-10 scale-105"
                                : "bg-white border-gray-100 hover:border-gray-300 shadow-sm"
                        )}
                    >
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                Most Popular
                            </div>
                        )}

                        <div className="flex items-center gap-4 mb-8">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border",
                                plan.popular ? "bg-indigo-50 border-indigo-100" : "bg-slate-50 border-gray-50"
                            )}>
                                {plan.icon}
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{plan.name}</h3>
                                <p className="text-2xl font-bold text-slate-900">{plan.price}</p>
                            </div>
                        </div>

                        <div className="space-y-4 flex-1">
                            <div className="pb-4 border-b border-gray-50">
                                <p className="text-[11px] font-bold text-slate-900">{plan.agents} Operational Slot{plan.agents !== 1 ? 's' : ''}</p>
                            </div>
                            <ul className="space-y-3">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <div className="mt-1 w-3.5 h-3.5 rounded-full bg-green-50 flex items-center justify-center">
                                            <Check size={10} className="text-green-600" />
                                        </div>
                                        <span className="text-[11px] text-slate-500 font-medium leading-tight">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <a
                            href={plan.link}
                            target={plan.name === 'Enterprise' ? '_self' : '_blank'}
                            rel="noreferrer"
                            className={cn(
                                "mt-10 w-full py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-center transition-all",
                                plan.popular
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:scale-[1.02]"
                                    : "bg-slate-50 text-slate-900 hover:bg-slate-100 border border-gray-100"
                            )}
                        >
                            {plan.name === 'Enterprise' ? 'Contact Solutions' : 'Select Plan'}
                        </a>
                    </div>
                ))}
            </div>

            <section className="mt-20 p-12 bg-zinc-950 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="max-w-lg">
                    <h2 className="text-2xl font-bold tracking-tight mb-2">Need a custom environment?</h2>
                    <p className="text-zinc-400 text-sm font-medium">We offer dedicated clusters and custom-built skills for large-scale enterprise deployments.</p>
                </div>
                <a
                    href="mailto:support@simpleclaw.com"
                    className="bg-white text-zinc-950 px-10 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-100 transition-all shrink-0"
                >
                    Speak with our Team
                </a>
            </section>
        </div>
    );
}
