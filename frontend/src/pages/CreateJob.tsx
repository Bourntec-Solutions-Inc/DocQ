import { useState } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function CreateJob() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [model, setModel] = useState("BournAI");
    const [frequency, setFrequency] = useState("Daily");
    const [time, setTime] = useState("09:00");
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    const handleRunOnce = async () => {
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("name", name || "Immediate Execution");
            files.forEach((file) => formData.append("files", file));

            const res = await api.post("jobs/create/", formData);
            const jobId = res.data.id;

            await api.post(`execution/${jobId}/run/`, { model: "BournAI" });
            toast.success("Job executed immediately!");
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            toast.error("Error executing immediately. Check logs.");
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("name", name);
            files.forEach((file) => formData.append("files", file));

            // Create Job
            const res = await api.post("jobs/create/", formData);
            const jobId = res.data.id;

            // Create Schedule
            await api.post(`scheduler/${jobId}/create/`, {
                run_time: time,
                model: model
            });

            toast.success("Job created & scheduled successfully!");
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            toast.error("Error generating job. Check logs for details.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen dark:bg-[#0B0D13] bg-white dark:text-gray-200 text-gray-800 font-sans pb-28">

            {/* HEADER */}
            <header className="px-8 py-8 max-w-[900px] mx-auto flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white text-gray-900 tracking-tight mb-2">Create AI Job</h1>
                    <p className="dark:text-gray-400 text-gray-600 text-sm">Configure and schedule a new automated workflow execution.</p>
                </div>
                <button className="flex items-center gap-2 dark:bg-[#1A1D24] bg-slate-50 border dark:border-gray-700 border-gray-300 hover:border-gray-500 dark:text-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    Documentation
                </button>
            </header>

            <div className="max-w-[900px] mx-auto px-8 flex flex-col gap-6">

                {/* SECTION 1: JOB INFORMATION */}
                <section className="dark:bg-[#13151D] bg-white shadow-sm border dark:border-gray-800 border-gray-200/80 rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-6 h-6 rounded-full bg-blue-500 dark:text-white text-gray-900 flex items-center justify-center font-bold text-xs shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                        </div>
                        <h2 className="text-lg font-bold dark:text-white text-gray-900 tracking-wide">Job Information</h2>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-semibold dark:text-gray-300 text-gray-700 mb-2">Job Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Daily Market Sentiment Analysis"
                            className="w-full dark:bg-[#0B0D13] bg-white border dark:border-gray-800 border-gray-200 rounded-lg px-4 py-3 text-sm dark:text-white text-gray-900 placeholder-gray-600 focus:outline-none focus:border-primaryBlue/50 transition-colors shadow-inner"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold dark:text-gray-300 text-gray-700 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Explain what this automation does..."
                            rows={3}
                            className="w-full dark:bg-[#0B0D13] bg-white border dark:border-gray-800 border-gray-200 rounded-lg px-4 py-3 text-sm dark:text-white text-gray-900 placeholder-gray-600 focus:outline-none focus:border-primaryBlue/50 transition-colors shadow-inner resize-y"
                        ></textarea>
                    </div>
                </section>

                {/* SECTION 2: PROMPT SOURCE */}
                <section className="dark:bg-[#13151D] bg-white shadow-sm border dark:border-gray-800 border-gray-200/80 rounded-xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded bg-primaryBlue dark:text-white text-gray-900 flex items-center justify-center font-bold text-xs shadow-sm">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            </div>
                            <h2 className="text-lg font-bold dark:text-white text-gray-900 tracking-wide">Prompt Source</h2>
                        </div>

                        {files.length > 0 && (
                            <div className="flex items-center gap-4 text-xs font-semibold">
                                <span className="text-gray-500">{files.length} Files Selected</span>
                                <button onClick={() => setFiles([])} className="text-primaryBlue hover:text-blue-400">Re-upload All</button>
                            </div>
                        )}
                    </div>

                    <div className="relative border-2 border-dashed dark:border-gray-800 border-gray-200/80 hover:border-primaryBlue/50 rounded-xl bg-[#0e1017] flex flex-col items-center justify-center py-12 transition-colors mb-6 cursor-pointer">
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 text-primaryBlue flex items-center justify-center mb-3">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z"></path></svg>
                        </div>
                        <p className="text-sm font-bold dark:text-white text-gray-900 mb-1">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500">Folders or .txt files only</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        {files.length === 0 ? (
                            <div className="hidden"></div>
                        ) : (
                            files.map((f, i) => (
                                <div key={i} className="flex items-center justify-between dark:bg-[#1A1D24] bg-slate-50 border dark:border-gray-800 border-gray-200 rounded-lg px-4 py-3">
                                    <div className="flex items-center gap-3 text-sm font-medium dark:text-gray-300 text-gray-700">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        {f.name}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button className="text-gray-500 hover:dark:text-white text-gray-900"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path></svg></button>
                                        <button className="text-gray-500 hover:dark:text-white text-gray-900"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                                        <button onClick={() => removeFile(i)} className="text-gray-500 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Placeholder elements rendering identically to the mockup */}
                        {files.length === 0 && (
                            <>
                                <div className="flex items-center justify-between dark:bg-[#1A1D24] bg-slate-50 border dark:border-gray-800 border-gray-200 rounded-lg px-4 py-3">
                                    <div className="flex items-center gap-3 text-sm font-medium dark:text-gray-300 text-gray-700">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        market_trends_v1.txt
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button className="text-gray-500 hover:dark:text-white text-gray-900"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path></svg></button>
                                        <button className="text-gray-500 hover:dark:text-white text-gray-900"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                                        <button className="text-gray-500 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between dark:bg-[#1A1D24] bg-slate-50 border dark:border-gray-800 border-gray-200 rounded-lg px-4 py-3 opacity-50">
                                    <div className="flex items-center gap-3 text-sm font-medium dark:text-gray-300 text-gray-700">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        analysis_prompt_eng.txt
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button className="text-gray-500 hover:dark:text-white text-gray-900"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path></svg></button>
                                        <button className="text-gray-500 hover:dark:text-white text-gray-900"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                                        <button className="text-gray-500 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* SECTION 3: EXECUTION CONFIG */}
                <section className="dark:bg-[#13151D] bg-white shadow-sm border dark:border-gray-800 border-gray-200/80 rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-6 h-6 rounded bg-blue-500/10 border border-blue-500/20 text-primaryBlue flex items-center justify-center font-bold text-xs">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                        </div>
                        <h2 className="text-lg font-bold dark:text-white text-gray-900 tracking-wide">Execution Configuration</h2>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-500 mb-2 tracking-wide">Model Selection</label>
                        <div className="relative">
                            <select
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full dark:bg-[#1A1D24] bg-slate-50 border dark:border-gray-700 border-gray-300/80 rounded-lg px-4 py-3.5 text-sm dark:text-gray-300 text-gray-700 appearance-none focus:outline-none focus:border-primaryBlue/50 transition-colors"
                            >
                                <option value="BournAI">BournAI (Risk Analyst Default)</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <div className="border-t dark:border-gray-800 border-gray-200/80 pt-5 flex items-center justify-between cursor-pointer group">
                        <span className="text-sm font-bold text-gray-500 tracking-wider uppercase group-hover:dark:text-gray-300 text-gray-700 transition-colors">Advanced Settings</span>
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </section>

                {/* SECTION 4: SCHEDULING */}
                <section className="dark:bg-[#13151D] bg-white shadow-sm border dark:border-gray-800 border-gray-200/80 rounded-xl p-8 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-6 h-6 rounded-full bg-primaryBlue dark:text-white text-gray-900 flex items-center justify-center shadow-sm">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h2 className="text-lg font-bold dark:text-white text-gray-900 tracking-wide">Scheduling</h2>
                    </div>

                    <div className="dark:bg-[#1A1D24] bg-slate-50 border dark:border-gray-800 border-gray-200 rounded-xl p-6 flex flex-col md:flex-row items-center gap-8">

                        <div className="flex-1 w-full">
                            <label className="block text-[10px] uppercase font-bold text-primaryBlue tracking-widest mb-2">Frequency</label>
                            <div className="relative">
                                <select
                                    value={frequency}
                                    onChange={(e) => setFrequency(e.target.value)}
                                    className="w-full bg-transparent border-b dark:border-gray-700 border-gray-300 pb-2 dark:text-white text-gray-900 font-semibold focus:outline-none appearance-none cursor-pointer"
                                >
                                    <option value="Daily">Daily</option>
                                    <option value="Weekly">Weekly</option>
                                </select>
                                <svg className="w-4 h-4 absolute right-0 top-1 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>

                        <div className="flex-1 w-full relative">
                            <label className="block text-[10px] uppercase font-bold text-primaryBlue tracking-widest mb-2">Start Time</label>
                            <div className="relative">
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full bg-transparent border-b dark:border-gray-700 border-gray-300 pb-2 dark:text-white text-gray-900 font-semibold focus:outline-none"
                                />
                                <svg className="w-4 h-4 absolute right-0 top-1 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                        </div>

                        <div className="flex-2 w-full pl-6 border-l dark:border-gray-800 border-gray-200">
                            <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Preview Summary</label>
                            <p className="text-sm font-medium dark:text-gray-400 text-gray-600 italic">
                                "This job will automatically run every <span className="dark:text-white text-gray-900 font-semibold not-italic">day</span> at <span className="dark:text-white text-gray-900 font-semibold not-italic">{time || "09:00"}</span> UTC"
                            </p>
                        </div>

                    </div>
                </section>

            </div>

            {/* GLOBAL ACTIONS FOOTER */}
            <div className="fixed bottom-0 w-full dark:bg-[#0B0D13] bg-white/90 backdrop-blur border-t dark:border-gray-800 border-gray-200/80 px-8 py-5 z-50 flex justify-between items-center shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                <button onClick={() => navigate('/dashboard')} className="text-sm font-semibold dark:text-gray-400 text-gray-600 hover:dark:text-white text-gray-900 transition-colors">Cancel</button>

                <div className="flex items-center gap-4">
                    <button onClick={handleRunOnce} disabled={uploading} className="px-5 py-2.5 rounded-lg border dark:border-gray-700 border-gray-300 bg-transparent dark:text-white text-gray-900 font-semibold text-sm hover:dark:bg-gray-800 bg-gray-100 transition-colors tracking-wide">
                        Run <span className="dark:text-white text-gray-900 font-black">Once</span> Now
                    </button>
                    <button onClick={handleSubmit} disabled={uploading} className="px-6 py-2.5 rounded-lg bg-primaryBlue hover:bg-blue-600 dark:text-white text-gray-900 font-bold text-sm transition-colors shadow-lg shadow-blue-500/20">
                        {uploading ? "Saving..." : "Save & Schedule Job"}
                    </button>
                </div>
            </div>

        </div>
    );
}
