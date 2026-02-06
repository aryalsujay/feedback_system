import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Key, Save, X, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const UserManagementFull = ({ token }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'admin',
        department: 'global'
    });

    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const departments = [
        { value: 'global', label: 'Global' },
        { value: 'global_pagoda', label: 'Global Pagoda' },
        { value: 'food_court', label: 'Food Court' },
        { value: 'souvenir_shop', label: 'Souvenir Shop' },
        { value: 'dhamma_alaya', label: 'Dhamma Alaya' },
        { value: 'dpvc', label: 'DPVC' }
    ];

    const roles = [
        { value: 'super_admin', label: 'Super Admin' },
        { value: 'admin', label: 'Admin' }
    ];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setMessage({ type: 'error', text: 'Failed to load users' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async () => {
        if (!formData.username || !formData.password) {
            setMessage({ type: 'error', text: 'Username and password are required' });
            return;
        }

        if (formData.password.length < 4) {
            setMessage({ type: 'error', text: 'Password must be at least 4 characters' });
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to create user');
            }

            setMessage({ type: 'success', text: 'User created successfully!' });
            setShowAddModal(false);
            setFormData({ username: '', password: '', role: 'admin', department: 'global' });
            fetchUsers();
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        }
    };

    const handleEditUser = async () => {
        if (!selectedUser) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/users/${selectedUser._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    role: formData.role,
                    department: formData.department
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to update user');
            }

            setMessage({ type: 'success', text: 'User updated successfully!' });
            setShowEditModal(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to delete user');
            }

            setMessage({ type: 'success', text: 'User deleted successfully!' });
            fetchUsers();
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        }
    };

    const handleResetPassword = async () => {
        if (!selectedUser) return;

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        if (passwordData.newPassword.length < 4) {
            setMessage({ type: 'error', text: 'Password must be at least 4 characters' });
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/users/${selectedUser._id}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password: passwordData.newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to reset password');
            }

            setMessage({ type: 'success', text: 'Password reset successfully!' });
            setShowPasswordModal(false);
            setSelectedUser(null);
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({
            username: user.username,
            password: '',
            role: user.role,
            department: user.department
        });
        setShowEditModal(true);
    };

    const openPasswordModal = (user) => {
        setSelectedUser(user);
        setPasswordData({ newPassword: '', confirmPassword: '' });
        setShowPasswordModal(true);
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading users...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div className="flex items-center gap-3">
                    <Users className="text-indigo-600" size={24} />
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                        <p className="text-sm text-gray-600">Create, edit, and manage admin users</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setFormData({ username: '', password: '', role: 'admin', department: 'global' });
                        setShowAddModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={18} />
                    Add User
                </button>
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
                    <button onClick={() => setMessage(null)} className="text-gray-500 hover:text-gray-700">
                        <X size={18} />
                    </button>
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Username</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Department</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Created</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.username}</td>
                                <td className="px-4 py-3 text-sm">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        user.role === 'super_admin'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                                    {user.department.replace('_', ' ')}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-4 py-3 text-sm text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="Edit user"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => openPasswordModal(user)}
                                            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                                            title="Reset password"
                                        >
                                            <Key size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user._id, user.username)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Delete user"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No users found. Click "Add User" to create one.
                    </div>
                )}
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <Modal
                    title="Add New User"
                    onClose={() => setShowAddModal(false)}
                    onSave={handleAddUser}
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter username"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                {roles.map(role => (
                                    <option key={role.value} value={role.value}>{role.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                            <select
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                {departments.map(dept => (
                                    <option key={dept.value} value={dept.value}>{dept.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <Modal
                    title={`Edit User: ${selectedUser.username}`}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleEditUser}
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                            <input
                                type="text"
                                value={formData.username}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                {roles.map(role => (
                                    <option key={role.value} value={role.value}>{role.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                            <select
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                {departments.map(dept => (
                                    <option key={dept.value} value={dept.value}>{dept.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Reset Password Modal */}
            {showPasswordModal && selectedUser && (
                <Modal
                    title={`Reset Password: ${selectedUser.username}`}
                    onClose={() => setShowPasswordModal(false)}
                    onSave={handleResetPassword}
                    saveText="Reset Password"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Confirm new password"
                            />
                        </div>

                        {passwordData.newPassword && passwordData.confirmPassword &&
                         passwordData.newPassword !== passwordData.confirmPassword && (
                            <p className="text-sm text-red-600">Passwords do not match</p>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
};

// Modal Component
const Modal = ({ title, children, onClose, onSave, saveText = 'Save' }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4">
                    {children}
                </div>

                <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Save size={16} />
                        {saveText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserManagementFull;
