import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Filter, Calendar, AlertTriangle, XCircle, Trash2, Edit2 } from 'lucide-react';
import Pagination from '../../components/Pagination';
import { getDepartmentName } from '../../utils/departmentNames';

import { API_BASE_URL } from '../../config';

const Dashboard = () => {
    const { user, token } = useAuth();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDept, setSelectedDept] = useState('global');
    const [expandedId, setExpandedId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20); // 20 items per page

    // Date filter states
    const [dateFilter, setDateFilter] = useState('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // Data type filter (sample vs real)
    const [dataTypeFilter, setDataTypeFilter] = useState('all'); // 'all', 'real', 'sample'

    const departments = ['global_pagoda', 'food_court', 'souvenir_shop', 'dhamma_alaya', 'dpvc', 'global'];

    useEffect(() => {
        fetchFeedbacks();
        setCurrentPage(1); // Reset to page 1 when department or filter changes
    }, [selectedDept, dateFilter, customStartDate, customEndDate, dataTypeFilter]);

    const getDateRange = () => {
        const now = new Date();
        let startDate, endDate;

        switch (dateFilter) {
            case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                endDate = new Date(now.setHours(23, 59, 59, 999));
                break;
            case 'week':
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
                weekStart.setHours(0, 0, 0, 0);
                startDate = weekStart;
                endDate = new Date();
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date();
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date();
                break;
            case 'custom':
                if (customStartDate && customEndDate) {
                    startDate = new Date(customStartDate);
                    endDate = new Date(customEndDate);
                    endDate.setHours(23, 59, 59, 999);
                }
                break;
            default:
                return null;
        }

        return { startDate, endDate };
    };

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            let url = `${API_BASE_URL}/api/admin/submissions`;
            if ((user.role === 'super_admin' || (user.role === 'admin' && user.department === 'global')) && selectedDept !== 'global') {
                url += `?department=${selectedDept}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch');

            let data = await response.json();

            // Apply date filter
            const dateRange = getDateRange();
            if (dateRange && dateRange.startDate && dateRange.endDate) {
                data = data.filter(feedback => {
                    const feedbackDate = new Date(feedback.createdAt);
                    return feedbackDate >= dateRange.startDate && feedbackDate <= dateRange.endDate;
                });
            }

            // Apply data type filter (sample vs real)
            if (dataTypeFilter === 'sample') {
                data = data.filter(feedback => feedback.isSample === true);
            } else if (dataTypeFilter === 'real') {
                data = data.filter(feedback => !feedback.isSample);
            }

            setFeedbacks(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Pagination calculations
    const totalPages = Math.ceil(feedbacks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedFeedbacks = feedbacks.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setExpandedId(null); // Collapse expanded items when changing page
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Calculate sample vs real counts for super admin
    const sampleCount = feedbacks.filter(f => f.isSample === true).length;
    const realCount = feedbacks.filter(f => !f.isSample).length;

    // Delete sample feedback entry
    const handleDeleteFeedback = async (feedbackId, e) => {
        e.stopPropagation(); // Prevent expanding/collapsing when clicking delete

        if (!confirm('Are you sure you want to delete this sample feedback entry? This action cannot be undone!')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/feedback/${feedbackId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete feedback');
            }

            // Refresh feedbacks after deletion
            fetchFeedbacks();
            alert('Sample feedback deleted successfully');
        } catch (error) {
            console.error('Error deleting feedback:', error);
            alert(error.message || 'Failed to delete feedback');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Feedback Submissions</h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Manage and view incoming feedback
                            {feedbacks.length > 0 && (
                                <span className="ml-2 font-medium">
                                    <span className="text-blue-600">({feedbacks.length} total)</span>
                                    {user.role === 'super_admin' && (
                                        <>
                                            <span className="text-gray-400 mx-1">|</span>
                                            <span className="text-green-600">{realCount} real</span>
                                            <span className="text-gray-400 mx-1">•</span>
                                            <span className="text-orange-600">{sampleCount} sample</span>
                                        </>
                                    )}
                                </span>
                            )}
                        </p>
                    </div>

                    {(user.role === 'super_admin' || (user.role === 'admin' && user.department === 'global')) && (
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                            <Filter size={16} className="text-gray-500" />
                            <select
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                                className="text-sm font-medium text-gray-700 bg-transparent outline-none cursor-pointer"
                            >
                                <option value="global">All Departments</option>
                                {departments.filter(d => d !== 'global').map(d => (
                                    <option key={d} value={d}>{getDepartmentName(d)}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Date Filter */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Filter by Date:</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => setDateFilter('all')}
                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                    dateFilter === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                All Time
                            </button>
                            <button
                                onClick={() => setDateFilter('today')}
                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                    dateFilter === 'today'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Today
                            </button>
                            <button
                                onClick={() => setDateFilter('week')}
                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                    dateFilter === 'week'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                This Week
                            </button>
                            <button
                                onClick={() => setDateFilter('month')}
                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                    dateFilter === 'month'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                This Month
                            </button>
                            <button
                                onClick={() => setDateFilter('year')}
                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                    dateFilter === 'year'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                This Year
                            </button>
                            <button
                                onClick={() => setDateFilter('custom')}
                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                    dateFilter === 'custom'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Custom Range
                            </button>
                        </div>
                    </div>

                    {/* Custom Date Range Inputs */}
                    {dateFilter === 'custom' && (
                        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600">From:</label>
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600">To:</label>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Data Type Filter (Sample vs Real) - Super Admin Only */}
                {user.role === 'super_admin' && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Filter size={16} className="text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Filter by Type:</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => setDataTypeFilter('all')}
                                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                        dataTypeFilter === 'all'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    All Data
                                </button>
                                <button
                                    onClick={() => setDataTypeFilter('real')}
                                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                        dataTypeFilter === 'real'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Real Feedback Only
                                </button>
                                <button
                                    onClick={() => setDataTypeFilter('sample')}
                                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                        dataTypeFilter === 'sample'
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Sample Data Only
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading feedback...</div>
            ) : feedbacks.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <p className="text-gray-400">No feedback found for this selection.</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table View (hidden on mobile) */}
                    <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                    <tr className="text-gray-600">
                                        <th className="px-6 py-4 font-semibold w-10"></th>
                                        <th className="px-6 py-4 font-semibold">Date</th>
                                        <th className="px-6 py-4 font-semibold">Department</th>
                                        <th className="px-6 py-4 font-semibold text-center">Score</th>
                                        <th className="px-6 py-4 font-semibold">Feedback Summary</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedFeedbacks.map((item) => {
                                        let s = 0, c = 0;
                                        if (item.answers) {
                                            Object.values(item.answers).forEach(v => {
                                                const n = Number(v);
                                                if (!isNaN(n) && n >= 1 && n <= 5) { s += n; c++; }
                                            });
                                        }
                                        const score = c > 0 ? (s / c).toFixed(1) : 'N/A';

                                        return (
                                            <React.Fragment key={item._id}>
                                                <tr
                                                    className={`hover:bg-gray-50/80 transition-colors cursor-pointer ${expandedId === item._id ? 'bg-blue-50/30' : ''}`}
                                                    onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className={`transform transition-transform duration-200 ${expandedId === item._id ? 'rotate-90 text-blue-600' : 'text-gray-300'}`}>
                                                            ▶
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="capitalize text-gray-800 font-medium">
                                                                {item.department.replace('_', ' ')}
                                                            </span>
                                                            {item.isSample && (
                                                                <span className="px-2 py-0.5 text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-300 rounded uppercase">
                                                                    Sample
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <span className={`text-lg font-bold ${Number(score) < 3 ? 'text-red-500' : Number(score) < 4 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                                {score}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Score / 5</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 max-w-sm">
                                                        <div className="flex flex-col">
                                                            <span className="truncate italic text-gray-800">
                                                                "{item.feedback.length > 60 ? item.feedback.substring(0, 60) + '...' : item.feedback}"
                                                            </span>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase font-bold">{item.category || 'General'}</span>
                                                                <span className="text-[10px] text-gray-400 font-medium">{item.name || 'Anonymous'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {expandedId === item._id && (
                                                    <tr className="bg-gray-50/50">
                                                        <td colSpan="5" className="px-6 md:px-12 py-6 border-l-4 border-blue-500 shadow-inner">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-fade-in">
                                                                <div className="col-span-full mb-2">
                                                                    <h4 className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 border-b pb-2 flex flex-col sm:flex-row justify-between gap-2">
                                                                        <span>Full Survey Responses</span>
                                                                        <span className="text-gray-400 text-xs font-normal">ID: {item._id}</span>
                                                                    </h4>
                                                                </div>
                                                                {Object.entries(item.answers || {}).map(([key, val], idx) => {
                                                                    if (key === 'suggestion') return null;
                                                                    const numVal = Number(val);
                                                                    const isRating = !isNaN(numVal) && numVal >= 1 && numVal <= 5;

                                                                    return (
                                                                        <div key={idx} className="flex flex-col bg-white p-3 rounded-lg border border-gray-100 shadow-sm transition-all hover:border-blue-200">
                                                                            <span className="text-[10px] font-bold text-gray-400 uppercase mb-1 truncate" title={key.replace(/_/g, ' ')}>
                                                                                {key.replace(/_/g, ' ')}
                                                                            </span>
                                                                            {isRating ? (
                                                                                <div className="flex justify-between items-center">
                                                                                    <div className="flex gap-1">
                                                                                        {[1, 2, 3, 4, 5].map(star => (
                                                                                            <div key={star} className={`w-2.5 h-2.5 rounded-full ${star <= numVal ? 'bg-pagoda-gold shadow-sm' : 'bg-gray-100'}`}></div>
                                                                                        ))}
                                                                                    </div>
                                                                                    <span className={`text-sm font-bold ${numVal < 3 ? 'text-red-600' : numVal < 4 ? 'text-yellow-600' : 'text-green-600'}`}>{numVal}/5</span>
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-sm text-gray-700 italic border-l-2 border-gray-100 pl-2">"{val}"</span>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                                <div className="col-span-full mt-4 p-4 md:p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Feedback</h4>
                                                                        {user.role === 'super_admin' && item.isSample && (
                                                                            <button
                                                                                onClick={(e) => handleDeleteFeedback(item._id, e)}
                                                                                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-md transition-colors font-medium"
                                                                                title="Delete this sample entry"
                                                                            >
                                                                                <Trash2 size={12} />
                                                                                Delete Sample
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm md:text-base">"{item.feedback}"</p>
                                                                    <div className="mt-4 pt-4 border-t border-gray-50 flex flex-col sm:flex-row flex-wrap gap-2 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                                                        <span>👤 {item.name || 'Anonymous'}</span>
                                                                        <span className="hidden sm:inline">•</span>
                                                                        <span>📧 {item.email || 'No Email'}</span>
                                                                        <span className="hidden sm:inline">•</span>
                                                                        <span>📱 {item.contact || 'No Contact'}</span>
                                                                        <span className="hidden sm:inline">•</span>
                                                                        <span>📍 {item.location || 'No Location'}</span>
                                                                        <span className="hidden sm:inline">•</span>
                                                                        <span>🕒 {new Date(item.createdAt).toLocaleString()}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={feedbacks.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={handlePageChange}
                        />
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {paginatedFeedbacks.map((item) => {
                            let s = 0, c = 0;
                            if (item.answers) {
                                Object.values(item.answers).forEach(v => {
                                    const n = Number(v);
                                    if (!isNaN(n) && n >= 1 && n <= 5) { s += n; c++; }
                                });
                            }
                            const score = c > 0 ? (s / c).toFixed(1) : 'N/A';
                            const isExpanded = expandedId === item._id;

                            return (
                                <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div
                                        className="p-4 cursor-pointer active:bg-gray-50 transition-colors"
                                        onClick={() => setExpandedId(isExpanded ? null : item._id)}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-2xl font-bold ${Number(score) < 3 ? 'text-red-500' : Number(score) < 4 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                        {score}
                                                    </span>
                                                    <span className="text-xs text-gray-400">/5</span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                    <span className="capitalize font-medium">{item.department.replace('_', ' ')}</span>
                                                    {item.isSample && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-orange-100 text-orange-700 border border-orange-300 rounded uppercase">
                                                                Sample
                                                            </span>
                                                        </>
                                                    )}
                                                    <span>•</span>
                                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className={`transform transition-transform duration-200 text-blue-600 ${isExpanded ? 'rotate-180' : ''}`}>
                                                ▼
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-700 italic line-clamp-2">
                                            "{item.feedback}"
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase font-bold">
                                                {item.category || 'General'}
                                            </span>
                                            <span className="text-[10px] text-gray-400">{item.name || 'Anonymous'}</span>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="border-t border-gray-100 p-4 bg-gray-50/50 space-y-4 animate-fade-in">
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Survey Responses</h4>
                                                <div className="space-y-2">
                                                    {Object.entries(item.answers || {}).map(([key, val], idx) => {
                                                        if (key === 'suggestion') return null;
                                                        const numVal = Number(val);
                                                        const isRating = !isNaN(numVal) && numVal >= 1 && numVal <= 5;

                                                        return (
                                                            <div key={idx} className="bg-white p-3 rounded-lg border border-gray-100">
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                                                                    {key.replace(/_/g, ' ')}
                                                                </p>
                                                                {isRating ? (
                                                                    <div className="flex justify-between items-center">
                                                                        <div className="flex gap-1.5">
                                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                                <div key={star} className={`w-3 h-3 rounded-full ${star <= numVal ? 'bg-pagoda-gold' : 'bg-gray-200'}`}></div>
                                                                            ))}
                                                                        </div>
                                                                        <span className={`text-sm font-bold ${numVal < 3 ? 'text-red-600' : numVal < 4 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                                            {numVal}/5
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-sm text-gray-700 italic">"{val}"</p>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div className="bg-white p-4 rounded-lg border border-gray-100">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase">Full Feedback</h4>
                                                    {user.role === 'super_admin' && item.isSample && (
                                                        <button
                                                            onClick={(e) => handleDeleteFeedback(item._id, e)}
                                                            className="flex items-center gap-1 px-2 py-1 text-[10px] bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded transition-colors font-medium"
                                                            title="Delete this sample entry"
                                                        >
                                                            <Trash2 size={10} />
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">"{item.feedback}"</p>
                                                <div className="mt-4 pt-3 border-t border-gray-100 space-y-1 text-[10px] text-gray-400 uppercase">
                                                    <p>👤 {item.name || 'Anonymous'}</p>
                                                    <p>📧 {item.email || 'No Email'}</p>
                                                    <p>📱 {item.contact || 'No Contact'}</p>
                                                    <p>📍 {item.location || 'No Location'}</p>
                                                    <p>🕒 {new Date(item.createdAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <div className="mt-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={feedbacks.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
