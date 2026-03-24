import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import Dashboard from "../pages/Dashboard";
import JobDetail from "../pages/JobDetail";
import ExecutionDetail from "../pages/ExecutionDetail";
import ExecutionList from "../pages/ExecutionList";
import ChatPage from "../pages/ChatPage";
import CreateJob from "../pages/CreateJob";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user ? <Outlet /> : <Navigate to="/" replace />;
};

const PublicRoute = () => {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route element={<PublicRoute />}>
                    <Route path="/" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                </Route>

                {/* Secured */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/job/create" element={<CreateJob />} />
                    <Route path="/job/:id" element={<JobDetail />} />
                    <Route path="/executions" element={<ExecutionList />} />
                    <Route path="/execution/:id" element={<ExecutionDetail />} />
                    <Route path="/chat/:jobId" element={<ChatPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
