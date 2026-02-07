import { CreditCard, Shield, Rocket, CheckCircle2, Bot, Zap, Crown, Building2, ChevronRight, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function Billing() {
    const navigate = useNavigate();

    const plans = [
        {
            name: 'Free',
            price: '$0',
            description: 'Experience the power of autonomous agents.',
            icon: <Rocket size={24} />,
            features: ['1 Active Agent Slot', '1 Message per interaction', 'Standard Compute', 'Community Support'],
            color: 'text-[#667085]',
            bg: 'bg-white',
            btnText: 'Current Plan',
            disabled: true
        },
        {
            name: 'Starter',
            price: '$19',
            description: 'For individuals starting their AI journey.',
            icon: <Zap size={24} />,
            features: ['3 Active Agent Slots', 'Unlimited Messages', 'Priority Compute', 'Email Support'],
            color: 'text-[#101828]',
            bg: 'bg-white',
            btnText: 'Initialize Starter'
        },
        {
            name: 'Pro',
            price: '$69',
            description: 'Our most popular plan for power users.',
            icon: <Bot size={24} />,
            popular: true,
            features: ['10 Active Agent Slots', 'Unlimited Messages', 'High Priority Compute', '24/7 Priority Support', 'Advanced Skills Pack'],
            color: 'text-[#101828]',
            bg: 'bg-[#f9fafb]',
            border: 'border-[#101828]',
            btnText: 'Go Pro'
        },
        {
            name: 'Elite',
            price: '$99',
            description: 'Maximum scale for AI-driven workflows.',
            icon: <Crown size={24} />,
            features: ['25 Active Agent Slots', 'Unlimited Messages', 'Bespoke Private Nodes', 'Dedicated Account Manager'],
            color: 'text-[#101828]',
            bg: 'bg-white',
            btnText: 'Initialize Elite'
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            description: 'Tailored solutions for large-scale operations.',
            icon: <Building2 size={24} />,
            features: ['Unlimited Agents', 'Flexible Message Limits', 'On-Premise Deployment', 'Custom LLM Training'],
            color: 'text-[#101828]',
            bg: 'bg-white',
            btnText: 'Talk to Sales'
        },
    ];

    const checkoutLinks = {
        'Free': '#',
        'Starter': 'https://whop.com/checkout/plan_Ke7ZeyJO29DwZ',
        'Pro': 'https://whop.com/checkout/plan_9NRNdPMrVzwi8',
        'Elite': 'https://whop.com/checkout/plan_XXO2Ey0ki51AI',
        'Enterprise': 'mailto:support@openclaw.ai'
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] py-20 px-8">
            <div className="max-w-7xl mx-auto space-y-16">
                <header className="text-center space-y-4 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f2f4f7] border border-[#eaecf0] text-[11px] font-bold text-[#475467] uppercase tracking-wider">
                        <Lock size={12} className="text-[#101828]" /> Subscription Protocol
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#101828] tracking-tight">Upgrade your capacity</h1>
                    <p className="text-[#475467] text-lg">Select the plan that fits your operational needs. Scale your agents and expand your capabilities instantly.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={cn(
                                "flex flex-col bg-white border rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-md",
                                plan.border || "border-[#eaecf0]",
                                plan.popular && "ring-1 ring-[#101828]/10"
                            )}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-[#101828] text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg rounded-tr-2xl">
                                    Popular
                                </div>
                            )}

                            <div className={cn("mb-6 w-10 h-10 rounded-lg bg-[#f2f4f7] flex items-center justify-center", plan.color)}>
                                {plan.icon}
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-[#101828] mb-1">{plan.name}</h3>
                                <p className="text-xs text-[#475467] leading-relaxed">{plan.description}</p>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-[#101828]">{plan.price}</span>
                                    {plan.price !== 'Custom' && plan.price !== '$0' && (
                                        <span className="text-sm font-medium text-[#667085]">/mo</span>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature, j) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm">
                                        <CheckCircle2 size={16} className="text-[#101828] shrink-0 mt-0.5" />
                                        <span className="text-[#475467] text-xs leading-tight">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <a
                                href={checkoutLinks[plan.name as keyof typeof checkoutLinks]}
                                target={plan.name === 'Enterprise' ? '_self' : '_blank'}
                                rel="noopener noreferrer"
                                className={cn(
                                    "w-full py-3 rounded-xl font-bold text-xs text-center transition-all flex items-center justify-center gap-2",
                                    plan.name === 'Pro'
                                        ? "bg-[#101828] text-white hover:bg-[#1d2939]"
                                        : plan.disabled
                                            ? "bg-[#f2f4f7] text-[#98a2b3] cursor-default"
                                            : "bg-white border border-[#d0d5dd] text-[#344054] hover:bg-[#f9fafb]"
                                )}
                                onClick={(e) => plan.disabled && e.preventDefault()}
                            >
                                {plan.btnText}
                                {!plan.disabled && plan.name !== 'Enterprise' && <ChevronRight size={14} />}
                            </a>
                        </motion.div>
                    ))}
                </div>

                <div className="bg-white border border-[#eaecf0] p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#f2f4f7] rounded-xl flex items-center justify-center text-[#101828]">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-[#101828]">Secure Infrastructure</h4>
                            <p className="text-xs text-[#667085]">Payments managed securely via Whop Protocol.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-8 opacity-40 grayscale flex-wrap justify-center">
                        <CreditCard size={28} />
                        <span className="font-bold text-lg">VISA</span>
                        <span className="font-bold text-lg">MASTERCARD</span>
                        <span className="font-bold text-lg">APPLE PAY</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
