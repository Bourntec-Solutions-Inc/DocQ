import { ProfileMenu } from "../components/ProfileMenu";
import { useEffect, useState } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Dashboard() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [activity, setActivity] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("All");
    const [editModal, setEditModal] = useState<any>(null);
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        try {
            const [jobsRes, statsRes] = await Promise.all([
                api.get("jobs/"),
                api.get("jobs/stats/")
            ]);
            setJobs(jobsRes.data);
            setStats(statsRes.data.stats);
            setActivity(statsRes.data.activity);
        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchJobs = fetchDashboardData;

    const filteredJobs = jobs
        .filter(j => activeTab === "All" ? !j.is_archived : j.is_archived)
        .filter(j =>
            j.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (j.description && j.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );

    const toggleArchive = async (job: any) => {
        try {
            await api.patch(`jobs/${job.id}/`, { is_archived: !job.is_archived });
            toast.success(`Job ${job.is_archived ? "Restored" : "Archived"}`);
            fetchJobs();
        } catch (err) {
            toast.error("Error archiving job.");
            console.error(err);
        }
    };

    const runJobOnce = async (jobId: string) => {
        try {
            await api.post(`execution/${jobId}/run/`, { model: "BournAI" });
            toast.success("Job triggered successfully!");
            fetchDashboardData();
        } catch (err) {
            toast.error("Trigger fail.");
            console.error(err);
        }
    };

    const saveEdit = async (e: any) => {
        e.preventDefault();
        try {
            await api.patch(`jobs/${editModal.id}/`, { name: editModal.name });
            if (editModal.time) {
                await api.post(`scheduler/${editModal.id}/create/`, { run_time: editModal.time, model: "BournAI" });
            }
            toast.success("Job updated.");
            setEditModal(null);
            fetchJobs();
        } catch (err) {
            toast.error("Update failed.");
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen dark:bg-[#090b11] bg-slate-50 dark:text-gray-200 text-slate-800 font-sans pb-10">
            {/* COMPACT STICKY HEADER */}
            <header className="h-14 border-b dark:border-gray-800/60 border-slate-200 dark:bg-[#090b11]/80 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <span className="text-xl font-black tracking-tighter dark:text-white text-slate-900 uppercase italic">DocQ</span>
                </div>

                <div className="flex-1 max-w-lg mx-12">
                    <div className="relative group">
                        <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        <input
                            type="text"
                            placeholder="Input intelligence query..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-8 dark:bg-[#11141d] bg-slate-100/50 border dark:border-gray-800 border-slate-200 text-[11px] rounded-lg pl-9 pr-4 dark:text-white text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10 transition-all font-bold uppercase tracking-widest"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/job/create')}
                        className="h-8 bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                    >
                        + Create Job
                    </button>
                    <ProfileMenu />
                </div>
            </header>

            <main className="max-w-[1440px] mx-auto px-6 mt-6">
                {/* HIGH-DENSITY METRICS GRID */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: 'Active Pipeline', value: stats?.active_jobs || 0, color: 'text-blue-500', bg: 'bg-blue-500/5', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                        { label: 'Reliability', value: '100%', color: 'text-emerald-500', bg: 'bg-emerald-500/5', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                        { label: 'Next Pulse', value: stats?.next_scheduled || '09:00 AM', color: 'text-amber-500', bg: 'bg-amber-500/5', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                        { label: 'Sys Alerts', value: stats?.alerts || 0, color: 'text-rose-500', bg: 'bg-rose-500/5', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' }
                    ].map((m, i) => (
                        <div key={i} className="dark:bg-[#11141d] bg-white border dark:border-gray-800 border-slate-200 rounded-xl p-4 flex items-center gap-4 group hover:dark:border-slate-700 transition-all shadow-sm">
                            <div className={`w-9 h-9 rounded-lg ${m.bg} ${m.color} flex items-center justify-center flex-shrink-0`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={m.icon}></path></svg>
                            </div>
                            <div>
                                <div className="text-[18px] font-black dark:text-white text-slate-900 leading-none mb-1">{m.value}</div>
                                <div className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">{m.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT: WORKSPACE (70% width approx) */}
                    <div className="lg:col-span-8 flex flex-col h-[calc(100vh-280px)] min-h-[600px]">
                        <div className="flex items-center justify-between mb-3 shrink-0">
                            <h2 className="text-[12px] font-black dark:text-white text-slate-900 uppercase tracking-[0.3em]">Operational Flow</h2>
                            <div className="flex dark:bg-[#11141d] bg-slate-200/50 rounded-lg p-0.5 border dark:border-gray-800 border-slate-200">
                                {['All', 'Archive'].map(t => (
                                    <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${activeTab === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>{t}</button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                            {filteredJobs.length === 0 ? (
                                <div className="h-full dark:bg-[#11141d] bg-white border dark:border-gray-800 border-slate-200 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-12 opacity-50">
                                    <svg className="w-10 h-10 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                                    <p className="text-[10px] font-black uppercase tracking-widest">No matching telemetry units</p>
                                </div>
                            ) : (
                                filteredJobs.map((job) => (
                                    <div key={job.id} className="dark:bg-[#11141d] bg-white border dark:border-gray-800 border-slate-200 rounded-xl p-4 flex items-center justify-between group hover:dark:border-blue-500/30 hover:border-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/5 relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className="w-10 h-10 rounded-lg dark:bg-slate-800 bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2.5 mb-0.5">
                                                    <h3 className="text-[13px] font-black dark:text-white text-slate-900 tracking-tight">{job.name}</h3>
                                                    <span className={`text-[7px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded border ${job.is_archived ? 'dark:border-slate-700 dark:text-slate-500 border-slate-200 text-slate-400' : 'dark:border-emerald-500/30 dark:text-emerald-500 border-emerald-200 text-emerald-600 bg-emerald-500/5'}`}>
                                                        {job.is_archived ? 'Archived' : 'Active Pulse'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                                    <span>{job.files?.length || 0} Context Blocks</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                                                    <span>{new Date(job.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 relative z-10 transition-all">
                                            {job.is_archived ? (
                                                <button onClick={() => toggleArchive(job)} className="h-8 px-4 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                                    Restore
                                                </button>
                                            ) : (
                                                <>
                                                    <button onClick={() => navigate(`/chat/${job.id}`)} className="h-8 w-8 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95" title="AI Interaction">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                                                    </button>
                                                    <button onClick={() => navigate(`/job/${job.id}`)} className="h-8 w-8 flex items-center justify-center rounded-lg dark:bg-slate-800 bg-slate-100 dark:text-slate-300 text-slate-600 hover:dark:bg-slate-700 hover:bg-slate-200 transition-all active:scale-95" title="System Details">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                                                    </button>
                                                    <button onClick={() => setEditModal(job)} className="h-8 w-8 flex items-center justify-center rounded-lg dark:bg-slate-800 bg-slate-100 dark:text-slate-300 text-slate-600 hover:dark:bg-slate-700 hover:bg-slate-200 transition-all active:scale-95" title="Modify Pulse">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                    </button>
                                                    <button onClick={() => runJobOnce(job.id)} className="h-8 w-8 flex items-center justify-center rounded-lg dark:bg-emerald-500/10 bg-emerald-500/5 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all active:scale-95" title="Execute Direct">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path></svg>
                                                    </button>
                                                    <button onClick={() => toggleArchive(job)} className="h-8 w-8 flex items-center justify-center rounded-lg dark:bg-rose-500/10 bg-rose-500/5 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all active:scale-95" title="Move to Archive">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT: LIVE ACTIVITY (30% width approx) */}
                    <div className="lg:col-span-4 flex flex-col h-[calc(100vh-200px)]">
                        <div className="flex items-center justify-between mb-3 shrink-0">
                            <h2 className="text-[12px] font-black dark:text-white text-slate-900 uppercase tracking-[0.3em]">Telemetry Stream</h2>
                            <button onClick={fetchDashboardData} className="p-1 dark:text-slate-500 text-slate-400 hover:dark:text-white hover:text-slate-900 transition-all">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            </button>
                        </div>

                        <div className="flex-1 dark:bg-[#11141d] bg-white border dark:border-gray-800 border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {activity.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 opacity-20">
                                        <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        <p className="text-[9px] uppercase font-black tracking-widest leading-relaxed">System standby.<br />Awaiting operational pulse.</p>
                                    </div>
                                ) : (
                                    activity.map((item, idx) => (
                                        <div key={idx} className="flex flex-col border-b last:border-0 dark:border-gray-800/40 border-slate-100 p-4 hover:dark:bg-slate-800/20 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-start justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'SUCCESS' ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : item.status === 'FAILED' ? 'bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]' : 'bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]'}`}></div>
                                                    <span className="text-[11px] font-black dark:text-gray-200 text-slate-800 tracking-tight leading-none">{item.title}</span>
                                                </div>
                                                <span className="text-[8px] font-black text-slate-500 uppercase">{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-medium pl-3.5 leading-snug line-clamp-2">{item.description}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <button onClick={() => navigate('/executions')} className="h-10 border-t dark:border-gray-800 border-slate-100 dark:bg-slate-800/40 bg-slate-50 text-[9px] font-black text-blue-600 uppercase tracking-widest hover:dark:bg-slate-800 hover:bg-slate-100 transition-all flex items-center justify-center gap-2 group">
                                System Audit Explorer
                                <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* EDIT MODAL - SLEEKER VERSION */}
            {editModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#090b11]/80 backdrop-blur-md transition-all">
                    <form onSubmit={saveEdit} className="w-full max-w-[400px] dark:bg-[#11141d] bg-white border dark:border-gray-800 border-slate-200 rounded-3xl shadow-2xl flex flex-col p-8 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-sm font-black dark:text-white text-slate-900 uppercase tracking-[0.2em]">Update Pulse</h3>
                                <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Reconfiguring operational parameters.</p>
                            </div>
                            <button type="button" onClick={() => setEditModal(null)} className="text-slate-500 hover:text-slate-900 transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Display Identifier</label>
                                <input
                                    type="text"
                                    value={editModal.name}
                                    onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                                    required
                                    className="w-full h-10 dark:bg-[#090b11] bg-slate-100 border dark:border-gray-800 border-slate-200 rounded-xl px-4 text-xs font-bold dark:text-white text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Frequency Matrix</label>
                                <input
                                    type="time"
                                    value={editModal.time || "09:00"}
                                    onChange={(e) => setEditModal({ ...editModal, time: e.target.value })}
                                    className="w-full h-10 dark:bg-[#090b11] bg-slate-100 border dark:border-gray-800 border-slate-200 rounded-xl px-4 text-xs font-bold dark:text-white text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-8">
                            <button type="button" onClick={() => setEditModal(null)} className="flex-1 h-10 rounded-xl border dark:border-gray-800 border-slate-200 dark:text-slate-500 text-slate-600 font-black text-[9px] uppercase tracking-widest hover:dark:bg-slate-800 hover:bg-slate-50 transition-all">Dismiss</button>
                            <button type="submit" className="flex-1 h-10 rounded-xl bg-blue-600 text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">Commit</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
