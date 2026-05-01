"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/services/api";
import { useAction } from "@/hooks/useAction";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, updateProfile, logout } = useAuthStore();
  const { run } = useAction();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Admin API Keys state
  const [geminiKey, setGeminiKey] = useState("");
  const [openRouterKey, setOpenRouterKey] = useState("");

  const handleSave = async () => {
    await run(async () => {
      await updateProfile({ name, email });
      toast.success("Profile updated");
    }, "Saving profile...");
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    await run(async () => {
      await api.put("/auth/profile", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully. Please sign in again.");
    }, "Changing password...");
  };

  const handleSaveApiKeys = async () => {
    await run(async () => {
      await updateProfile({ apiKeyGemini: geminiKey, apiKeyOpenRouter: openRouterKey });
      toast.success("API Keys updated");
    }, "Saving API keys...");
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Profile */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6">
        <h3 className="text-base font-semibold mb-5">Profile</h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-teal-400 flex items-center justify-center text-white font-bold text-xl">
            {user?.name?.split(" ").map((n) => n[0]).join("") || "U"}
          </div>
          <div>
            <div className="text-sm font-medium">{user?.name}</div>
            <div className="text-xs text-surface-500">{user?.email}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Full Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full px-4 py-2.5 bg-surface-950 border border-surface-700 rounded-xl text-sm text-surface-50 transition" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full px-4 py-2.5 bg-surface-950 border border-surface-700 rounded-xl text-sm text-surface-50 transition" 
            />
          </div>
        </div>
        <button 
          onClick={handleSave} 
          className="mt-4 px-5 py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl text-sm font-medium transition"
        >
          Save Changes
        </button>
      </div>

      {/* Change Password */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6">
        <h3 className="text-base font-semibold mb-1">Change Password</h3>
        <p className="text-xs text-surface-500 mb-5">Enter your current password to set a new one.</p>
        <div className="space-y-4 max-w-sm">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Current Password</label>
            <input 
              type="password" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
              className="w-full px-4 py-2.5 bg-surface-950 border border-surface-700 rounded-xl text-sm text-surface-50 transition" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">New Password</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              className="w-full px-4 py-2.5 bg-surface-950 border border-surface-700 rounded-xl text-sm text-surface-50 transition" 
              placeholder="Min 8 characters" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              className="w-full px-4 py-2.5 bg-surface-950 border border-surface-700 rounded-xl text-sm text-surface-50 transition" 
            />
          </div>
          <button 
            onClick={handleChangePassword} 
            disabled={!currentPassword || !newPassword || !confirmPassword} 
            className="px-5 py-2.5 bg-surface-800 hover:bg-surface-700 border border-surface-700 rounded-xl text-sm font-medium text-surface-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Update Password
          </button>
        </div>
      </div>

      {/* API Keys — ADMIN ONLY */}
      {isAdmin && (
        <div className="bg-surface-900 border border-amber-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m0 0a3 3 0 00-3-3m3 3a3 3 0 100 6m0-6a3 3 0 10-6 0" /></svg>
            <h3 className="text-base font-semibold text-amber-400">Admin: AI API Keys</h3>
          </div>
          <p className="text-xs text-surface-500 mb-5">Override the server-default AI keys. Only visible to admins.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Gemini API Key</label>
              <input 
                type="password" 
                value={geminiKey} 
                onChange={(e) => setGeminiKey(e.target.value)} 
                placeholder="Leave empty to use server default" 
                className="w-full px-4 py-2.5 bg-surface-950 border border-surface-700 rounded-xl text-sm text-surface-50 placeholder-surface-500 transition font-mono" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">OpenRouter API Key (Fallback)</label>
              <input 
                type="password" 
                value={openRouterKey} 
                onChange={(e) => setOpenRouterKey(e.target.value)} 
                placeholder="Leave empty to use server default" 
                className="w-full px-4 py-2.5 bg-surface-950 border border-surface-700 rounded-xl text-sm text-surface-50 placeholder-surface-500 transition font-mono" 
              />
            </div>
            <button 
              onClick={handleSaveApiKeys}
              className="px-5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 rounded-xl text-sm font-medium transition"
            >
              Save API Keys
            </button>
          </div>
        </div>
      )}

      {/* Account Info */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6">
        <h3 className="text-base font-semibold mb-4">Account Info</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-surface-500">Plan</span>
            <p className="font-medium mt-0.5">Free (Beta)</p>
          </div>
          <div>
            <span className="text-surface-500">Role</span>
            <p className="font-medium capitalize mt-0.5">{user?.role || "member"}</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-surface-900 border border-red-500/20 rounded-2xl p-6">
        <h3 className="text-base font-semibold text-red-400 mb-4">Danger Zone</h3>
        <p className="text-sm text-surface-400 mb-4">Irreversible actions.</p>
        <button 
          onClick={logout} 
          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}