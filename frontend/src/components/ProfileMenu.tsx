import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, User as UserIcon, Sun, Moon } from "lucide-react";

export function ProfileMenu() {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    const userName = user?.name || user?.email?.split('@')[0] || "User";
    const userEmail = user?.email || "Unknown";

    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    if (!user) return null;

    return (
        <div className="relative">
            <div
                onClick={() => setOpen(!open)}
                className="w-9 h-9 rounded-full bg-gray-700 dark:bg-gray-700 overflow-hidden border border-gray-300 dark:border-gray-600 cursor-pointer hover:ring-2 ring-primaryBlue/50 transition-all flex items-center justify-center shrink-0"
            >
                <img src={`https://ui-avatars.com/api/?name=${userName}&background=1f2937&color=fff`} alt="User" className="w-full h-full object-cover" />
            </div>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#13151D] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">

                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-primaryBlue flex items-center justify-center shrink-0">
                                <UserIcon size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800 dark:text-white leading-tight">{userName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{userEmail}</p>
                            </div>
                        </div>

                        <div className="p-2 space-y-1">
                            <button onClick={toggleTheme} className="w-full text-left px-3 py-2 flex items-center gap-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1A1D24] text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors">
                                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                            </button>
                        </div>

                        <div className="p-2 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-3 py-2 flex items-center gap-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-500 text-sm font-medium transition-colors"
                            >
                                <LogOut size={16} />
                                Log Out
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
