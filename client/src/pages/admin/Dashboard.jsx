import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Filter, Calendar, AlertTriangle, XCircle } from 'lucide-react';

import { API_BASE_URL } from '../../config';

const Dashboard = () => {
    const { user, token } = useAuth();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDept, setSelectedDept] = useState('global');
    const [expandedId, setExpandedId] = useState(null);

    const departments = ['global_pagoda', 'food_court', 'souvenir_shop', 'dhamma_alaya', 'dpvc', 'global'];

    useEffect(() => {
        fetchFeedbacks();
    }, [selectedDept]);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            let url = `${API_BASE_URL}/api/admin/submissions`;
            if (user.role === 'super_admin' && selectedDept !== 'global') {
                url += `?department=${selectedDept}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            setFeedbacks(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Filter critical alerts removed as per feedback
    // const criticalAlerts = feedbacks.filter(f => f.sentiment === 'Negative').slice(0, 3);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Feedback Submissions</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage and view incoming feedback</p>
                </div>

                {user.role === 'super_admin' && (
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                        <Filter size={16} className="text-gray-500" />
                        <select
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className="text-sm font-medium text-gray-700 bg-transparent outline-none cursor-pointer"
                        >
                            <option value="global">All Departments</option>
                            {departments.filter(d => d !== 'global').map(d => (
                                <option key={d} value={d} className="capitalize">{d}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Critical Alerts Section Removed */}

            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading feedback...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                                {feedbacks.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                            No feedback found for this selection.
                                        </td>
                                    </tr>
                                ) : (
                                    feedbacks.map((item) => (
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
                                                <td className="px-6 py-4 capitalize text-gray-800 font-medium">
                                                    {item.department.replace('_', ' ')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {(() => {
                                                        let s = 0, c = 0;
                                                        if (item.answers) {
                                                            Object.values(item.answers).forEach(v => {
                                                                const n = Number(v);
                                                                if (!isNaN(n) && n >= 1 && n <= 5) { s += n; c++; }
                                                            });
                                                        }
                                                        const score = c > 0 ? (s / c).toFixed(1) : 'N/A';
                                                        return (
                                                            <div className="flex flex-col items-center justify-center">
                                                                <span className={`text-lg font-bold ${Number(score) < 3 ? 'text-red-500' : Number(score) < 4 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                                    {score}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Score / 5</span>
                                                            </div>
                                                        );
                                                    })()}
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
                                                    <td colSpan="5" className="px-12 py-6 border-l-4 border-blue-500 shadow-inner">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                                                            {/* Detailed Answers Breakdown */}
                                                            <div className="col-span-full mb-2">
                                                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 border-b pb-2 flex justify-between">
                                                                    <span>Full Survey Responses</span>
                                                                    <span className="text-gray-400 text-xs font-normal">Submission ID: {item._id}</span>
                                                                </h4>
                                                            </div>
                                                            {Object.entries(item.answers || {}).map(([key, val], idx) => {
                                                                if (key === 'suggestion') return null; // Already in feedback text
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
                                                            <div className="col-span-full mt-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                                <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-widest">Full Feedback Comment</h4>
                                                                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed font-serif text-lg">"{item.feedback}"</p>
                                                                <div className="mt-6 pt-4 border-t border-gray-50 flex flex-wrap gap-y-2 justify-between items-center text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                                                    <div className="flex gap-4">
                                                                        <span>👤 {item.name || 'Anonymous'}</span>
                                                                        <span>📧 {item.email || 'No Email'}</span>
                                                                    </div>
                                                                    <span>🕒 Recorded: {new Date(item.createdAt).toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
