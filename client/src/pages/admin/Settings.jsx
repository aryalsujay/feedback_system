import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, Save, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const Settings = () => {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [settings, setSettings] = useState({
        dayOfWeek: 0,
        hour: 9,
        minute: 0,
        enabled: true
    });

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Report Settings</h1>
                <p className="text-gray-600">
                    Configure when you want to receive weekly feedback reports for {user.department}
                </p>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                    message.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    {message.type === 'success' ? (
                        <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />
                    ) : (
                        <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                    )}
                    <p>{message.text}</p>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                    <Clock className="text-blue-600" size={24} />
                    <h2 className="text-xl font-semibold text-gray-900">Weekly Report Schedule</h2>
                </div>

                <div className="space-y-6">
                    {/* Enable/Disable Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h3 className="font-medium text-gray-900">Enable Weekly Reports</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Turn on or off automatic weekly report delivery
                            </p>
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hour (24-hour format)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="23"
                                value={settings.hour}
                                onChange={(e) => setSettings({ ...settings, hour: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={!settings.enabled}
                            />
                            <p className="text-xs text-gray-500 mt-1">0-23 (e.g., 9 for 9 AM, 14 for 2 PM)</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Minute
                            </label>
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
                        <p className="text-blue-800">
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
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
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
                            className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            <RefreshCw size={18} />
                            Reset to Default
                        </button>
                    </div>
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
};

export default Settings;
