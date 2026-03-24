import { useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("auth/register/", { name, email, password });
            toast.success("Account created successfully!");
            login(res.data.access);
            navigate("/dashboard");
        } catch (err) {
            toast.error("Error creating account.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f111a] text-white flex flex-col font-sans select-none relative overflow-hidden">
            <div className="absolute top-0 left-[10%] w-[600px] h-[600px] radial-glow pointer-events-none -translate-y-1/2 -translate-x-1/4"></div>

            <div className="flex justify-between items-center px-10 py-6 z-10 w-full text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primaryBlue flex items-center justify-center shadow-[0_0_15px_rgba(55,125,255,0.4)]">
                        <span className="text-white font-bold leading-none select-none">❖</span>
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-white uppercase italic">DocQ</span>
                </div>

                <div className="flex items-center gap-8">
                    <a href="#" className="hover:text-white transition-colors cursor-pointer tracking-widest">ABOUT</a>
                    <button onClick={() => navigate("/")} className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2 rounded-md transition-colors border border-gray-700 font-black tracking-widest shadow-sm">
                        LOG IN
                    </button>
                </div>
            </div>

            <div className="flex flex-1 z-10 w-full max-w-7xl mx-auto px-10 py-10 pb-24 items-center gap-20 text-left">
                <div className="w-1/2 flex flex-col justify-center">
                    <h1 className="text-[3.5rem] font-black leading-[1.05] tracking-tight mb-5 drop-shadow-md text-white uppercase">
                        Automate <br />
                        Everything. <br />
                        <span className="text-primaryBlue">Every Day.</span>
                    </h1>
                    <p className="text-gray-400 text-[1.05rem] leading-relaxed max-w-[420px] mb-12 font-medium">
                        Initialize your account to start generating intelligent agentic workflows across your enterprise infrastructure.
                    </p>
                </div>

                <div className="w-1/2 flex items-center justify-center border-gray-800/60 pb-8 pl-10 border-l text-left">
                    <div className="w-full max-w-[420px] mx-auto text-center flex flex-col items-center">
                        <h2 className="text-sm font-black mb-3 uppercase tracking-[0.3em] text-white">Identity Registration</h2>
                        <p className="text-gray-500 text-[10px] font-black mb-10 w-full text-center uppercase tracking-widest">Registering new operator into system network</p>

                        <form onSubmit={handleSignUp} className="w-full bg-[#191c24]/60 border border-gray-800 backdrop-blur-sm rounded-2xl p-8 mb-6 shadow-2xl text-left hover:border-gray-700 transition-colors">
                            <div className="mb-5">
                                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                    className="w-full bg-[#0f111a] border border-gray-700/80 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-primaryBlue/70 focus:ring-1 focus:ring-primaryBlue/70 transition-all font-medium"
                                />
                            </div>

                            <div className="mb-5">
                                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    required
                                    className="w-full bg-[#0f111a] border border-gray-700/80 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-primaryBlue/70 focus:ring-1 focus:ring-primaryBlue/70 transition-all font-medium"
                                />
                            </div>

                            <div className="mb-8 relative">
                                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-[#0f111a] border border-gray-700/80 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primaryBlue/70 focus:ring-1 focus:ring-primaryBlue/70 transition-all tracking-widest"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primaryBlue hover:bg-blue-600 text-white font-black py-4 flex items-center justify-center rounded-xl shadow-lg shadow-blue-500/20 transition-all uppercase tracking-widest text-xs"
                            >
                                {loading ? "Registering..." : "Provision Access"}
                            </button>
                        </form>

                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            Existing operator? <span onClick={() => navigate("/")} className="text-primaryBlue hover:text-blue-400 cursor-pointer">Return to bridge</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-800/60 mt-auto py-6 text-center z-10 w-full">
                <p className="text-[9px] font-black text-gray-600 tracking-[0.2em] uppercase">© 2026 DocQ Automation Platform. Privacy & Security Encrypted.</p>
            </div>
        </div>
    );
}
