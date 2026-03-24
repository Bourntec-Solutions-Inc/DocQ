import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import { toast } from "sonner";
import { ProfileMenu } from "../components/ProfileMenu";

export default function JobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchJobData = async () => {
        try {
            const res = await api.get(`jobs/${id}/`);
            setJob(res.data);
        } catch (err) {
            toast.error("Failed to load workflow telemetry.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobData();
        const interval = setInterval(fetchJobData, 10000); // Poll every 10s for live logs
        return () => clearInterval(interval);
    }, [id]);

    if (loading) return <div className="min-h-screen dark:bg-[#0B0D13] flex items-center justify-center text-primaryBlue font-bold tracking-widest animate-pulse">LOADING TELEMETRY...</div>;

    const analytics = job?.analytics || { history: [] };

    return (
        <div className="min-h-screen dark:bg-[#0B0D13] bg-slate-50 dark:text-gray-200">
            {/* HEADER */}
            <header className="h-16 border-b dark:border-gray-800 border-gray-200 flex items-center justify-between px-6 sticky top-0 bg-inherit z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="p-2 hover:dark:bg-gray-800 hover:bg-gray-200 rounded-lg transition-all text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </button>
                    <div>
                        <h1 className="text-lg font-black dark:text-white text-gray-900 tracking-tight uppercase">{job?.name}</h1>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Workflow Online
                        </div>
                    </div>
                </div>
                <ProfileMenu />
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* STATS STRIP */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Runs', value: analytics.total_executions, icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'blue' },
                        { label: 'Success Rate', value: `${analytics.total_executions > 0 ? Math.round((analytics.success_count / analytics.total_executions) * 100) : 100}%`, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'green' },
                        { label: 'Manual/Sched', value: `${analytics.manual_count} / ${analytics.scheduled_count}`, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'purple' },
                        { label: 'Incidents', value: analytics.failed_count, icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', color: 'red' }
                    ].map((stat, idx) => (
                        <div key={idx} className="dark:bg-[#13151D] bg-white border dark:border-gray-800 border-gray-200 rounded-xl p-4 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${stat.color}-500/10 text-${stat.color}-500`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}></path></svg>
                            </div>
                            <div>
                                <div className="text-xl font-black dark:text-white">{stat.value}</div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT: EXECUTION LOGS */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-sm font-black dark:text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-primaryBlue rounded-full animate-pulse"></span> Raw Execution Telemetry
                        </h2>

                        {analytics.history.length === 0 ? (
                            <div className="dark:bg-[#13151D] bg-white border-2 border-dashed dark:border-gray-800 border-gray-200 rounded-2xl p-20 text-center">
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No execution history available.</p>
                            </div>
                        ) : (
                            analytics.history.map((exec: any) => (
                                <div key={exec.id} className="dark:bg-[#13151D] bg-white border dark:border-gray-800 border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div className="px-5 py-3 dark:bg-gray-800/30 bg-gray-50 border-b dark:border-gray-800 border-gray-200 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${exec.status === 'SUCCESS' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                                {exec.status}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                ID: {String(exec.id).slice(0, 8)} • {exec.trigger_type} TRIGGER
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => navigate(`/execution/${exec.id}`)}
                                                className="text-[9px] font-black text-primaryBlue uppercase tracking-[0.2em] border border-primaryBlue/30 px-2.5 py-1.5 rounded-lg hover:bg-primaryBlue hover:text-white transition-all shadow-lg shadow-blue-500/10 active:scale-95"
                                            >
                                                View Report
                                            </button>
                                            <span className="text-[10px] font-bold text-gray-400">
                                                {exec.started_at ? new Date(exec.started_at).toLocaleString() : 'PENDING'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5 space-y-3">
                                        {exec.logs?.map((log: any, lidx: number) => (
                                            <div key={lidx} className="flex gap-4 group">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-2 h-2 rounded-full mt-1.5 transition-all ${log.level === 'SUCCESS' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : log.level === 'ERROR' ? 'bg-red-500' : 'bg-primaryBlue'}`}></div>
                                                    {lidx !== exec.logs.length - 1 && <div className="w-px h-full dark:bg-gray-800 bg-gray-200 my-1 group-hover:dark:bg-gray-700"></div>}
                                                </div>
                                                <div className="pb-4">
                                                    <p className={`text-xs font-bold leading-relaxed ${log.level === 'ERROR' ? 'text-red-400' : 'dark:text-gray-300 text-gray-700'}`}>{log.message}</p>
                                                    <p className="text-[9px] font-medium text-gray-500 mt-1 uppercase tracking-widest">{new Date(log.time).toLocaleTimeString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* RIGHT: CONFIGURATION */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="dark:bg-[#13151D] bg-white border dark:border-gray-800 border-gray-200 rounded-xl p-6">
                            <h3 className="text-xs font-black dark:text-white uppercase tracking-widest mb-6 border-b dark:border-gray-800 border-gray-100 pb-3">Active Configuration</h3>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Model Core</h4>
                                    <div className="dark:bg-gray-800/30 bg-slate-50 border dark:border-gray-700 border-gray-100 rounded-lg p-3 flex items-center justify-between">
                                        <span className="text-xs font-black dark:text-gray-300">BournAI</span>
                                        <span className="text-[9px] font-bold bg-primaryBlue/10 text-primaryBlue px-2 py-0.5 rounded-full uppercase">DSuite v1.2</span>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Attached Files ({job?.files?.length || 0})</h4>
                                    <div className="space-y-2">
                                        {job?.files?.map((file: any) => (
                                            <div key={file.id} className="flex items-center gap-3 p-2 rounded-lg border dark:border-gray-800 border-gray-100 hover:dark:bg-gray-800/50 transition-colors">
                                                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                <span className="text-[11px] font-bold dark:text-gray-400 text-gray-600 truncate">{file.file_name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* WORKFLOW CONTROLS */}
                        <div className="dark:bg-[#13151D] bg-white border dark:border-gray-800 border-gray-200 rounded-xl p-6">
                            <h3 className="text-xs font-black dark:text-white uppercase tracking-widest mb-6 border-b dark:border-gray-800 border-gray-100 pb-3">Remote Operations</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => navigate(`/chat/${id}`)} className="p-3 dark:bg-gray-800/50 bg-slate-50 border dark:border-gray-700 border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:dark:bg-primaryBlue hover:bg-primaryBlue hover:text-white transition-all text-gray-500">AI Chat</button>
                                <button onClick={() => toast.info("Settings module coming soon.")} className="p-3 dark:bg-gray-800/50 bg-slate-50 border dark:border-gray-700 border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:dark:bg-gray-700 hover:bg-slate-200 transition-all text-gray-500">Edit Setup</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
