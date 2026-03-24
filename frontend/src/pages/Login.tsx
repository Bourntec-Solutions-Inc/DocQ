import { useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("auth/login/", { email, password });
            login(res.data.access);
            window.location.href = "/dashboard";
        } catch (err) {
            toast.error("Invalid credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f111a] text-white flex flex-col font-sans select-none relative overflow-hidden">
            {/* GLOW BACKGROUND OVERLAY */}
            <div className="absolute top-0 left-[10%] w-[600px] h-[600px] radial-glow pointer-events-none -translate-y-1/2 -translate-x-1/4"></div>

            {/* HEADER */}
            <div className="flex justify-between items-center px-10 py-6 z-10 font-bold uppercase tracking-widest text-[11px] text-gray-400">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primaryBlue flex items-center justify-center shadow-[0_0_15px_rgba(55,125,255,0.4)]">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                            <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fillOpacity="0.8" />
                            <path d="M12 2V12L22 7M12 12V22L2 17M12 12L2 7M12 12L22 17" stroke="white" strokeWidth="1" />
                        </svg>
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-white">DocQ</span>
                </div>

                <div className="flex items-center gap-8 invisible">
                    {/* Public Nav Disabled */}
                </div>
            </div>

            {/* TWO COLUMNS WRAPPER */}
            <div className="flex flex-1 z-10 w-full max-w-7xl mx-auto px-10 py-10 pb-24 items-center gap-20">

                {/* LEFT COMPONENT */}
                <div className="w-1/2 flex flex-col justify-center">
                    <h1 className="text-[3.5rem] font-black leading-[1.05] tracking-tight mb-5 drop-shadow-md uppercase">
                        Automate <br />
                        Intelligence. <br />
                        <span className="text-primaryBlue">Every Day.</span>
                    </h1>

                    <p className="text-gray-400 text-[1.05rem] leading-relaxed max-w-[420px] mb-12 font-medium">
                        Schedule, execute, and interact with AI-driven workflows using your own prompt systems. The platform built for high-performance automation.
                    </p>

                    <div className="flex flex-col gap-8">
                        <div className="flex items-start gap-4 group">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-shrink-0 items-center justify-center text-primaryBlue mt-1 group-hover:border-primaryBlue transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-xs font-black mb-1 text-gray-200 tracking-[0.15em] uppercase">Scheduled AI Execution</h3>
                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Run complex workflows on your own automated schedule.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 group">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-shrink-0 items-center justify-center text-primaryBlue mt-1 group-hover:border-primaryBlue transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-xs font-black mb-1 text-gray-200 tracking-[0.15em] uppercase">Enterprise Synthesis</h3>
                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">High-fidelity intelligence generation for commercial operations.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COMPONENT - FORM */}
                <div className="w-1/2 flex items-center justify-center border-l border-gray-800/60 pb-8 pl-10">
                    <div className="w-full max-w-[420px] mx-auto text-center flex flex-col items-center">
                        <h2 className="text-sm font-black mb-3 uppercase tracking-[0.3em] text-white">Welcome back</h2>
                        <p className="text-gray-500 text-[10px] font-black mb-10 w-full text-center uppercase tracking-widest">Enter credentials to initialize system link</p>

                        <form onSubmit={handleLogin} className="w-full bg-[#191c24]/60 border border-gray-800 backdrop-blur-sm rounded-2xl p-8 mb-6 shadow-2xl text-left transition-all hover:border-gray-700">
                            <div className="mb-5">
                                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    required
                                    className="w-full bg-[#0f111a] border border-gray-700/80 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-primaryBlue/70 focus:ring-1 focus:ring-primaryBlue/70 transition-colors"
                                />
                            </div>

                            <div className="mb-8 relative">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Password</label>
                                    <a href="#" className="text-[10px] text-gray-800 pointer-events-none font-black uppercase tracking-widest opacity-0">...</a>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-[#0f111a] border border-gray-700/80 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primaryBlue/70 focus:ring-1 focus:ring-primaryBlue/70 transition-colors tracking-widest"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primaryBlue hover:bg-blue-600 text-white font-black py-4 flex items-center justify-center rounded-xl shadow-lg shadow-blue-500/20 transition-all uppercase tracking-widest text-xs"
                            >
                                {loading ? "Authorizing..." : "Initialize Session"}
                            </button>
                        </form>

                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-6">
                            New operator? <span onClick={() => navigate("/signup")} className="text-primaryBlue hover:text-blue-400 cursor-pointer">Register identity</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-800/60 mt-auto py-6 text-center z-10">
                <p className="text-[9px] font-black text-gray-600 tracking-[0.2em] uppercase">© 2026 DocQ Automation Platform. Hardened for Enterprise Use.</p>
            </div>
        </div>
    );
}
