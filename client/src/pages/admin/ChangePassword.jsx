import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Key, Save, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const ChangePassword = () => {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setMessage(null);
    };

    const validateForm = () => {
        if (!formData.currentPassword) {
            setMessage({ type: 'error', text: 'Please enter your current password' });
            return false;
        }
        if (!formData.newPassword) {
            setMessage({ type: 'error', text: 'Please enter a new password' });
            return false;
        }
        if (formData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
            return false;
        }
        if (formData.newPassword === formData.currentPassword) {
            setMessage({ type: 'error', text: 'New password must be different from current password' });
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'New password and confirm password do not match' });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setMessage(null);

            const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Password changed successfully!' });
                setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                throw new Error(data.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Password change error:', error);
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <Key className="text-blue-600" size={32} />
                    Change Password
                </h1>
                <p className="text-gray-600">Update your account password</p>
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
                    <p className="flex-1">{message.text}</p>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">User Information</h3>
                    <div className="text-sm text-blue-800 space-y-1">
                        <p><strong>Username:</strong> {user?.username}</p>
                        <p><strong>Role:</strong> <span className="capitalize">{user?.role?.replace('_', ' ')}</span></p>
                        <p><strong>Department:</strong> <span className="capitalize">{user?.department?.replace('_', ' ')}</span></p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="Enter your current password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="Enter new password (min 6 characters)"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Password must be at least 6 characters long
                        </p>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="Re-enter new password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Password Requirements:</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                            <li className="flex items-start gap-2">
                                <span className={formData.newPassword.length >= 6 ? 'text-green-600' : 'text-gray-400'}>
                                    {formData.newPassword.length >= 6 ? '✓' : '○'}
                                </span>
                                <span>At least 6 characters long</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className={formData.newPassword && formData.newPassword !== formData.currentPassword ? 'text-green-600' : 'text-gray-400'}>
                                    {formData.newPassword && formData.newPassword !== formData.currentPassword ? '✓' : '○'}
                                </span>
                                <span>Different from current password</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className={formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword ? 'text-green-600' : 'text-gray-400'}>
                                    {formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword ? '✓' : '○'}
                                </span>
                                <span>Passwords match</span>
                            </li>
                        </ul>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-medium shadow-md hover:shadow-lg"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Changing Password...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>Change Password</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setFormData({
                                    currentPassword: '',
                                    newPassword: '',
                                    confirmPassword: ''
                                });
                                setMessage(null);
                            }}
                            disabled={loading}
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all font-medium"
                        >
                            Reset Form
                        </button>
                    </div>
                </form>
            </div>

            {/* Security Tips */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-sm font-medium text-yellow-900 mb-2">Security Tips:</h3>
                <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                    <li>Use a strong, unique password that you don't use anywhere else</li>
                    <li>Never share your password with anyone</li>
                    <li>Change your password regularly (every 3-6 months recommended)</li>
                    <li>If you suspect your account has been compromised, change your password immediately</li>
                </ul>
            </div>
        </div>
    );
};

export default ChangePassword;
