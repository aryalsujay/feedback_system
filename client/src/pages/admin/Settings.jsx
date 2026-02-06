import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, Save, RefreshCw, CheckCircle, AlertCircle, Send, Database, Mail } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const Settings = () => {
    const { user, token } = useAuth();
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
            console.log('Fetching settings from:', `${API_BASE_URL}/api/admin/report-settings`);
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
            console.log('Saving settings to:', `${API_BASE_URL}/api/admin/report-settings`, settings);
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
            console.log('Triggering immediate report send...');

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
            console.log('Creating sample data for departments:', selectedDepartments);

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
            console.log('Sending test report for departments:', testReportDepartments);

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
        <div className="max-w-4xl">
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Report Settings</h1>
                <p className="text-sm md:text-base text-gray-600">
                    Configure weekly feedback reports for {user.department?.replace('_', ' ')}
                </p>
            </div>

            {message && (
                <div className={`mb-4 md:mb-6 p-3 md:p-4 rounded-lg flex items-start gap-3 text-sm md:text-base ${
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="flex items-center gap-3 mb-4 md:mb-6 pb-4 md:pb-6 border-b border-gray-200">
                    <Clock className="text-blue-600 flex-shrink-0" size={20} />
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900">Weekly Report Schedule</h2>
                </div>

                <div className="space-y-4 md:space-y-6">
                    {/* Enable/Disable Toggle */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900 text-sm md:text-base">Enable Weekly Reports</h3>
                            <p className="text-xs md:text-sm text-gray-600 mt-1">
                                Turn on or off automatic weekly report delivery
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Day of Week
                        </label>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                                Hour (24-hour format)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="23"
                                value={settings.hour}
                                onChange={(e) => setSettings({ ...settings, hour: parseInt(e.target.value) })}
                                className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={!settings.enabled}
                            />
                            <p className="text-xs text-gray-500 mt-1">0-23 (e.g., 9 for 9 AM)</p>
                        </div>
                        <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                                Minute
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={settings.minute}
                                onChange={(e) => setSettings({ ...settings, minute: parseInt(e.target.value) })}
                                className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={!settings.enabled}
                            />
                            <p className="text-xs text-gray-500 mt-1">0-59</p>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="text-sm md:text-base font-medium text-blue-900 mb-2">Schedule Preview</h3>
                        <p className="text-xs md:text-sm text-blue-800">
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
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm md:text-base"
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
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors font-medium text-sm md:text-base"
                        >
                            <RefreshCw size={18} />
                            Reset to Default
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="mt-4 md:mt-6 p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-sm md:text-base font-medium text-yellow-900 mb-2">Important Information</h3>
                <ul className="text-xs md:text-sm text-yellow-800 space-y-1 list-disc list-inside">
                    <li>Default schedule is Sunday at 9:00 AM IST</li>
                    <li>Reports include all feedback from the past 7 days</li>
                    <li>Changes take effect immediately after saving</li>
                    <li>The system timezone is configured for Mumbai (IST)</li>
                </ul>
            </div>

            {/* Send Report Now Section - Only for Super Admin */}
            {user.role === 'super_admin' && (
                <>
                    <div className="mt-6 md:mt-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-4 md:p-6">
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-green-200">
                            <Send className="text-green-600 flex-shrink-0" size={20} />
                            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Send Reports to All Departments</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="text-sm md:text-base text-gray-700">
                                <p className="mb-2">Send weekly reports immediately to all departments.</p>
                                <ul className="list-disc list-inside space-y-1 text-xs md:text-sm text-gray-600 ml-2">
                                    <li>Reports will be sent to all configured department emails</li>
                                    <li>BCC copy sent to: <strong className="text-green-700">aryalsujay@gmail.com</strong></li>
                                    <li>Includes data from the last 7 days</li>
                                </ul>
                            </div>

                            <button
                                onClick={handleSendReportNow}
                                disabled={sendingReport}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm md:text-base shadow-md hover:shadow-lg"
                            >
                                {sendingReport ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Sending Reports...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Send Report Now
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Create Sample Data Section */}
                    <div className="mt-6 md:mt-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-sm border border-purple-200 p-4 md:p-6">
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-purple-200">
                            <Database className="text-purple-600 flex-shrink-0" size={20} />
                            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Create Sample Data</h2>
                        </div>

                        {sampleDataMessage && (
                            <div className={`mb-4 p-3 rounded-lg flex items-start gap-3 text-sm ${
                                sampleDataMessage.type === 'success'
                                    ? 'bg-green-50 border border-green-200 text-green-800'
                                    : 'bg-red-50 border border-red-200 text-red-800'
                            }`}>
                                {sampleDataMessage.type === 'success' ? (
                                    <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
                                ) : (
                                    <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                                )}
                                <p className="flex-1">{sampleDataMessage.text}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="text-sm md:text-base text-gray-700">
                                <p className="mb-3">Generate 5 sample feedback entries for selected departments.</p>

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

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {allDepartments.map(dept => (
                                        <label key={dept.value} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-purple-100 cursor-pointer hover:bg-purple-50 transition-colors">
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
                            </div>

                            <button
                                onClick={handleCreateSampleData}
                                disabled={creatingSampleData || selectedDepartments.length === 0}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm md:text-base shadow-md hover:shadow-lg"
                            >
                                {creatingSampleData ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Creating Sample Data...
                                    </>
                                ) : (
                                    <>
                                        <Database size={18} />
                                        Create 5 Sample Data {selectedDepartments.length > 0 && `(${selectedDepartments.length} dept)`}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Send Test Report Section */}
                    <div className="mt-6 md:mt-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-sm border border-blue-200 p-4 md:p-6">
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-blue-200">
                            <Mail className="text-blue-600 flex-shrink-0" size={20} />
                            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Send Test Report</h2>
                        </div>

                        {testReportMessage && (
                            <div className={`mb-4 p-3 rounded-lg flex items-start gap-3 text-sm ${
                                testReportMessage.type === 'success'
                                    ? 'bg-green-50 border border-green-200 text-green-800'
                                    : 'bg-red-50 border border-red-200 text-red-800'
                            }`}>
                                {testReportMessage.type === 'success' ? (
                                    <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
                                ) : (
                                    <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                                )}
                                <p className="flex-1">{testReportMessage.text}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="text-sm md:text-base text-gray-700">
                                <p className="mb-3">Send test reports to <strong className="text-blue-700">aryalsujay@gmail.com</strong> only (no department emails).</p>

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

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {allDepartments.map(dept => (
                                        <label key={dept.value} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-50 transition-colors">
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

                                <ul className="list-disc list-inside space-y-1 text-xs md:text-sm text-gray-600 ml-2 mt-3">
                                    <li>Only sent to BCC: <strong className="text-blue-700">aryalsujay@gmail.com</strong></li>
                                    <li>Department emails will NOT receive these test reports</li>
                                    <li>Includes data from the last 7 days</li>
                                </ul>
                            </div>

                            <button
                                onClick={handleSendTestReport}
                                disabled={sendingTestReport || testReportDepartments.length === 0}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm md:text-base shadow-md hover:shadow-lg"
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
                </>
            )}
        </div>
    );
};

export default Settings;
