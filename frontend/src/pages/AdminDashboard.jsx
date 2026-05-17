import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API as axios } from '../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
    fetchActivity();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/admin/stats');
      setStats(response.data);
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      const response = await axios.get('/admin/activity');
      setActivity(response.data);
    } catch (err) {
      console.error('Failed to load activity:', err);
    }
  };

  const getInitials = (name = '') =>
    name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const avatarColors = [
    { bg: '#E6F1FB', text: '#0C447C' },
    { bg: '#EEEDFE', text: '#3C3489' },
    { bg: '#E1F5EE', text: '#085041' },
    { bg: '#FAECE7', text: '#712B13' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white border border-red-200 rounded-xl p-6 text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Top bar */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">Last updated just now</p>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Live
          </span>
        </div>

        {/* Nav cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-8">
          <Link
            to="/admin"
            className="bg-white rounded-xl border border-blue-400 p-5 hover:bg-gray-50 transition-colors"
          >
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-2">Overview</p>
            <h2 className="text-base font-medium text-gray-900 mb-1">Dashboard</h2>
            <p className="text-xs text-gray-400 leading-relaxed">Live stats, activity, and totals</p>
          </Link>
          <Link
            to="/admin/users"
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <p className="text-xs font-semibold text-purple-500 uppercase tracking-widest mb-2">Manage</p>
            <h2 className="text-base font-medium text-gray-900 mb-1">Users</h2>
            <p className="text-xs text-gray-400 leading-relaxed">Search, verify, and manage accounts</p>
          </Link>
          <Link
            to="/admin/requests"
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <p className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-2">Review</p>
            <h2 className="text-base font-medium text-gray-900 mb-1">Transfer Requests</h2>
            <p className="text-xs text-gray-400 leading-relaxed">Inspect request status and details</p>
          </Link>
        </div>

        {/* Metric cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-8">
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2">Total users</p>
              <p className="text-3xl font-medium text-gray-900 tracking-tight leading-none">{stats.users.total.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-2">
                <span className="text-green-600 font-medium">↑ this month</span>
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2">Verified</p>
              <p className="text-3xl font-medium text-gray-900 tracking-tight leading-none">{stats.users.verified.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-2">
                <span className="font-medium">{stats.users.unverified}</span> pending
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2">Profiles</p>
              <p className="text-3xl font-medium text-gray-900 tracking-tight leading-none">{stats.profiles.complete.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-2">of <span className="font-medium">{stats.profiles.total}</span> total</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2">Transfers</p>
              <p className="text-3xl font-medium text-gray-900 tracking-tight leading-none">{stats.transfers.total.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-2">
                <span className="text-amber-600 font-medium">{stats.transfers.pending}</span> pending
              </p>
            </div>
          </div>
        )}

        {/* Detailed stats */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">User statistics</h2>
              <div className="space-y-0">
                {[
                  { label: 'Total users', value: stats.users.total, cls: 'text-gray-900' },
                  { label: 'Verified', value: stats.users.verified, cls: 'text-green-600' },
                  { label: 'Unverified', value: stats.users.unverified, cls: 'text-amber-600' },
                  { label: 'Admin accounts', value: stats.users.admins, cls: 'text-purple-600' },
                ].map(({ label, value, cls }) => (
                  <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className={`text-sm font-medium ${cls}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Transfer requests</h2>
              <div className="space-y-0">
                {[
                  { label: 'Total requests', value: stats.transfers.total, cls: 'text-gray-900' },
                  { label: 'Pending', value: stats.transfers.pending, cls: 'text-amber-600' },
                  { label: 'Accepted', value: stats.transfers.accepted, cls: 'text-green-600' },
                  { label: 'Rejected', value: stats.transfers.rejected, cls: 'text-red-500' },
                ].map(({ label, value, cls }) => (
                  <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className={`text-sm font-medium ${cls}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent activity */}
        {activity && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium text-gray-900">Recent activity</h2>
              <Link to="/admin/users" className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1">
                View all <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
              {/* Recent users */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Recent users</h2>
                <div className="space-y-0">
                  {activity.recentUsers.length > 0 ? (
                    activity.recentUsers.map((user, i) => {
                      const color = avatarColors[i % avatarColors.length];
                      return (
                        <div key={user._id} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                              style={{ backgroundColor: color.bg, color: color.text }}
                            >
                              {getInitials(user.name)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                              user.verified
                                ? 'bg-green-50 text-green-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {user.verified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-400">No recent users</p>
                  )}
                </div>
              </div>

              {/* Recent transfer requests */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Recent transfers</h2>
                <div className="space-y-0">
                  {activity.recentRequests.length > 0 ? (
                    activity.recentRequests.map((request) => (
                      <div key={request._id} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                            {request.initiator?.name}
                            <span className="text-gray-300 text-xs">→</span>
                            {request.recipient?.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            request.status === 'accepted'
                              ? 'bg-green-50 text-green-700'
                              : request.status === 'rejected'
                              ? 'bg-red-50 text-red-600'
                              : request.status === 'pending'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">No recent requests</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;