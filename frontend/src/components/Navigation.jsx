import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiUpload, FiPieChart, FiZap, FiFileText, FiDollarSign, FiLogOut, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Shown only when logged OUT
  const publicNavItems = [
    { path: '/', icon: FiHome, label: 'Home' },
  ];

  // Shown only when logged IN
  const privateNavItems = [
    { path: '/upload', icon: FiUpload, label: 'Upload' },
    { path: '/dashboard', icon: FiPieChart, label: 'Dashboard' },
    { path: '/insights', icon: FiZap, label: 'Insights' },
    { path: '/budgets', icon: FiDollarSign, label: 'Budgets' },
    { path: '/receipts', icon: FiFileText, label: 'Receipts' },
  ];

  const navItems = user ? privateNavItems : publicNavItems;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiPieChart className="text-xl text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">ShopSense AI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-white/20 text-white shadow-lg scale-105'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="text-lg" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}

            {/* Logged OUT — show Login & Register */}
            {!user && (
              <div className="flex items-center gap-2 ml-4">
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  <FiUser className="text-lg" />
                  <span className="font-medium">Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Logged IN — show username & logout */}
            {user && (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/20">
                <div className="flex items-center gap-2 text-white/80">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <FiUser className="text-sm text-white" />
                  </div>
                  <span className="font-medium text-sm">Hi, {user.username}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <FiLogOut className="text-lg" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="text-lg" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}

            {!user && (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  <FiUser className="text-lg" />
                  <span className="font-medium">Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium"
                >
                  Get Started
                </Link>
              </>
            )}

            {user && (
              <>
                <div className="flex items-center gap-3 px-4 py-3 text-white/80">
                  <FiUser className="text-lg" />
                  <span className="font-medium">Hi, {user.username}</span>
                </div>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <FiLogOut className="text-lg" />
                  <span className="font-medium">Logout</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;

