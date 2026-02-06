import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Clock, Save, RefreshCw, CheckCircle, AlertCircle, Send, Database, Mail,
    Users, Settings as SettingsIcon, FileText, Trash2, Download, Upload,
    Play, RefreshCcw, Eye, EyeOff, Key, Shield
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import UserManagementFull from '../../components/admin/UserManagementFull';

const SettingsNew = () => {
    const { user, token } = useAuth();
    const [activeTab, setActiveTab] = useState('reports');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sendingReport, setSendingReport] = useState(false);
    const [creatingSampleData, setCreatingSampleData] = useState(false);
    const [sendingTestReport, setSendingTestReport] = useState(false);
    const [message, setMessage] = useState(null);
    const [sampleDataMessage, setSampleDataMessage] = useState(null);
    const [testReportMessage, setTestReportMessage] = useState(null);
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [testReportDepartments, setTestReportDepartments] = useState([]);
    const [settings, setSettings] = useState({
        dayOfWeek: 0,
        hour: 9,
        minute: 0,
        enabled: true
    });

    const allDepartments = [
        { value: 'global_pagoda', label: 'Global Pagoda' },
        { value: 'food_court', label: 'Food Court' },
        { value: 'souvenir_shop', label: 'Souvenir Shop' },
        { value: 'dhamma_alaya', label: 'Dhamma Alaya' },
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

    const tabs = user.role === 'super_admin' ? [
        { id: 'reports', label: 'Report Schedule', icon: Clock },
        { id: 'send', label: 'Send Reports', icon: Send },
        { id: 'sample', label: 'Sample Data', icon: Database },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'system', label: 'System', icon: SettingsIcon },
        { id: 'logs', label: 'Logs', icon: FileText },
    ] : [
        { id: 'reports', label: 'Report Schedule', icon: Clock },
    ];

    useEffect(() => {
        if (token) {
            fetchSettings();
        }
    }, [token]);

    const fetchSettings = async () => {
        if (!token) {
            setMessage({ type: 'error', text: 'Authentication token not found. Please login again.' });
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/admin/report-settings`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.msg || 'Failed to fetch settings');
            }

            const data = await response.json();
            setSettings(data);
        } catch (error) {
            console.error('Error fetching settings:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to load settings' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!token) {
            setMessage({ type: 'error', text: 'Authentication token not found. Please login again.' });
            return;
        }

        try {
            setSaving(true);
            setMessage(null);
            const response = await fetch(`${API_BASE_URL}/api/admin/report-settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.msg || 'Failed to save settings');
            }

            setMessage({ type: 'success', text: 'Settings saved successfully! Report schedule has been updated.' });
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setSettings({
            dayOfWeek: 0,
            hour: 9,
            minute: 0,
            enabled: true
        });
        setMessage({ type: 'success', text: 'Reset to default values' });
    };

    const handleSendReportNow = async () => {
        if (!token) {
            setMessage({ type: 'error', text: 'Authentication token not found. Please login again.' });
            return;
        }

        try {
            setSendingReport(true);
            setMessage(null);
            const response = await fetch(`${API_BASE_URL}/api/admin/send-report-now`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || data.error || 'Failed to send reports');
            }

            setMessage({
                type: 'success',
                text: 'Reports sent successfully! Check your email (aryalsujay@gmail.com will receive BCC copies).'
            });
        } catch (error) {
            console.error('Error sending report:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to send reports' });
        } finally {
            setSendingReport(false);
        }
    };

    const handleCreateSampleData = async () => {
        if (!token) {
            setSampleDataMessage({ type: 'error', text: 'Authentication token not found. Please login again.' });
            return;
        }

        if (selectedDepartments.length === 0) {
            setSampleDataMessage({ type: 'error', text: 'Please select at least one department' });
            return;
        }

        try {
            setCreatingSampleData(true);
            setSampleDataMessage(null);
            const response = await fetch(`${API_BASE_URL}/api/admin/create-sample-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ departments: selectedDepartments })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || data.error || 'Failed to create sample data');
            }

            setSampleDataMessage({
                type: 'success',
                text: data.message || 'Sample data created successfully!'
            });
            setSelectedDepartments([]);
        } catch (error) {
            console.error('Error creating sample data:', error);
            setSampleDataMessage({ type: 'error', text: error.message || 'Failed to create sample data' });
        } finally {
            setCreatingSampleData(false);
        }
    };

    const handleSendTestReport = async () => {
        if (!token) {
            setTestReportMessage({ type: 'error', text: 'Authentication token not found. Please login again.' });
            return;
        }

        if (testReportDepartments.length === 0) {
            setTestReportMessage({ type: 'error', text: 'Please select at least one department' });
            return;
        }

        try {
            setSendingTestReport(true);
            setTestReportMessage(null);
            const response = await fetch(`${API_BASE_URL}/api/admin/send-test-report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ departments: testReportDepartments })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || data.error || 'Failed to send test report');
            }

            setTestReportMessage({
                type: 'success',
                text: data.message || 'Test report sent successfully!'
            });
            setTestReportDepartments([]);
        } catch (error) {
            console.error('Error sending test report:', error);
            setTestReportMessage({ type: 'error', text: error.message || 'Failed to send test report' });
        } finally {
            setSendingTestReport(false);
        }
    };

    const toggleDepartment = (deptValue, setter, currentValue) => {
        if (currentValue.includes(deptValue)) {
            setter(currentValue.filter(d => d !== deptValue));
        } else {
            setter([...currentValue, deptValue]);
        }
    };

    const selectAllDepartments = (setter) => {
        setter(allDepartments.map(d => d.value));
    };

    const clearAllDepartments = (setter) => {
        setter([]);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                <p className="text-base text-gray-600">
                    Manage system configuration and preferences
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="flex overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-all ${
                                    activeTab === tab.id
                                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                <Icon size={18} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {/* Report Schedule Tab */}
                {activeTab === 'reports' && (
                    <ReportScheduleTab
                        settings={settings}
                        setSettings={setSettings}
                        message={message}
                        saving={saving}
                        handleSave={handleSave}
                        handleReset={handleReset}
                        daysOfWeek={daysOfWeek}
                        user={user}
                    />
                )}

                {/* Send Reports Tab */}
                {activeTab === 'send' && user.role === 'super_admin' && (
                    <SendReportsTab
                        message={message}
                        testReportMessage={testReportMessage}
                        sendingReport={sendingReport}
                        sendingTestReport={sendingTestReport}
                        testReportDepartments={testReportDepartments}
                        allDepartments={allDepartments}
                        handleSendReportNow={handleSendReportNow}
                        handleSendTestReport={handleSendTestReport}
                        toggleDepartment={toggleDepartment}
                        selectAllDepartments={selectAllDepartments}
                        clearAllDepartments={clearAllDepartments}
                        setTestReportDepartments={setTestReportDepartments}
                    />
                )}

                {/* Sample Data Tab */}
                {activeTab === 'sample' && user.role === 'super_admin' && (
                    <SampleDataTab
                        sampleDataMessage={sampleDataMessage}
                        creatingSampleData={creatingSampleData}
                        selectedDepartments={selectedDepartments}
                        allDepartments={allDepartments}
                        handleCreateSampleData={handleCreateSampleData}
                        toggleDepartment={toggleDepartment}
                        selectAllDepartments={selectAllDepartments}
                        clearAllDepartments={clearAllDepartments}
                        setSelectedDepartments={setSelectedDepartments}
                        token={token}
                    />
                )}

                {/* User Management Tab */}
                {activeTab === 'users' && user.role === 'super_admin' && (
                    <UserManagementTab token={token} />
                )}

                {/* System Tab */}
                {activeTab === 'system' && user.role === 'super_admin' && (
                    <SystemTab token={token} />
                )}

                {/* Logs Tab */}
                {activeTab === 'logs' && user.role === 'super_admin' && (
                    <LogsTab token={token} />
                )}
            </div>
        </div>
    );
};

