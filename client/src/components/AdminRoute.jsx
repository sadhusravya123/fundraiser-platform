import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-forest-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-2xl shadow-soft text-center border border-red-100">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Forbidden</h2>
        <p className="text-slate-600 mb-6">
          This area is restricted to platform administrators. Your account does not have sufficient permissions.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-2.5 bg-forest-600 hover:bg-forest-700 text-white font-medium rounded-xl transition"
        >
          Return to Home
        </a>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
