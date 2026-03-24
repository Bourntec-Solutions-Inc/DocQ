import { useEffect, useState } from "react";
import api from "../api/client";
import { ProfileMenu } from "../components/ProfileMenu";
import { useNavigate } from "react-router-dom";

export default function ExecutionList() {
    const [executions, setExecutions] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchExecutions = async () => {
            try {
                const res = await api.get("execution/");
                setExecutions(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchExecutions();
    }, []);

    return (
        <div className="min-h-screen dark:bg-[#0B0D13] bg-white dark:text-gray-200">
            <header className="h-16 border-b dark:border-gray-800 border-gray-200 flex items-center justify-between px-6 sticky top-0 bg-inherit z-50">
                <div onClick={() => navigate('/dashboard')} className="flex items-center gap-3 cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-primaryBlue flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white"><path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" /></svg>
                    </div>
                    <span className="text-lg font-bold tracking-tight dark:text-white">System Audit</span>
                </div>
                <ProfileMenu />
            </header>

            <main className="max-w-5xl mx-auto px-6 py-10">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black dark:text-white mb-2">Audit Logs</h1>
                        <p className="text-gray-500 font-medium">Global history of all automation triggers and AI responses.</p>
                    </div>
                </div>

                <div className="dark:bg-[#13151D] bg-white border dark:border-gray-800 border-gray-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b dark:border-gray-800 border-gray-200 dark:bg-gray-800/50 bg-gray-50 uppercase text-[10px] font-black tracking-widest text-gray-500">
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Workflow</th>
                                <th className="px-6 py-4">Model</th>
                                <th className="px-6 py-4">Started At</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-800 divide-gray-200">
                            {executions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-500 font-bold uppercase tracking-widest text-xs opacity-50">No execution logs found</td>
                                </tr>
                            ) : (
                                executions.map((ex) => (
                                    <tr key={ex.id} className="hover:dark:bg-white/[0.02] hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${ex.status === 'SUCCESS' ? 'bg-green-500/10 border-green-500/20 text-green-500' : ex.status === 'RUNNING' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                                                {ex.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold dark:text-white text-gray-900">{ex.job_name || 'Workflow'}</div>
                                            <div className="text-[10px] text-gray-500 font-mono">ID: {String(ex.id).slice(0, 8)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black dark:text-gray-400 text-gray-600 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded uppercase">{ex.model_used}</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-gray-500">
                                            {new Date(ex.started_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => navigate(`/execution/${ex.id}`)}
                                                className="text-xs font-black text-primaryBlue hover:underline uppercase tracking-widest"
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
