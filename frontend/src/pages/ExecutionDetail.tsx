import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import { ProfileMenu } from "../components/ProfileMenu";
import { toast } from "sonner";

export default function ExecutionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [execution, setExecution] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [downloading, setDownloading] = useState<string | null>(null);

    const fetchExecution = async () => {
        try {
            const res = await api.get(`execution/result/${id}/`);
            setExecution(res.data);

            const listRes = await api.get('execution/list/');
            setHistory(listRes.data.filter((ex: any) => ex.job_name === res.data.job_name));
        } catch (err) {
            console.error("Failed to fetch execution detail", err);
        }
    };

    useEffect(() => {
        fetchExecution();
    }, [id]);

    const handleDownload = async (type: string = 'detailed') => {
        try {
            setDownloading(type);
            const response = await api.get(`execution/download/${id}/?type=${type}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `DocQ_${type.charAt(0).toUpperCase() + type.slice(1)}_Report_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded.`);
        } catch (err) {
            console.error("Download failed", err);
            toast.error("Failed to download. Please try again.");
        } finally {
            setDownloading(null);
        }
    };

    if (!execution) return null;

    return (
        <div className="flex h-screen dark:bg-[#090b11] bg-[#fdfdfd] dark:text-gray-200 text-gray-800 font-sans overflow-hidden">

            {/* COMPACT TOP NAVIGATION */}
            <div className="fixed top-0 left-0 right-0 h-14 dark:bg-[#090b11]/80 backdrop-blur-md border-b dark:border-gray-800/60 border-gray-200 flex items-center justify-between px-6 z-50">
                <div className="flex items-center gap-4">
                    <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <span className="text-xl font-black tracking-tighter dark:text-white uppercase italic">DocQ Audit</span>
                    <div className="h-4 w-px dark:bg-gray-800 bg-gray-200 ml-2"></div>
                    <span className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase hidden md:block">V7.4.2 Production Pipeline</span>
                </div>
                <ProfileMenu />
            </div>

            <div className="flex w-full pt-14 h-full">

                {/* SLEEK SIDEBAR */}
                <div className="w-64 dark:bg-[#07090e] bg-gray-50/50 border-r dark:border-gray-800/40 border-gray-200 flex flex-col h-full shrink-0">
                    <div className="p-4 border-b dark:border-gray-800/40 border-gray-200">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Run History</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                        {history.map((ex: any) => (
                            <div
                                key={ex.id}
                                onClick={() => navigate(`/execution/${ex.id}`)}
                                className={`group p-3 mb-1 rounded-lg cursor-pointer transition-all border ${ex.id === parseInt(id!) ? 'dark:bg-blue-600/10 border-blue-500/30' : 'bg-transparent border-transparent hover:dark:bg-gray-800/40 hover:bg-gray-200/50'}`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${ex.id === parseInt(id!) ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`}>RUN #{ex.id}</span>
                                    <div className={`w-1.5 h-1.5 rounded-full ${ex.status === 'SUCCESS' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                </div>
                                <div className="text-[10px] font-bold truncate dark:text-gray-300 tracking-tight">{new Date(ex.started_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MAIN REPORT - HIGH DENSITY DESIGN */}
                <div className="flex-1 overflow-y-auto custom-scrollbar dark:bg-[#090b11] bg-white relative">
                    <div className="max-w-6xl mx-auto px-8 py-10">

                        {/* HEADER SECTION */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b dark:border-gray-800/60 border-gray-200 pb-10">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-4xl font-black dark:text-white tracking-tight leading-none">{execution.job_name}</h1>
                                    <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-[9px] font-black text-green-500 rounded-full tracking-tighter uppercase">{execution.status}</span>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mt-3">
                                    <span className="flex items-center gap-1.5 font-bold"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>{new Date(execution.started_at).toLocaleDateString()}</span>
                                    <span className="h-3 w-px dark:bg-gray-800 bg-gray-200"></span>
                                    <span className="flex items-center gap-1.5 text-blue-500 font-bold tracking-widest"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.727 2.903a2 2 0 01-3.156.401l-1.902-1.902a2 2 0 00-3.099-.05l-2.233 2.232a2 2 0 01-3.414-1.414V5a2 2 0 012-2h14a2 2 0 012 2v12.428a2 2 0 01-1.414 1.414z"></path></svg>{execution.model_used} ENGINE</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDownload('executive')}
                                    disabled={!!downloading}
                                    className="h-9 px-4 text-[9px] font-black uppercase tracking-widest text-blue-500 border border-blue-500/20 bg-blue-500/5 rounded hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    Executive
                                </button>
                                <button
                                    onClick={() => handleDownload('sources')}
                                    disabled={!!downloading}
                                    className="h-9 px-4 text-[9px] font-black uppercase tracking-widest dark:text-gray-400 text-gray-600 border dark:border-gray-800 border-gray-300 rounded hover:dark:bg-gray-800 transition-all flex items-center gap-2"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                    Sources
                                </button>
                                <button
                                    onClick={() => handleDownload('detailed')}
                                    disabled={!!downloading}
                                    className="h-9 px-4 text-[9px] font-black uppercase tracking-widest text-white bg-blue-600 rounded hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
                                >
                                    <svg className={`w-3.5 h-3.5 ${downloading === 'detailed' ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002-2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    {downloading === 'detailed' ? 'GENERATING...' : 'Detailed PDF'}
                                </button>
                            </div>
                        </div>

                        {/* HIGH DENSITY RESULTS LIST */}
                        <div className="space-y-8">
                            <h2 className="text-[10px] font-black dark:text-gray-500 text-gray-400 uppercase tracking-[0.4em] mb-6">Autonomous Intelligence Synthesis</h2>

                            {execution.results?.map((r: any, idx: number) => {
                                const fileSources = Array.from(new Set(r.response?.match(/https?:\/\/[^\s\)]+/g) || []));
                                return (
                                    <div key={r.id || idx} className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b dark:border-gray-800/40 border-gray-100 pb-12 last:border-0">

                                        {/* FILE META */}
                                        <div className="lg:col-span-3">
                                            <div className="sticky top-20">
                                                <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{r.file_name || 'Workflow Source'}</div>
                                                <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-6 border-b dark:border-gray-800 pb-2">Verified Fragment</div>

                                                {/* PER-FILE SOURCES */}
                                                {fileSources.length > 0 && (
                                                    <div className="space-y-2 mt-4">
                                                        <h4 className="text-[9px] font-black dark:text-gray-400 uppercase tracking-[0.2em] flex items-center gap-1.5 mb-3">
                                                            <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                                            Data Sources
                                                        </h4>
                                                        {fileSources.map((url, uidx) => (
                                                            <a key={uidx} href={url as string} target="_blank" rel="noreferrer" className="block text-[9px] font-bold text-blue-400/80 hover:text-blue-500 truncate transition-colors uppercase tracking-tight py-1">{url as string}</a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* ANALYSIS CONTENT */}
                                        <div className="lg:col-span-9">
                                            <div className="mb-6">
                                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] block mb-3 opacity-60 italic">Inbound Prompt Context</label>
                                                <div className="text-[11px] dark:text-gray-500 text-gray-500 leading-relaxed dark:bg-[#07090e]/50 bg-gray-50/50 p-4 rounded border dark:border-gray-800/40 border-gray-200/50 shadow-inner">
                                                    {r.prompt}
                                                </div>
                                            </div>
                                            <div className="prose prose-invert prose-sm max-w-none">
                                                <label className="text-[9px] font-black text-blue-500/80 uppercase tracking-[0.3em] block mb-3">Intelligence Output</label>
                                                <div className="text-[14px] dark:text-gray-100 text-gray-900 leading-[1.8] font-medium whitespace-pre-wrap dark:bg-[#0B0D13] bg-white p-6 rounded-xl border dark:border-gray-800 border-gray-100 shadow-sm">
                                                    {r.response}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