// Report Schedule Tab Component
const ReportScheduleTab = ({ settings, setSettings, message, saving, handleSave, handleReset, daysOfWeek, user }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <Clock className="text-blue-600" size={24} />
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Weekly Report Schedule</h2>
                <p className="text-sm text-gray-600">Configure automatic report delivery for {user.department?.replace('_', ' ')}</p>
            </div>
        </div>

        {message && (
            <div className={`p-4 rounded-lg flex items-start gap-3 ${
                message.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
                {message.type === 'success' ? (
                    <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />
                ) : (
                    <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                )}
                <p className="flex-1">{message.text}</p>
            </div>
        )}

        <div className="space-y-6">
            {/* Enable/Disable Toggle */}
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
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>

            {/* Day of Week */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
                <select
                    value={settings.dayOfWeek}
                    onChange={(e) => setSettings({ ...settings, dayOfWeek: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!settings.enabled}
                >
                    {daysOfWeek.map(day => (
                        <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                </select>
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hour (24-hour format)</label>
                    <input
                        type="number"
                        min="0"
                        max="23"
                        value={settings.hour}
                        onChange={(e) => setSettings({ ...settings, hour: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!settings.enabled}
                    />
                    <p className="text-xs text-gray-500 mt-1">0-23 (e.g., 9 for 9 AM)</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minute</label>
                    <input
                        type="number"
                        min="0"
                        max="59"
                        value={settings.minute}
                        onChange={(e) => setSettings({ ...settings, minute: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!settings.enabled}
                    />
                    <p className="text-xs text-gray-500 mt-1">0-59</p>
                </div>
            </div>

            {/* Preview */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Schedule Preview</h3>
                <p className="text-sm text-blue-800">
                    {settings.enabled ? (
                        <>
                            Reports will be sent every <strong>{daysOfWeek[settings.dayOfWeek].label}</strong> at{' '}
                            <strong>{String(settings.hour).padStart(2, '0')}:{String(settings.minute).padStart(2, '0')}</strong> IST
                        </>
                    ) : (
                        <span className="text-blue-700">Weekly reports are currently disabled</span>
                    )}
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    {saving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            Save Settings
                        </>
                    )}
                </button>
                <button
                    onClick={handleReset}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    <RefreshCw size={18} />
                    Reset to Default
                </button>
            </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-900 mb-2">Important Information</h3>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>Default schedule is Sunday at 9:00 AM IST</li>
                <li>Reports include all feedback from the past 7 days</li>
                <li>Changes take effect immediately after saving</li>
                <li>The system timezone is configured for Mumbai (IST)</li>
            </ul>
        </div>
    </div>
);

// Send Reports Tab Component
const SendReportsTab = ({
    message, testReportMessage, sendingReport, sendingTestReport,
    testReportDepartments, allDepartments, handleSendReportNow,
    handleSendTestReport, toggleDepartment, selectAllDepartments,
    clearAllDepartments, setTestReportDepartments
}) => (
    <div className="space-y-8">
        {/* Send Report Now Section */}
        <div>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <Send className="text-green-600" size={24} />
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Send Reports to All Departments</h2>
                    <p className="text-sm text-gray-600">Send weekly reports immediately to all configured emails</p>
                </div>
            </div>

            {message && (
                <div className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${
                    message.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    {message.type === 'success' ? (
                        <CheckCircle size={20} className="mt-0.5" />
                    ) : (
                        <AlertCircle size={20} className="mt-0.5" />
                    )}
                    <p>{message.text}</p>
                </div>
            )}

            <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                        <li>Reports will be sent to all configured department emails</li>
                        <li>BCC copy sent to: <strong className="text-green-700">aryalsujay@gmail.com</strong></li>
                        <li>Includes data from the last 7 days</li>
                        <li className="text-orange-600 font-medium">⚠️ This sends to production emails!</li>
                    </ul>
                </div>

                <button
                    onClick={handleSendReportNow}
                    disabled={sendingReport}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-md hover:shadow-lg"
                >
                    {sendingReport ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Sending Reports...
                        </>
                    ) : (
                        <>
                            <Send size={18} />
                            Send Report Now to All
                        </>
                    )}
                </button>
            </div>
        </div>

        <div className="border-t pt-8" />

        {/* Send Test Report Section */}
        <div>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <Mail className="text-blue-600" size={24} />
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Send Test Report</h2>
                    <p className="text-sm text-gray-600">Test report delivery without sending to department emails</p>
                </div>
            </div>

            {testReportMessage && (
                <div className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${
                    testReportMessage.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    {testReportMessage.type === 'success' ? (
                        <CheckCircle size={20} className="mt-0.5" />
                    ) : (
                        <AlertCircle size={20} className="mt-0.5" />
                    )}
                    <p>{testReportMessage.text}</p>
                </div>
            )}

            <div className="space-y-4">
                <div className="flex gap-2 mb-3">
                    <button
                        onClick={() => selectAllDepartments(setTestReportDepartments)}
                        className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                        Select All
                    </button>
                    <button
                        onClick={() => clearAllDepartments(setTestReportDepartments)}
                        className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                        Clear All
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {allDepartments.map(dept => (
                        <label key={dept.value} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors">
                            <input
                                type="checkbox"
                                checked={testReportDepartments.includes(dept.value)}
                                onChange={() => toggleDepartment(dept.value, setTestReportDepartments, testReportDepartments)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">{dept.label}</span>
                        </label>
                    ))}
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>Only sent to BCC: <strong className="text-blue-700">aryalsujay@gmail.com</strong></li>
                        <li>Department emails will NOT receive these test reports</li>
                        <li>Includes data from the last 7 days</li>
                        <li className="text-green-700 font-medium">✓ Safe for testing</li>
                    </ul>
                </div>

                <button
                    onClick={handleSendTestReport}
                    disabled={sendingTestReport || testReportDepartments.length === 0}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-md hover:shadow-lg"
                >
                    {sendingTestReport ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Sending Test Report...
                        </>
                    ) : (
                        <>
                            <Mail size={18} />
                            Send Test Report {testReportDepartments.length > 0 && `(${testReportDepartments.length} dept)`}
                        </>
                    )}
                </button>
            </div>
        </div>
    </div>
);

// Sample Data Tab Component
const SampleDataTab = ({
    sampleDataMessage, creatingSampleData, selectedDepartments,
    allDepartments, handleCreateSampleData, toggleDepartment,
    selectAllDepartments, clearAllDepartments, setSelectedDepartments, token
}) => {
    const [deleting, setDeleting] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState(null);

    const handleClearAllData = async () => {
        if (!window.confirm('Are you sure you want to delete ALL feedback data? This action cannot be undone!')) {
            return;
        }

        try {
            setDeleting(true);
            setDeleteMessage(null);
            const response = await fetch(`${API_BASE_URL}/api/admin/clear-all-feedback`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Failed to clear data');

            setDeleteMessage({ type: 'success', text: data.message || 'All feedback data cleared!' });
        } catch (error) {
            setDeleteMessage({ type: 'error', text: error.message });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Create Sample Data */}
            <div>
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                    <Database className="text-purple-600" size={24} />
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Create Sample Data</h2>
                        <p className="text-sm text-gray-600">Generate realistic test feedback for development and testing</p>
                    </div>
                </div>

                {sampleDataMessage && (
                    <div className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${
                        sampleDataMessage.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-800'
                            : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                        {sampleDataMessage.type === 'success' ? (
                            <CheckCircle size={20} className="mt-0.5" />
                        ) : (
                            <AlertCircle size={20} className="mt-0.5" />
                        )}
                        <p>{sampleDataMessage.text}</p>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="flex gap-2 mb-3">
                        <button
                            onClick={() => selectAllDepartments(setSelectedDepartments)}
                            className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                        >
                            Select All
                        </button>
                        <button
                            onClick={() => clearAllDepartments(setSelectedDepartments)}
                            className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                            Clear All
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {allDepartments.map(dept => (
                            <label key={dept.value} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={selectedDepartments.includes(dept.value)}
                                    onChange={() => toggleDepartment(dept.value, setSelectedDepartments, selectedDepartments)}
                                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm font-medium text-gray-700">{dept.label}</span>
                            </label>
                        ))}
                    </div>

                    <button
                        onClick={handleCreateSampleData}
                        disabled={creatingSampleData || selectedDepartments.length === 0}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-md hover:shadow-lg"
                    >
                        {creatingSampleData ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Creating Sample Data...
                            </>
                        ) : (
                            <>
                                <Database size={18} />
                                Create 5 Sample Entries {selectedDepartments.length > 0 && `(${selectedDepartments.length} dept)`}
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="border-t pt-8" />

            {/* Clear All Data */}
            <div>
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                    <Trash2 className="text-red-600" size={24} />
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Clear All Feedback Data</h2>
                        <p className="text-sm text-gray-600">Delete all feedback entries from the database</p>
                    </div>
                </div>

                {deleteMessage && (
                    <div className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${
                        deleteMessage.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-800'
                            : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                        {deleteMessage.type === 'success' ? (
                            <CheckCircle size={20} className="mt-0.5" />
                        ) : (
                            <AlertCircle size={20} className="mt-0.5" />
                        )}
                        <p>{deleteMessage.text}</p>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800 font-medium mb-2">⚠️ Warning: This action cannot be undone!</p>
                        <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                            <li>All feedback entries will be permanently deleted</li>
                            <li>Analytics and reports will be reset</li>
                            <li>This affects all departments</li>
                        </ul>
                    </div>

                    <button
                        onClick={handleClearAllData}
                        disabled={deleting}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-md hover:shadow-lg"
                    >
                        {deleting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 size={18} />
                                Clear All Feedback Data
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// User Management Tab Component
const UserManagementTab = ({ token }) => {
    return <UserManagementFull token={token} />;
};

// System Tab Component
const SystemTab = ({ token }) => {
    const [restarting, setRestarting] = useState(false);
    const [message, setMessage] = useState(null);

    const handleRestartServer = async () => {
        if (!window.confirm('Are you sure you want to restart the server? This will briefly interrupt service.')) {
            return;
        }

        try {
            setRestarting(true);
            setMessage(null);
            const response = await fetch(`${API_BASE_URL}/api/admin/restart-server`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Failed to restart');

            setMessage({ type: 'success', text: 'Server restart initiated. Please wait 10 seconds...' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setRestarting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <SettingsIcon className="text-gray-600" size={24} />
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">System Configuration</h2>
                    <p className="text-sm text-gray-600">Server management and configuration</p>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-lg flex items-start gap-3 ${
                    message.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    {message.type === 'success' ? (
                        <CheckCircle size={20} className="mt-0.5" />
                    ) : (
                        <AlertCircle size={20} className="mt-0.5" />
                    )}
                    <p>{message.text}</p>
                </div>
            )}

            <div className="space-y-4">
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-2">Restart Server</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Restart the backend server to apply configuration changes or resolve issues.
                    </p>
                    <button
                        onClick={handleRestartServer}
                        disabled={restarting}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-colors"
                    >
                        {restarting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Restarting...
                            </>
                        ) : (
                            <>
                                <RefreshCcw size={18} />
                                Restart Server
                            </>
                        )}
                    </button>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>Coming soon:</strong> Additional system configuration options including email settings, backup/restore, and performance tuning.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Logs Tab Component
const LogsTab = ({ token }) => {
    const [logs, setLogs] = useState('');
    const [loading, setLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/admin/logs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setLogs(data.logs || 'No logs available');
            }
        } catch (error) {
            setLogs('Error fetching logs: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(fetchLogs, 5000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div className="flex items-center gap-3">
                    <FileText className="text-gray-600" size={24} />
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">System Logs</h2>
                        <p className="text-sm text-gray-600">View recent server logs and activity</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="rounded"
                        />
                        Auto-refresh
                    </label>
                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Loading...
                            </>
                        ) : (
                            <>
                                <RefreshCcw size={16} />
                                Refresh
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 h-96 overflow-auto">
                <pre className="whitespace-pre-wrap">{logs}</pre>
            </div>
        </div>
    );
};

export default SettingsNew;
