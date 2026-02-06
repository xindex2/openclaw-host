import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Server, Terminal, Zap, HardDrive, Bot, CheckCircle, ArrowRight } from 'lucide-react';
import StarField from '../components/StarField';
import Logo from '../components/Logo';
import Footer from '../components/Footer';

export default function Landing() {
    useEffect(() => {
        document.title = "OpenClaw Hosting, OpenClaw VPS, Install OpenClaw, Deploy OpenClaw - OpenClaw Host";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", "The professional way to hosting OpenClaw. High-performance OpenClaw VPS, 1-click install, and instant deployment for your AI agents.");
        }
    }, []);

    const features = useMemo(() => [
        { icon: <Server className="text-[#ff6b6b]" />, title: "OpenClaw VPS", text: "Each instance runs in an isolated high-performance Docker container." },
        { icon: <Terminal className="text-[#ff6b6b]" />, title: "Instant Installation", text: "No technical skills needed. Our automated scripts install OpenClaw for you." },
        { icon: <Zap className="text-[#ff6b6b]" />, title: "1-Click Deploy", text: "Launch your dedicated AI environment instantly with our optimized setup." },
        { icon: <HardDrive className="text-[#ff6b6b]" />, title: "Safe Storage", text: "Your data and agent configuration persist securely across container restarts." },
        { icon: <Bot className="text-[#ff6b6b]" />, title: "Unlimited Agents", text: "Run multiple OpenClaw agents tailored for different tasks on one account." },
        { icon: <ShieldCheck className="text-[#ff6b6b]" />, title: "Auto-Scalable", text: "Enterprise-grade infrastructure that grows with your AI agent needs." }
    ], []);

    const plans = useMemo(() => [
        { name: "One Agent", price: "$19", limit: "1 Agent", features: ["Dedicated VPS", "1-Click Installation", "Web Terminal Access", "Persistent Storage"], checkoutUrl: "https://whop.com/checkout/plan_Ke7ZeyJO29DwZ" },
        { name: "5 Agents", price: "$69", limit: "Up to 5 Agents", features: ["Priority Support", "Dedicated Resources", "Multi-Agent Dashboard", "Safe Volume Backups"], popular: true, checkoutUrl: "https://whop.com/checkout/plan_9NRNdPMrVzwi8" },
        { name: "10 Agents", price: "$99", limit: "Up to 10 Agents", features: ["Enterprise Hardware", "Advanced Monitoring", "Custom Subdomains", "Global Edge Network"], checkoutUrl: "https://whop.com/checkout/plan_XXO2Ey0ki51AI" },
    ], []);

    return (
        <div className="bg-[#050505] text-white selection:bg-[#ff6b6b]/30 selection:text-white font-sans overflow-x-hidden">
            <StarField />

            {/* Nav */}
            <nav className="relative z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Logo size={40} />
                        <span className="text-xl font-black italic uppercase tracking-tighter">OpenClaw Host</span>
                    </div>
                    <div className="flex items-center gap-8">
                        <a href="#pricing" className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Pricing</a>
                        <Link to="/login" className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Login</Link>
                        <Link to="/register" className="bg-[#ff6b6b] text-white px-8 py-3 rounded-2xl font-black text-sm tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#ff6b6b]/20">
                            GET STARTED
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative pt-32 pb-48 z-10">
                <div className="max-w-5xl mx-auto px-8 text-center">
                    <div className="inline-block bg-[#ff6b6b]/10 border border-[#ff6b6b]/20 px-6 py-2 rounded-full mb-12">
                        <p className="text-[#ff6b6b] text-xs font-black uppercase tracking-[0.2em]">
                            Standalone Infrastructure Provider
                        </p>
                    </div>

                    <h1 className="text-[clamp(3.5rem,10vw,7rem)] font-black italic uppercase italic leading-[0.9] tracking-tighter mb-8">
                        Deploy <span className="text-[#ff6b6b]">OpenClaw</span> <br />
                        In Seconds.
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-12 font-medium">
                        The professional hosting solution for autonomous AI agents.
                        Dedicated instances, 1-click installation, and instant global delivery.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <Link to="/register" className="bg-white text-black px-12 py-6 rounded-[2rem] font-black text-sm tracking-widest hover:scale-105 active:scale-95 transition-all shadow-3xl flex items-center gap-3">
                            INITIALIZE DEPLOYMENT <ArrowRight size={20} />
                        </Link>
                        <a href="#features" className="px-12 py-6 rounded-[2rem] font-black text-sm tracking-widest text-gray-500 hover:text-white transition-colors">
                            VIEW CAPABILITIES
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="relative pb-48 z-10 px-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <div key={i} className="group p-12 bg-white/2 border border-white/5 rounded-[3.5rem] hover:border-[#ff6b6b]/20 transition-all duration-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-[#ff6b6b]/5 blur-[60px] rounded-full group-hover:bg-[#ff6b6b]/10 transition-all" />
                            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-700">
                                {f.icon}
                            </div>
                            <h3 className="text-2xl font-black italic uppercase mb-4">{f.title}</h3>
                            <p className="text-gray-500 leading-relaxed font-medium">{f.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="relative pb-48 z-10 px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-6">Simple Fleet Pricing</h2>
                        <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
                            Transparent hosting plans with zero overhead. You provide the keys, we provide the ultimate high-performance hosting environment.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((p, i) => (
                            <div key={i} className={cn(
                                "p-12 rounded-[4rem] border transition-all duration-700 relative flex flex-col",
                                p.popular ? "bg-[#ff6b6b]/5 border-[#ff6b6b]/30 shadow-[0_0_80px_rgba(255,107,107,0.05)]" : "bg-white/2 border-white/5"
                            )}>
                                {p.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#ff6b6b] text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        Most Popular
                                    </div>
                                )}
                                <h3 className="text-3xl font-black italic uppercase mb-2">{p.name}</h3>
                                <div className="flex items-baseline gap-2 mb-8">
                                    <span className="text-6xl font-black italic">{p.price}</span>
                                    <span className="text-gray-600 font-bold uppercase tracking-widest text-xs">/month</span>
                                </div>

                                <ul className="space-y-4 mb-12 flex-1">
                                    {p.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-3 text-sm font-medium text-gray-400">
                                            <CheckCircle size={16} className="text-[#ff6b6b]" /> {f}
                                        </li>
                                    ))}
                                </ul>

                                <a href={p.checkoutUrl} className={cn(
                                    "w-full py-6 rounded-[2rem] font-black text-sm tracking-widest transition-all text-center",
                                    p.popular ? "bg-[#ff6b6b] text-white shadow-2xl shadow-[#ff6b6b]/30" : "bg-white/5 text-white hover:bg-white/10"
                                )}>
                                    RECRUIT NOW
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Disclaimer Bar */}
            <div className="relative z-10 border-t border-white/5 py-12 bg-[#ff6b6b]/5 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff6b6b]">
                    Powered by high-performance enterprise clusters
                </p>
            </div>

            <Footer />
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
