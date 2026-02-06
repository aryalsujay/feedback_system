import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LogOut, PieChart, Settings, Menu, X } from 'lucide-react';

const AdminLayout = () => {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    React.useEffect(() => {
        if (!loading && !user) {
            navigate('/admin/login', { replace: true });
        }
    }, [user, loading, navigate]);

    // Close mobile menu when route changes
    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Verifying Session...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const navItems = [
        { path: '/admin/analytics', icon: PieChart, label: 'Analytics' },
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
            {/* Mobile Header (only on small screens) */}
            <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 shadow-sm">
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu size={24} className="text-gray-700" />
                    </button>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Admin Panel
                    </h1>
                    <div className="w-10"></div>
                </div>
            </header>

            {/* Overlay (for mobile only) */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Always visible on tablet/desktop, overlay on mobile */}
            <aside className={`
                fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl
                transform transition-transform duration-300 ease-out
                md:translate-x-0 md:relative md:flex md:flex-col
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Sidebar Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 flex-shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Admin Panel
                        </h1>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="md:hidden p-1.5 rounded-lg hover:bg-white/80 transition-colors"
                        >
                            <X size={20} className="text-gray-600" />
                        </button>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-700 capitalize">{user.role?.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.department?.replace('_', ' ')}</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto min-h-0">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                                    flex items-center gap-3 px-4 py-3.5 rounded-xl
                                    transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }
                                `}
                            >
                                <item.icon
                                    size={20}
                                    className={`${isActive ? '' : 'group-hover:scale-110 transition-transform'}`}
                                />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3
                                   text-red-600 hover:bg-red-50 rounded-xl transition-all
                                   font-medium hover:shadow-md"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content - Flexible width to fill remaining space */}
            <main className="flex-1 min-h-screen overflow-x-hidden">
                <div className="pt-16 md:pt-0 px-4 py-6 sm:px-6 md:px-8 md:py-8 w-full max-w-[1600px] mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
