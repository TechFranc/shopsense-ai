import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiSave, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../services/api';

const Profile = () => {
  const { user } = useAuth();

  const [profileForm, setProfileForm] = useState({
    username: user?.username || "",
    email: user?.email || ""
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });

  const [profileStatus, setProfileStatus] = useState(null);
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileStatus(null);
    try {
      await updateProfile(profileForm);
      setProfileStatus({ type: "success", message: "Profile updated successfully!" });
    } catch (err) {
      setProfileStatus({
        type: "error",
        message: err.response?.data?.detail || "Failed to update profile."
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      return setPasswordStatus({ type: "error", message: "New passwords do not match." });
    }
    if (passwordForm.new_password.length < 6) {
      return setPasswordStatus({ type: "error", message: "Password must be at least 6 characters." });
    }

    setPasswordLoading(true);
    try {
      await changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      setPasswordStatus({ type: "success", message: "Password changed successfully!" });
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      setPasswordStatus({
        type: "error",
        message: err.response?.data?.detail || "Failed to change password."
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const StatusMessage = ({ status }) => {
    if (!status) return null;
    return (
      <div className={`flex items-center gap-2 p-3 rounded-xl text-sm mt-3 ${
        status.type === "success"
          ? "bg-green-500/20 border border-green-500/30 text-green-400"
          : "bg-red-500/20 border border-red-500/30 text-red-400"
      }`}>
        {status.type === "success"
          ? <FiCheck className="flex-shrink-0" />
          : <FiAlertCircle className="flex-shrink-0" />}
        {status.message}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-1">My Profile</h1>
        <p className="text-white/50">Manage your account information and security settings</p>
      </motion.div>

      {/* Avatar Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 flex items-center gap-5"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold flex-shrink-0">
          {user?.username?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{user?.username}</h2>
          <p className="text-white/50">{user?.email}</p>
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full mt-1 inline-block">
            Active Account
          </span>
        </div>
      </motion.div>

      {/* Update Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
          <FiUser className="text-purple-400" />
          Account Information
        </h3>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Username</label>
            <input
              type="text"
              value={profileForm.username}
              onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
                         text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Email Address</label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
                         text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
            />
          </div>

          <StatusMessage status={profileStatus} />

          <motion.button
            type="submit"
            disabled={profileLoading}
            className="glass-button-primary flex items-center gap-2 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiSave />
            {profileLoading ? "Saving..." : "Save Changes"}
          </motion.button>
        </form>
      </motion.div>

      {/* Change Password */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
          <FiLock className="text-pink-400" />
          Change Password
        </h3>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Current Password</label>
            <input
              type="password"
              value={passwordForm.current_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
                         text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">New Password</label>
            <input
              type="password"
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
                         text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.confirm_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
                         text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
              placeholder="••••••••"
            />
          </div>

          <StatusMessage status={passwordStatus} />

          <motion.button
            type="submit"
            disabled={passwordLoading}
            className="glass-button-primary flex items-center gap-2 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiLock />
            {passwordLoading ? "Updating..." : "Change Password"}
          </motion.button>
        </form>
      </motion.div>

    </div>
  );
};

export default Profile;