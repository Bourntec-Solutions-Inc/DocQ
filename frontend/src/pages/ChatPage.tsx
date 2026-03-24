import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import { toast } from "sonner";
import { ProfileMenu } from "../components/ProfileMenu";

export default function ChatPage() {
    const { jobId } = useParams();
    const navigate = useNavigate();

    // UI States
    const [historyExpanded, setHistoryExpanded] = useState(true);
    const [contextModalOpen, setContextModalOpen] = useState(false);
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);

    // Data States
    const [sessions, setSessions] = useState<any[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [jobData, setJobData] = useState<any>(null);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    // Context Selection
    const [executions, setExecutions] = useState<any[]>([]);
    const [selectedExecutionId, setSelectedExecutionId] = useState<number | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const formatExecutionName = (ex: any) => {
        if (!ex) return "Automatic Baseline";
        const date = new Date(ex.started_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        return `Audit Synthesis [${date}]`;
    };

    const fetchJobContext = async () => {
        try {
            const res = await api.get(`jobs/${jobId}/`);
            setJobData(res.data);
            const exRes = await api.get('execution/list/');
            const jobEx = exRes.data.filter((ex: any) => ex.job_name === res.data.name);
            setExecutions(jobEx);
        } catch (err) {
            toast.error("Telemetry link lost.");
        }
    };

    const fetchSessions = async () => {
        try {
            const res = await api.get(`chat/job/${jobId}/sessions/`);
            setSessions(res.data);
        } catch (err) { }
    };

    const loadSession = async (s: any) => {
        try {
            setLoading(true);
            const res = await api.get(`chat/history/${s.id}/`);
            setMessages(res.data.messages);
            setCurrentSessionId(s.id);
            if (s.execution) setSelectedExecutionId(s.execution);
        } catch (err) {
            toast.error("Fragment load error.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobContext();
        fetchSessions();
    }, [jobId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const triggerWorkflow = async () => {
        try {
            setLoading(true);
            await api.post(`execution/${jobId}/run/`, { model: "BournAI" });
            toast.success("Intelligence cycle initiated.");
            setTimeout(fetchJobContext, 3000);
        } catch (err) { } finally { setLoading(false); }
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: "USER", content: userMsg, time: new Date().toISOString() }]);
        setInput("");
        setLoading(true);

        try {
            const res = await api.post("chat/", {
                job_id: jobId,
                session_id: currentSessionId,
                message: userMsg,
                model: "BournAI",
                execution_id: selectedExecutionId
            });
            setMessages(prev => [...prev, { role: "AI", content: res.data.response, time: new Date().toISOString() }]);
            if (!currentSessionId) {
                setCurrentSessionId(res.data.session_id);
                fetchSessions();
            }
        } catch (err) {
            toast.error("Engine timeout.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex h-screen dark:bg-[#07090e] bg-slate-50 dark:text-gray-100 text-slate-800 font-sans overflow-hidden">

            {/* ULTRA-MODERN GLASS SIDEBAR */}
            <div className={`${historyExpanded ? 'w-80' : 'w-0 opacity-0'} flex-shrink-0 transition-all duration-300 dark:bg-[#090b11]/40 bg-white/40 backdrop-blur-3xl border-r dark:border-white/5 border-slate-200/50 flex flex-col h-full z-30 overflow-hidden`}>
                <div className="p-6 flex items-center justify-between min-w-[320px]">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/dashboard')}>
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <h2 className="text-[12px] font-black tracking-[0.3em] dark:text-white uppercase">DocQ Audit</h2>
                    </div>
                </div>

                <div className="px-5 mb-6">
                    <button onClick={() => { setMessages([]); setCurrentSessionId(null); setSelectedExecutionId(null); }} className="w-full h-11 bg-white/5 hover:bg-white/10 dark:text-white text-slate-900 border dark:border-white/10 border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2">
                        <span className="text-blue-500 text-lg">+</span> Initialize Thread
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-8 custom-scrollbar min-w-[320px]">
                    <div className="text-[9px] font-black text-slate-500 tracking-[0.4em] uppercase mb-5 ml-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40"></div>
                        Historical Fragments
                    </div>
                    {sessions.map((s) => (
                        <div key={s.id} onClick={() => loadSession(s)} className={`p-4 rounded-2xl cursor-pointer mb-2 transition-all group ${currentSessionId === s.id ? 'dark:bg-blue-600/10 bg-blue-50/80 border dark:border-blue-500/20 border-blue-500/20 shadow-lg' : 'hover:dark:bg-white/5 hover:bg-white/80 border border-transparent'}`}>
                            <div className="flex justify-between items-start gap-3">
                                <h4 className={`text-[12px] tracking-tight truncate leading-tight ${currentSessionId === s.id ? 'font-black dark:text-white text-blue-600' : 'font-bold dark:text-slate-400 text-slate-600'}`}>{s.title || 'Inference Instance'}</h4>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <div className="text-[8px] font-black dark:text-slate-600 text-slate-400 uppercase tracking-widest">{s.time ? new Date(s.time).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '---'}</div>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MAIN CHAT CANVAS */}
            <div className="flex-1 flex flex-col h-full bg-inherit transition-all relative">

                {/* FLOATING HEADER */}
                <div className="h-16 border-b dark:border-white/5 border-slate-200/50 flex items-center justify-between px-8 shrink-0 z-20 dark:bg-[#07090e]/80 bg-white/80 backdrop-blur-xl">
                    <div className="flex items-center gap-6">
                        {!historyExpanded && (
                            <button onClick={() => setHistoryExpanded(true)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
                            </button>
                        )}
                        <div className="flex flex-col">
                            <span className="text-[12px] font-black dark:text-white uppercase tracking-[0.2em]">{jobData?.name || 'Audit Workflow'}</span>
                            <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.1em] mt-0.5">{selectedExecutionId ? formatExecutionName(executions.find(e => e.id === selectedExecutionId)) : "Real-time Intelligence State"}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => setContextModalOpen(true)} className="h-8 px-5 text-[9px] font-black dark:text-slate-300 text-slate-600 uppercase tracking-widest border dark:border-white/10 border-slate-200 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div> Context
                        </button>
                        <button onClick={() => setSettingsModalOpen(true)} className="h-8 w-8 flex items-center justify-center dark:text-white text-slate-600 hover:bg-white/10 rounded-xl transition-all border dark:border-white/10 border-slate-200">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 110-4m0 4v2m0-6V4"></path></svg>
                        </button>
                        <div className="w-px h-4 dark:bg-white/10 bg-slate-200 mx-2"></div>
                        <ProfileMenu />
                    </div>
                </div>

                {/* IMMERSIVE MESSAGE FEED */}
                <div className="flex-1 overflow-y-auto px-6 md:px-0 py-10 relative custom-scrollbar">
                    {/* Background Decorative Element */}
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.07] overflow-hidden">
                        <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] bg-blue-600 rounded-full blur-[120px] animate-pulse"></div>
                        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-indigo-600 rounded-full blur-[100px] animate-pulse delay-1000"></div>
                    </div>

                    <div className="w-full max-w-[800px] mx-auto flex flex-col gap-10 pb-20 relative z-10">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                                <div className="w-16 h-16 rounded-3xl bg-blue-600/10 flex items-center justify-center mb-6 border border-blue-600/20">
                                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                </div>
                                <h3 className="text-[16px] font-black dark:text-white uppercase tracking-[0.5em] mb-4">Awaiting Pulse</h3>
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] max-w-sm leading-relaxed">System ready for intelligence inquiry on <br /> <span className="text-blue-500 font-black">'{jobData?.name}'</span> telemetry fragments.</p>
                            </div>
                        )}

                        {messages.map((m, idx) => (
                            <div key={idx} className={`flex w-full animate-in fade-in slide-in-from-bottom-4 duration-500 ${m.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex flex-col gap-2 max-w-[85%] ${m.role === 'USER' ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-5 rounded-3xl text-[14px] leading-relaxed shadow-sm transition-all hover:shadow-xl ${m.role === 'USER'
                                        ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none shadow-blue-500/10'
                                        : 'dark:bg-[#11141d]/70 bg-white border dark:border-white/5 border-slate-200/60 dark:text-slate-200 text-slate-800 rounded-tl-none backdrop-blur-md'
                                        }`}>
                                        {m.content.includes("[TRIGGER_ACTION:IMMEDIATE]") ? (
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mt-2">
                                                <p className="mb-4">{m.content.replace("[TRIGGER_ACTION:IMMEDIATE]", "").trim()}</p>
                                                <div className="flex gap-2">
                                                    <button onClick={triggerWorkflow} className="h-8 px-6 bg-white text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all active:scale-95">Verify Pulse</button>
                                                    <button onClick={() => setMessages(prev => [...prev, { role: "AI", content: "Protocol bypass acknowledged.", time: new Date().toISOString() }])} className="h-8 px-6 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/20 transition-all">Dismiss</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="whitespace-pre-wrap font-medium">{m.content}</div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 px-2">
                                        {m.role === 'AI' && <span className="text-[7px] font-black text-blue-500 uppercase tracking-widest">BournAI Inference</span>}
                                        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest opacity-40">{m.time ? new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-2 px-4 animate-pulse">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-60"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-30"></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* PREMIUM COMMAND INPUT */}
                <div className="p-6 md:p-10 shrink-0 z-20 dark:bg-[#07090e]/80 bg-slate-50/80 backdrop-blur-xl border-t dark:border-white/5 border-slate-200/50">
                    <div className="w-full max-w-[840px] mx-auto">
                        <div className="relative group p-1 dark:bg-white/[0.03] bg-white border dark:border-white/10 border-slate-200/80 rounded-[28px] shadow-2xl transition-all focus-within:ring-2 ring-blue-500/20">
                            <div className="flex items-center gap-3 pr-2 pl-6 py-2">
                                <input
                                    className="flex-1 bg-transparent border-none text-[15px] dark:text-white text-slate-900 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none py-3"
                                    placeholder={`Command the DocQ core...`}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    autoFocus
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!input.trim() || loading}
                                    className="h-12 w-12 rounded-[22px] bg-gradient-to-br from-blue-500 to-indigo-600 hover:scale-105 disabled:opacity-20 text-white flex items-center justify-center transition-all shadow-xl shadow-blue-500/30 active:scale-95 group-hover:shadow-blue-500/40"
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                </button>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-center items-center gap-6">
                            <span className="text-[8px] font-black dark:text-slate-600 text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-blue-500"></div> Shift + Enter for new line
                            </span>
                            <span className="text-[8px] font-black dark:text-slate-600 text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-emerald-500"></div> System integrity verified
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* HIGH-END CONTEXT MODAL */}
            {contextModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-lg dark:bg-[#090b11] bg-white border dark:border-white/10 border-slate-200 rounded-[40px] shadow-2xl p-10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-[14px] font-black dark:text-white text-slate-900 uppercase tracking-[0.4em]">Inference Scoping</h3>
                                <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Pinpoint the intelligence domain.</p>
                            </div>
                            <button onClick={() => setContextModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="space-y-3 max-h-[440px] overflow-y-auto pr-3 custom-scrollbar">
                            <div onClick={() => { setSelectedExecutionId(null); setContextModalOpen(false); }} className={`p-6 rounded-3xl cursor-pointer border-2 transition-all ${!selectedExecutionId ? 'dark:bg-blue-600/10 bg-blue-50 border-blue-500/40' : 'dark:bg-white/5 bg-slate-50 border-transparent hover:border-slate-300'}`}>
                                <div className="text-[11px] font-black dark:text-white text-slate-900 uppercase tracking-[0.2em]">Global Intelligence State</div>
                                <p className="text-[8px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Automatically scope to the latest successful audit pulse.</p>
                            </div>
                            <div className="h-px w-full dark:bg-white/5 bg-slate-100 my-4"></div>
                            {executions.map((ex) => (
                                <div key={ex.id} onClick={() => { setSelectedExecutionId(ex.id); setContextModalOpen(false); }} className={`p-6 rounded-3xl cursor-pointer border-2 transition-all ${selectedExecutionId === ex.id ? 'dark:bg-blue-600/10 bg-blue-50 border-blue-500/40' : 'dark:bg-white/5 bg-slate-50 border-transparent hover:border-slate-300'}`}>
                                    <div className="text-[11px] font-black dark:text-slate-200 text-slate-700 uppercase tracking-[0.2em]">{formatExecutionName(ex)}</div>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="text-[8px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-500"></div> ID #{ex.id}</div>
                                        <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Verified Fragment</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* HIGH-END SETTINGS MODAL */}
            {settingsModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="w-full max-w-sm dark:bg-[#090b11] bg-white border dark:border-white/10 border-slate-200 rounded-[50px] shadow-2xl p-12 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-blue-600/5 pointer-events-none"></div>
                        <div className="w-20 h-20 rounded-[35px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/30">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <h3 className="text-[12px] font-black dark:text-white text-slate-900 uppercase tracking-[0.6em] mb-10">Inference Core</h3>
                        <div className="dark:bg-white/5 bg-slate-100 border dark:border-white/10 border-slate-100 rounded-[30px] p-8 mb-10 transition-all hover:scale-105">
                            <span className="text-2xl font-black bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent uppercase tracking-[0.3em]">BournAI</span>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3">Active Cluster: V12.4 Stable</p>
                        </div>
                        <button onClick={() => setSettingsModalOpen(false)} className="h-14 w-full bg-slate-900 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-[28px] hover:bg-black transition-all active:scale-95 shadow-xl">Exit Settings</button>
                    </div>
                </div>
            )}
        </div>
    );
}
