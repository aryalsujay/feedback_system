import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Clock, Save, RefreshCw, CheckCircle, AlertCircle, Send, Database, Mail,
    Settings as SettingsIcon, Download, Upload, Trash2, Play, Activity,
    Mail as MailIcon, Users, HardDrive, Cpu, Server, Edit, Key, UserPlus
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

const SettingsEnhanced = () => {
    const { user, token } = useAuth();
    const [activeTab, setActiveTab] = useState('schedule');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Report Schedule State
    const [settings, setSettings] = useState({
        dayOfWeek: 0,
        hour: 9,
        minute: 0,
        enabled: true
    });

    // Email Configuration State
    const [emailConfig, setEmailConfig] = useState({});
    const [editingDept, setEditingDept] = useState(null);

    // Backup State
    const [backups, setBackups] = useState([]);
    const [backupLoading, setBackupLoading] = useState(false);

    // Custom Report State
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [selectedRecipients, setSelectedRecipients] = useState([]);
    const [customReportLoading, setCustomReportLoading] = useState(false);

    // System Stats State
    const [systemStats, setSystemStats] = useState(null);

    // Deploy State
    const [deployLoading, setDeployLoading] = useState(false);

    // Sample Data State
    const [sampleDataDepts, setSampleDataDepts] = useState([]);
    const [sampleDataLoading, setSampleDataLoading] = useState(false);

    // User Management State
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [passwordChange, setPasswordChange] = useState({ userId: null, newPassword: '' });

    // Feedback Login Management State
    const [feedbackLogins, setFeedbackLogins] = useState([]);
    const [feedbackLoginsLoading, setFeedbackLoginsLoading] = useState(false);
    const [feedbackPasswordChange, setFeedbackPasswordChange] = useState({ loginId: null, newPassword: '' });

    const allDepartments = [
        { value: 'global_pagoda', label: 'GVP - Public Relations' },
        { value: 'food_court', label: 'Food Court' },
        { value: 'souvenir_shop', label: 'Souvenir Shop' },
        { value: 'dhamma_alaya', label: 'Dhammalaya' },
        { value: 'dpvc', label: 'DPVC' }
    ];

    const daysOfWeek = [
        { value: 0, label: 'Sunday' },
        { value: 1, label: 'Monday' },
        { value: 2, label: 'Tuesday' },
        { value: 3, label: 'Wednesday' },
        { value: 4, label: 'Thursday' },
        { value: 5, label: 'Friday' },
        { value: 6, label: 'Saturday' }
    ];

    useEffect(() => {
        if (token) {
            fetchSettings();
            if (user.role === 'super_admin') {
                fetchEmailConfig();
                fetchBackups();
                fetchSystemStats();
                fetchUsers();
                fetchFeedbackLogins();
            }
        }
    }, [token, user.role]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/admin/report-settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmailConfig = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/email-config`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setEmailConfig(data.config);
            }
        } catch (error) {
            console.error('Error fetching email config:', error);
        }
    };

    const fetchBackups = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/backups`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setBackups(data.backups);
            }
        } catch (error) {
            console.error('Error fetching backups:', error);
        }
    };

    const fetchSystemStats = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/system-stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSystemStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching system stats:', error);
        }
    };

    const handleSaveSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/admin/report-settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Settings saved successfully!' });
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEmailConfig = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/admin/email-config`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ config: emailConfig })
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Email configuration saved successfully!' });
                setEditingDept(null);
            } else {
                throw new Error('Failed to save email configuration');
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleAddEmail = (dept) => {
        const email = prompt('Enter email address:');
        if (email && /\S+@\S+\.\S+/.test(email)) {
            setEmailConfig({
                ...emailConfig,
                [dept]: [...(emailConfig[dept] || []), email]
            });
        } else if (email) {
            alert('Invalid email address');
        }
    };

    const handleRemoveEmail = (dept, email) => {
        if (confirm(`Remove ${email} from ${dept}?`)) {
            setEmailConfig({
                ...emailConfig,
                [dept]: emailConfig[dept].filter(e => e !== email)
            });
        }
    };

    const handleCreateBackup = async () => {
        try {
            setBackupLoading(true);
            setMessage({ type: 'info', text: 'Creating backup...' });
            const response = await fetch(`${API_BASE_URL}/api/admin/backup-database`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setMessage({ type: 'success', text: `Backup created: ${data.filename}` });
                fetchBackups();
            } else {
                throw new Error('Failed to create backup');
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setBackupLoading(false);
        }
    };

    const handleDownloadBackup = (filename) => {
        window.open(`${API_BASE_URL}/api/admin/download-backup/${filename}?token=${token}`, '_blank');
    };

    const handleRestoreBackup = async (filename) => {
        if (!confirm(`Restore from ${filename}? This will overwrite current data and restart the server.`)) {
            return;
        }

        try {
            setBackupLoading(true);
            setMessage({ type: 'info', text: 'Restoring backup...' });
            const response = await fetch(`${API_BASE_URL}/api/admin/restore-backup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ filename })
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Restore complete! Server restarting...' });
                setTimeout(() => window.location.reload(), 3000);
            } else {
                throw new Error('Failed to restore backup');
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
            setBackupLoading(false);
        }
    };

    const handleDeleteBackup = async (filename) => {
        if (!confirm(`Delete backup ${filename}?`)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/backups/${filename}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Backup deleted successfully' });
                fetchBackups();
            } else {
                throw new Error('Failed to delete backup');
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        }
    };

    const handleDeploy = async () => {
        if (!confirm('Run deployment? This will rebuild the app and restart the server.')) {
            return;
        }

        try {
            setDeployLoading(true);
            setMessage({ type: 'info', text: 'Deployment started...' });
            const response = await fetch(`${API_BASE_URL}/api/admin/deploy`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Deployment started! Server will restart soon.' });
                setTimeout(() => window.location.reload(), 15000);
            } else {
                throw new Error('Failed to start deployment');
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
            setDeployLoading(false);
        }
    };

    const handleSendCustomReport = async () => {
        if (selectedDepartments.length === 0) {
            setMessage({ type: 'error', text: 'Please select at least one department' });
            return;
        }
        if (selectedRecipients.length === 0) {
            setMessage({ type: 'error', text: 'Please select at least one recipient' });
            return;
        }

        try {
            setCustomReportLoading(true);
            setMessage({ type: 'info', text: 'Sending reports...' });
            const response = await fetch(`${API_BASE_URL}/api/admin/send-custom-report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    departments: selectedDepartments,
                    recipients: selectedRecipients
                })
            });

            if (response.ok) {
                const data = await response.json();
                setMessage({ type: 'success', text: data.message });
                setSelectedDepartments([]);
                setSelectedRecipients([]);
            } else {
                throw new Error('Failed to send reports');
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setCustomReportLoading(false);
        }
    };

    const handleExportCSV = (department) => {
        window.open(`${API_BASE_URL}/api/admin/export-csv/${department}?token=${token}`, '_blank');
    };

    const handleCreateSampleData = async () => {
        if (sampleDataDepts.length === 0) {
            setMessage({ type: 'error', text: 'Please select at least one department' });
            return;
        }

        try {
            setSampleDataLoading(true);
            setMessage({ type: 'info', text: 'Creating sample data...' });
            const response = await fetch(`${API_BASE_URL}/api/admin/create-sample-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ departments: sampleDataDepts })
            });

            if (response.ok) {
                const data = await response.json();
                setMessage({ type: 'success', text: data.message });
                setSampleDataDepts([]);
                fetchSystemStats(); // Refresh stats
            } else {
                throw new Error('Failed to create sample data');
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSampleDataLoading(false);
        }
    };

    const handleClearFeedback = async () => {
        if (!confirm('Are you sure you want to delete ALL feedback data? This action cannot be undone!')) {
            return;
        }

        try {
            setLoading(true);
            setMessage({ type: 'info', text: 'Clearing feedback data...' });
            const response = await fetch(`${API_BASE_URL}/api/admin/clear-all-feedback`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setMessage({ type: 'success', text: data.message });
                fetchSystemStats(); // Refresh stats
            } else {
                throw new Error('Failed to clear feedback');
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatUptime = (seconds) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    };

    // User Management Functions
    const fetchUsers = async () => {
        try {
            setUsersLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setMessage({ type: 'error', text: 'Failed to fetch users' });
        } finally {
            setUsersLoading(false);
        }
    };

    const handleChangePassword = async (userId) => {
        if (!passwordChange.newPassword || passwordChange.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password: passwordChange.newPassword })
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Password updated successfully' });
                setPasswordChange({ userId: null, newPassword: '' });
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update password');
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'User deleted successfully' });
                fetchUsers();
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete user');
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    // Feedback Login Management Functions
    const fetchFeedbackLogins = async () => {
        try {
            setFeedbackLoginsLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/admin/feedback-logins`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setFeedbackLogins(data);
            }
        } catch (error) {
            console.error('Error fetching feedback logins:', error);
            setMessage({ type: 'error', text: 'Failed to fetch feedback logins' });
        } finally {
            setFeedbackLoginsLoading(false);
        }
    };

    const handleChangeFeedbackPassword = async (loginId) => {
        if (!feedbackPasswordChange.newPassword || feedbackPasswordChange.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/admin/feedback-logins/${loginId}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password: feedbackPasswordChange.newPassword })
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Feedback login password updated successfully' });
                setFeedbackPasswordChange({ loginId: null, newPassword: '' });
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update password');
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'schedule', label: 'Report Schedule', icon: Clock },
        { id: 'emails', label: 'Email Config', icon: MailIcon },
        { id: 'users', label: 'Admin Panel Users', icon: Users },
        { id: 'feedback-logins', label: 'Feedback Form Logins', icon: Key },
        { id: 'backup', label: 'Backup & Restore', icon: Database },
        { id: 'deploy', label: 'Deploy', icon: Play },
        { id: 'custom-reports', label: 'Custom Reports', icon: Send },
        { id: 'data', label: 'Data Management', icon: Database },
        { id: 'performance', label: 'Performance', icon: Activity }
    ];

    // Restrict access to super admin only
    if (user?.role !== 'super_admin') {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <AlertCircle size={64} className="text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
                    <p className="text-red-800 mb-6">
                        You do not have permission to access this page. Only Super Admins can access system settings.
                    </p>
                    <p className="text-sm text-red-700">
                        If you need to change your password, please use the "Change Password" tab.
                    </p>
                </div>
            </div>
        );
    }

    if (loading && !systemStats) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
                <p className="text-gray-600">Configure system settings and manage the feedback system (Super Admin Only)</p>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                    message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
                    message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
                    'bg-blue-50 border border-blue-200 text-blue-800'
                }`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <p className="flex-1">{message.text}</p>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold mb-4">Weekly Report Schedule</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <h3 className="font-medium text-gray-900">Enable Weekly Reports</h3>
                                <p className="text-sm text-gray-600 mt-1">Turn on or off automatic weekly report delivery</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.enabled}
                                    onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
                            <select
                                value={settings.dayOfWeek}
                                onChange={(e) => setSettings({ ...settings, dayOfWeek: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                disabled={!settings.enabled}
                            >
                                {daysOfWeek.map(day => (
                                    <option key={day.value} value={day.value}>{day.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Hour (24-hour)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={settings.hour}
                                    onChange={(e) => setSettings({ ...settings, hour: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    disabled={!settings.enabled}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Minute</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={settings.minute}
                                    onChange={(e) => setSettings({ ...settings, minute: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    disabled={!settings.enabled}
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="font-medium text-blue-900 mb-2">Schedule Preview</h3>
                            <p className="text-sm text-blue-800">
                                {settings.enabled ? (
                                    <>Reports will be sent every <strong>{daysOfWeek[settings.dayOfWeek].label}</strong> at{' '}
                                    <strong>{String(settings.hour).padStart(2, '0')}:{String(settings.minute).padStart(2, '0')}</strong> IST</>
                                ) : 'Weekly reports are currently disabled'}
                            </p>
                        </div>

                        <button
                            onClick={handleSaveSettings}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            <Save size={18} />
                            Save Settings
                        </button>
                    </div>
                </div>
            )}

            {/* Email Config Tab */}
            {activeTab === 'emails' && user.role === 'super_admin' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Email Configuration</h2>
                        <button
                            onClick={handleSaveEmailConfig}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Save size={18} />
                            Save Changes
                        </button>
                    </div>
                    <div className="space-y-4">
                        {Object.entries(emailConfig).map(([dept, emails]) => (
                            <div key={dept} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-medium text-gray-900 capitalize">{dept.replace('_', ' ')}</h3>
                                    <button
                                        onClick={() => handleAddEmail(dept)}
                                        className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                    >
                                        + Add Email
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {emails && emails.map((email, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <span className="text-sm text-gray-700">{email}</span>
                                            <button
                                                onClick={() => handleRemoveEmail(dept, email)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {(!emails || emails.length === 0) && (
                                        <p className="text-sm text-gray-500 italic">No emails configured</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* User Management Tab */}
            {activeTab === 'users' && user.role === 'super_admin' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Users className="text-blue-600" size={24} />
                            User Management
                        </h2>
                    </div>

                    {usersLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {users.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No users found</p>
                            ) : (
                                users.map((usr) => (
                                    <div key={usr._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-lg text-gray-900">{usr.username}</h3>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        usr.role === 'super_admin'
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {usr.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                                    </span>
                                                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                                                        {usr.department}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    Created: {new Date(usr.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Change Password */}
                                                <button
                                                    onClick={() => setPasswordChange({ userId: usr._id, newPassword: '' })}
                                                    className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                                                    title="Change Password"
                                                >
                                                    <Key size={16} />
                                                    <span className="text-sm">Change Password</span>
                                                </button>

                                                {/* Delete User (Cannot delete self) */}
                                                {usr._id !== user.id && (
                                                    <button
                                                        onClick={() => handleDeleteUser(usr._id, usr.username)}
                                                        className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                                        title="Delete User"
                                                        disabled={loading}
                                                    >
                                                        <Trash2 size={16} />
                                                        <span className="text-sm">Delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Password Change Form */}
                                        {passwordChange.userId === usr._id && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <div className="flex items-end gap-3">
                                                    <div className="flex-1">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            New Password (min 6 characters)
                                                        </label>
                                                        <input
                                                            type="password"
                                                            value={passwordChange.newPassword}
                                                            onChange={(e) => setPasswordChange({ ...passwordChange, newPassword: e.target.value })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="Enter new password"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => handleChangePassword(usr._id)}
                                                        disabled={loading || !passwordChange.newPassword}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                    >
                                                        <Save size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => setPasswordChange({ userId: null, newPassword: '' })}
                                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Feedback Login Management Tab */}
            {activeTab === 'feedback-logins' && user.role === 'super_admin' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Key className="text-green-600" size={24} />
                            Feedback Form Login Management
                        </h2>
                    </div>

                    <p className="text-sm text-gray-600 mb-6">
                        Manage passwords for department feedback form logins (stored in config/feedback_login.json)
                    </p>

                    {feedbackLoginsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {feedbackLogins.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No feedback logins found</p>
                            ) : (
                                feedbackLogins.map((login) => (
                                    <div key={login.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-lg text-gray-900">{login.username}</h3>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        login.isAdmin
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {login.isAdmin ? 'Feedback Admin' : 'Department'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">{login.name}</p>
                                                <p className="text-xs text-gray-400 mt-1">ID: {login.id}</p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setFeedbackPasswordChange({ loginId: login.id, newPassword: '' })}
                                                    className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                                    title="Change Password"
                                                >
                                                    <Key size={16} />
                                                    <span className="text-sm">Change Password</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Password Change Form */}
                                        {feedbackPasswordChange.loginId === login.id && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <div className="flex items-end gap-3">
                                                    <div className="flex-1">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            New Password (min 6 characters)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={feedbackPasswordChange.newPassword}
                                                            onChange={(e) => setFeedbackPasswordChange({ ...feedbackPasswordChange, newPassword: e.target.value })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                            placeholder="Enter new password"
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Note: Passwords are stored in plain text in config/feedback_login.json
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleChangeFeedbackPassword(login.id)}
                                                        disabled={loading || !feedbackPasswordChange.newPassword}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                    >
                                                        <Save size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => setFeedbackPasswordChange({ loginId: null, newPassword: '' })}
                                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            <strong>Important:</strong> These are the login credentials for the department feedback forms (not the admin panel).
                            Changes here will update the config/feedback_login.json file.
                        </p>
                    </div>
                </div>
            )}

            {/* Backup & Restore Tab */}
            {activeTab === 'backup' && user.role === 'super_admin' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Database Backup</h2>
                            <button
                                onClick={handleCreateBackup}
                                disabled={backupLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                            >
                                <Database size={18} />
                                Create Backup
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Create and manage database backups. Backups include all feedback data and configuration files.</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold mb-4">Available Backups</h2>
                        {backups.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No backups available</p>
                        ) : (
                            <div className="space-y-2">
                                {backups.map(backup => (
                                    <div key={backup.filename} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{backup.filename}</p>
                                            <p className="text-sm text-gray-600">
                                                {formatBytes(backup.size)} • {new Date(backup.created).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDownloadBackup(backup.filename)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                title="Download"
                                            >
                                                <Download size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleRestoreBackup(backup.filename)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded"
                                                title="Restore"
                                            >
                                                <Upload size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBackup(backup.filename)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Deploy Tab */}
            {activeTab === 'deploy' && user.role === 'super_admin' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold mb-4">Deploy Application</h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h3 className="font-medium text-yellow-900 mb-2">⚠️ Warning</h3>
                            <p className="text-sm text-yellow-800">
                                Deployment will rebuild the client application and restart the server. This may cause a brief downtime (10-15 seconds).
                            </p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-2">Deployment Process:</h3>
                            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                                <li>Stop any manual processes on port 5001</li>
                                <li>Install/update dependencies if needed</li>
                                <li>Build client application</li>
                                <li>Restart systemd service</li>
                                <li>Verify deployment</li>
                            </ul>
                        </div>

                        <button
                            onClick={handleDeploy}
                            disabled={deployLoading}
                            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 font-medium"
                        >
                            {deployLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Deploying...
                                </>
                            ) : (
                                <>
                                    <Play size={18} />
                                    Run Deployment
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Custom Reports Tab */}
            {activeTab === 'custom-reports' && user.role === 'super_admin' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold mb-4">Send Custom Reports</h2>
                    <p className="text-sm text-gray-600 mb-4">Select specific departments and recipients to send reports to.</p>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-medium text-gray-900">Select Departments</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedDepartments(allDepartments.map(d => d.value))}
                                        className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    >
                                        Select All
                                    </button>
                                    <button
                                        onClick={() => setSelectedDepartments([])}
                                        className="text-xs px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {allDepartments.map(dept => (
                                    <label key={dept.value} className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-blue-50 border-2 border-transparent hover:border-blue-300 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={selectedDepartments.includes(dept.value)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedDepartments([...selectedDepartments, dept.value]);
                                                } else {
                                                    setSelectedDepartments(selectedDepartments.filter(d => d !== dept.value));
                                                }
                                            }}
                                            className="w-5 h-5 text-blue-600 rounded"
                                        />
                                        <span className="text-sm font-medium text-gray-700">{dept.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-medium text-gray-900">Select Recipients</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            const allEmails = Object.values(emailConfig).flat().filter(e => e);
                                            setSelectedRecipients(allEmails);
                                        }}
                                        className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                    >
                                        Select All
                                    </button>
                                    <button
                                        onClick={() => setSelectedRecipients([])}
                                        className="text-xs px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {Object.entries(emailConfig).map(([dept, emails]) => (
                                    <div key={dept} className="bg-white p-3 rounded-lg">
                                        <p className="text-sm font-semibold text-gray-800 mb-2 capitalize border-b border-gray-200 pb-2">{dept.replace('_', ' ')}</p>
                                        <div className="grid grid-cols-1 gap-2 ml-2">
                                            {emails && emails.map((email, idx) => (
                                                <label key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded cursor-pointer hover:bg-green-50 border-2 border-transparent hover:border-green-300 transition-all">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRecipients.includes(email)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedRecipients([...selectedRecipients, email]);
                                                            } else {
                                                                setSelectedRecipients(selectedRecipients.filter(r => r !== email));
                                                            }
                                                        }}
                                                        className="w-5 h-5 text-green-600 rounded"
                                                    />
                                                    <span className="text-sm text-gray-700 font-mono">{email}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Selected:</strong> {selectedDepartments.length} department(s), {selectedRecipients.length} recipient(s)
                            </p>
                        </div>

                        <button
                            onClick={handleSendCustomReport}
                            disabled={customReportLoading || selectedDepartments.length === 0 || selectedRecipients.length === 0}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                        >
                            {customReportLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Send Reports
                                </>
                            )}
                        </button>

                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-3">Export to CSV</h3>
                            <p className="text-sm text-gray-600 mb-3">Download feedback data as CSV for analysis</p>
                            <div className="grid grid-cols-2 gap-2">
                                {allDepartments.map(dept => (
                                    <button
                                        key={dept.value}
                                        onClick={() => handleExportCSV(dept.value)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                    >
                                        <Download size={16} />
                                        {dept.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Data Management Tab */}
            {activeTab === 'data' && user.role === 'super_admin' && (
                <div className="space-y-6">
                    {/* Sample Data */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold mb-4">Generate Sample Data</h2>
                        <p className="text-sm text-gray-600 mb-4">Create 5 sample feedback entries for testing purposes.</p>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                {allDepartments.map(dept => (
                                    <label key={dept.value} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                                        <input
                                            type="checkbox"
                                            checked={sampleDataDepts.includes(dept.value)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSampleDataDepts([...sampleDataDepts, dept.value]);
                                                } else {
                                                    setSampleDataDepts(sampleDataDepts.filter(d => d !== dept.value));
                                                }
                                            }}
                                            className="w-4 h-4 text-purple-600 rounded"
                                        />
                                        <span className="text-sm font-medium text-gray-700">{dept.label}</span>
                                    </label>
                                ))}
                            </div>

                            <button
                                onClick={handleCreateSampleData}
                                disabled={sampleDataLoading || sampleDataDepts.length === 0}
                                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-medium"
                            >
                                {sampleDataLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Database size={18} />
                                        Create 5 Sample Data {sampleDataDepts.length > 0 && `(${sampleDataDepts.length} dept)`}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Clear All Feedback */}
                    <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
                        <h2 className="text-xl font-semibold mb-4 text-red-600">Clear All Feedback Data</h2>
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                            <p className="text-sm text-red-800">
                                <strong>⚠️ Warning:</strong> This action will permanently delete ALL feedback data from the database. This cannot be undone!
                            </p>
                        </div>

                        <button
                            onClick={handleClearFeedback}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-medium"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Clearing...
                                </>
                            ) : (
                                <>
                                    <Trash2 size={18} />
                                    Clear All Feedback
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && user.role === 'super_admin' && systemStats && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">System Performance</h2>
                            <button
                                onClick={fetchSystemStats}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            >
                                <RefreshCw size={18} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Cpu className="text-blue-600" size={20} />
                                    <h3 className="font-medium text-gray-900">CPU</h3>
                                </div>
                                <p className="text-sm text-gray-600">{systemStats.cpu.model}</p>
                                <p className="text-sm text-gray-600">Cores: {systemStats.cpu.cores}</p>
                                <p className="text-sm text-gray-600">
                                    Load Average: {systemStats.cpu.usage[0].toFixed(2)}, {systemStats.cpu.usage[1].toFixed(2)}, {systemStats.cpu.usage[2].toFixed(2)}
                                </p>
                            </div>

                            <div className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <HardDrive className="text-green-600" size={20} />
                                    <h3 className="font-medium text-gray-900">Memory (RAM)</h3>
                                </div>
                                <p className="text-sm text-gray-600">Total: {formatBytes(systemStats.memory.total)}</p>
                                <p className="text-sm text-gray-600">Used: {formatBytes(systemStats.memory.used)}</p>
                                <p className="text-sm text-gray-600">Free: {formatBytes(systemStats.memory.free)}</p>
                                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full"
                                        style={{ width: `${systemStats.memory.usagePercent}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{systemStats.memory.usagePercent}% used</p>
                            </div>

                            {systemStats.disk && (
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <HardDrive className="text-yellow-600" size={20} />
                                        <h3 className="font-medium text-gray-900">Disk Space</h3>
                                    </div>
                                    <p className="text-sm text-gray-600">Total: {systemStats.disk.totalGB} GB</p>
                                    <p className="text-sm text-gray-600">Used: {systemStats.disk.usedGB} GB</p>
                                    <p className="text-sm text-gray-600">Free: {systemStats.disk.freeGB} GB</p>
                                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-yellow-600 h-2 rounded-full"
                                            style={{ width: `${systemStats.disk.usagePercent}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{systemStats.disk.usagePercent}% used</p>
                                </div>
                            )}

                            <div className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Database className="text-purple-600" size={20} />
                                    <h3 className="font-medium text-gray-900">Database</h3>
                                </div>
                                <p className="text-sm text-gray-600">Size: {systemStats.database.sizeMB} MB</p>
                                <p className="text-sm text-gray-600">Feedback Entries: {systemStats.feedbackCount}</p>
                            </div>

                            <div className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Server className="text-orange-600" size={20} />
                                    <h3 className="font-medium text-gray-900">System</h3>
                                </div>
                                <p className="text-sm text-gray-600">Platform: {systemStats.platform}</p>
                                <p className="text-sm text-gray-600">Node: {systemStats.nodeVersion}</p>
                                <p className="text-sm text-gray-600">Uptime: {formatUptime(systemStats.uptime)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold mb-4">Performance Tips</h2>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-green-600 mt-0.5" />
                                <span>Regular backups help maintain database health and provide recovery options</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-green-600 mt-0.5" />
                                <span>Monitor memory usage - if it exceeds 80%, consider restarting the server</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-green-600 mt-0.5" />
                                <span>Keep the database size under control by archiving old feedback periodically</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-green-600 mt-0.5" />
                                <span>Check logs regularly for any errors or warnings</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsEnhanced;
