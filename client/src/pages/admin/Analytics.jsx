import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Filter, TrendingUp, Users, Star, AlertCircle, ThumbsUp } from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

import { API_BASE_URL } from '../../config';

const COLORS = ['#10B981', '#F59E0B', '#EF4444'];
const DEPT_COLORS = ['#C4A484', '#8D6E63', '#A1887F', '#D7CCC8', '#795548', '#5D4037'];

const Analytics = () => {
    const { user, token } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDept, setSelectedDept] = useState('global');

    const departments = ['global_pagoda', 'food_court', 'souvenir_shop', 'dhamma_alaya', 'dpvc', 'global'];

    useEffect(() => {
        fetchAnalytics();
    }, [selectedDept]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            let url = `${API_BASE_URL}/api/admin/analytics`;
            if ((user.role === 'super_admin' || (user.role === 'admin' && user.department === 'global')) && selectedDept !== 'global') {
                url += `?department=${selectedDept}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-pagoda-gold animate-pulse">Loading analytics...</div>;

    const sentimentData = [
        { name: 'Positive', value: stats?.sentimentCounts?.Positive || 0 },
        { name: 'Neutral', value: stats?.sentimentCounts?.Neutral || 0 },
        { name: 'Negative', value: stats?.sentimentCounts?.Negative || 0 },
    ];

    const departmentData = stats?.departmentCounts ? Object.entries(stats.departmentCounts).map(([key, value]) => ({
        name: key.replace(/_/g, ' ').toUpperCase(),
        value
    })) : [];

    // Filter top 5 low scoring questions for "Pain Points"
    const painPoints = stats?.questionPerformance ? stats.questionPerformance.slice(0, 5) : [];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Analytics Overview</h2>
                    <p className="text-gray-500 text-sm mt-1">Deep dive into performance metrics and satisfaction</p>
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
                                <option key={d} value={d} className="capitalize">{d.replace('_', ' ')}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 md:p-6 rounded-2xl shadow-sm border border-blue-100 flex flex-col justify-between">
                    <div>
                        <p className="text-xs md:text-sm text-blue-700 font-medium mb-1">Total Submissions</p>
                        <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
                    </div>
                    <div className="mt-3 md:mt-4 flex items-center text-xs text-blue-600">
                        <Users size={14} className="mr-1" />
                        <span>All time entries</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-5 md:p-6 rounded-2xl shadow-sm border border-yellow-100 flex flex-col justify-between">
                    <div>
                        <p className="text-xs md:text-sm text-yellow-700 font-medium mb-1">Average Rating</p>
                        <p className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                            {stats?.averageRating || 0}<span className="text-sm text-gray-400 font-normal ml-1">/ 5</span>
                        </p>
                    </div>
                    <div className="mt-3 md:mt-4 flex items-center text-xs text-yellow-600">
                        <Star size={14} className="mr-1 fill-yellow-500" />
                        <span>Overall Experience</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 md:p-6 rounded-2xl shadow-sm border border-green-100 flex flex-col justify-between">
                    <div>
                        <p className="text-xs md:text-sm text-green-700 font-medium mb-1">Satisfaction Score</p>
                        <div className="flex items-end gap-2">
                            <p className={`text-2xl md:text-3xl font-bold ${Number(stats?.satisfactionScore) >= 80 ? 'text-green-600' : Number(stats?.satisfactionScore) >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {stats?.satisfactionScore || 0}
                            </p>
                            <span className="text-xs text-gray-400 mb-1">/ 100</span>
                        </div>
                    </div>
                    <div className="mt-3 md:mt-4 flex items-center text-xs text-green-600">
                        <ThumbsUp size={14} className="mr-1" />
                        <span>Global Average</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-5 md:p-6 rounded-2xl shadow-sm border border-red-100 flex flex-col justify-between">
                    <div>
                        <p className="text-xs md:text-sm text-red-700 font-medium mb-1">Negative Feedback</p>
                        <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats?.sentimentCounts?.Negative || 0}</p>
                    </div>
                    <div className="w-full bg-red-100 h-2 rounded-full mt-3 md:mt-4 overflow-hidden">
                        <div
                            className="bg-red-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${stats?.total ? (stats.sentimentCounts.Negative / stats.total) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Pain Points & Category Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                {/* Category Performance */}
                <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4 md:mb-6 flex items-center">
                        <Star className="mr-2 text-pagoda-gold" size={18} />
                        Performance by Category
                    </h3>
                    <div className="h-64 md:h-72 lg:h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={stats?.categoryPerformance || []}
                                layout="vertical"
                                margin={{ left: 10, right: 10, top: 5, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" domain={[0, 5]} hide />
                                <YAxis
                                    dataKey="category"
                                    type="category"
                                    width={80}
                                    tick={{ fontSize: 11, fill: '#4B5563', fontWeight: 500 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F9FAFB' }}
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        fontSize: '12px'
                                    }}
                                />
                                <Bar dataKey="average" radius={[0, 4, 4, 0]} barSize={20}>
                                    {stats?.categoryPerformance?.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.average < 3 ? '#EF4444' : entry.average < 4 ? '#F59E0B' : '#10B981'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Pain Points */}
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-base md:text-lg font-bold text-red-700 mb-3 md:mb-4 flex items-center">
                        <AlertCircle className="mr-2" size={18} />
                        Improvement Areas
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">Lowest scoring questions</p>

                    <div className="space-y-3 md:space-y-4">
                        {painPoints.length === 0 ? (
                            <div className="text-sm text-gray-400 italic text-center py-8">No sufficient data.</div>
                        ) : (
                            painPoints.map((p, i) => (
                                <div key={i} className="flex flex-col bg-gray-50 p-3 rounded-lg">
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <span className="text-xs font-medium text-gray-700 capitalize flex-1 leading-tight">
                                            {p.questionId.replace(/_/g, ' ')}
                                        </span>
                                        <span className={`text-xs font-bold whitespace-nowrap ${Number(p.average) < 3 ? 'text-red-600' : 'text-yellow-600'}`}>
                                            {p.average}/5
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${Number(p.average) < 3 ? 'bg-red-500' : 'bg-yellow-500'}`}
                                            style={{ width: `${(p.average / 5) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Charts Row Removed as per feedback */}

            {/* Department Breakdown Removed as per feedback */}
        </div>
    );
};

export default Analytics;
