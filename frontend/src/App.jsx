import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import Budgets from './pages/Budgets';
import Upload from './components/Upload';
import Dashboard from './components/Dashboard';
import Insights from './components/Insights';
import Receipts from './components/Receipts';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">

          {/* Navigation is always visible */}
          <Navigation />

          <main className="container mx-auto px-6 pt-24 pb-12 flex-grow">
            <Routes>

              {/* ✅ Public routes — accessible without login */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* 🔒 Protected routes — require authentication */}
              <Route path="/upload" element={
                <ProtectedRoute><Upload /></ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />
              <Route path="/insights" element={
                <ProtectedRoute><Insights /></ProtectedRoute>
              } />
              <Route path="/receipts" element={
                <ProtectedRoute><Receipts /></ProtectedRoute>
              } />
              <Route path="/budgets" element={
                <ProtectedRoute><Budgets /></ProtectedRoute>
              } />

              {/* 🔁 Catch-all — redirect unknown routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;