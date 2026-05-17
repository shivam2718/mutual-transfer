import React, { useState, useEffect, useRef } from 'react';
import { API as axios } from '../api/axios';

const avatarColors = [
  { bg: '#E6F1FB', text: '#0C447C' },
  { bg: '#EEEDFE', text: '#3C3489' },
  { bg: '#E1F5EE', text: '#085041' },
  { bg: '#FAECE7', text: '#712B13' },
  { bg: '#FAEEDA', text: '#854F0B' },
  { bg: '#EAF3DE', text: '#3B6D11' },
];

const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

const Avatar = ({ name, index = 0 }) => {
  const color = avatarColors[index % avatarColors.length];
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {getInitials(name)}
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
    <p className="text-sm font-medium text-gray-900 break-words">{value === undefined || value === null || value === '' ? 'N/A' : value}</p>
  </div>
);

const formatValue = (value) => (value === undefined || value === null || value === '' ? 'N/A' : value);

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
};

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => { fetchUsers(); }, [page]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') { setSelectedUser(null); setDeleteConfirm(null); } };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/users', { params: { page, limit: 10 } });
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.pages);
      setError('');
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId, verify) => {
    setActionLoading(userId);
    try {
      await axios.put(`/admin/users/${userId}/${verify ? 'verify' : 'unverify'}`);
      await fetchUsers();
    } catch (err) {
      setError(`Failed to ${verify ? 'verify' : 'unverify'} user`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    setActionLoading(userId);
    try {
      await axios.delete(`/admin/users/${userId}`);
      setDeleteConfirm(null);
      await fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = async (userId) => {
    try {
      const response = await axios.get(`/admin/users/${userId}`);
      setSelectedUser(response.data);
    } catch (err) {
      setError('Failed to load user details');
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile?.includes(searchTerm)
  );

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-gray-900 tracking-tight">User Management</h1>
            <p className="text-sm text-gray-400 mt-1">Search, verify, and manage all accounts</p>
          </div>
          {!loading && (
            <span className="text-sm text-gray-400">
              Page <span className="font-medium text-gray-700">{page}</span> of{' '}
              <span className="font-medium text-gray-700">{totalPages}</span>
            </span>
          )}
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center justify-between">
            {error}
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-4 text-lg leading-none">×</button>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-5">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
            >×</button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <p className="text-gray-400 text-sm">No users found</p>
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="text-xs text-blue-500 hover:underline">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Mobile</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, i) => (
                  <tr key={user._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-100/70 dark:hover:bg-slate-800/60 transition-colors">
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} index={i} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    {/* Mobile */}
                    <td className="px-5 py-3.5 text-sm text-gray-500">{user.mobile}</td>
                    {/* Role */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.role === 'admin' ? 'bg-purple-500' : 'bg-blue-400'}`} />
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                        user.verified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.verified ? 'bg-green-500' : 'bg-amber-400'}`} />
                        {user.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewDetails(user._id)}
                          className="text-xs font-medium text-blue-500 hover:text-blue-700 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          View →
                        </button>
                        {actionLoading === user._id ? (
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mx-2" />
                        ) : (
                          <>
                            {!user.verified ? (
                              <button
                                onClick={() => handleVerify(user._id, true)}
                                className="text-xs font-medium text-green-600 hover:text-green-800 px-2.5 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
                              >
                                Verify
                              </button>
                            ) : (
                              <button
                                onClick={() => handleVerify(user._id, false)}
                                className="text-xs font-medium text-amber-600 hover:text-amber-800 px-2.5 py-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                              >
                                Unverify
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteConfirm(user)}
                              className="text-xs font-medium text-red-400 hover:text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-5 flex items-center justify-between">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '…' ? (
                  <span key={`e-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      p === page ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-6 pt-6 pb-2">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h2 className="text-base font-medium text-gray-900 mb-1">Delete user?</h2>
              <p className="text-sm text-gray-500">
                This will permanently delete <span className="font-medium text-gray-800">{deleteConfirm.name}</span>. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 px-6 py-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirm._id)}
                disabled={actionLoading === deleteConfirm._id}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {actionLoading === deleteConfirm._id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedUser(null); }}
        >
          <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Avatar name={selectedUser.user.name} index={0} />
                <div>
                  <h2 className="text-base font-medium text-gray-900">{selectedUser.user.name}</h2>
                  <p className="text-xs text-gray-400">
                    Member since{' '}
                    {new Date(selectedUser.user.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                  selectedUser.user.verified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedUser.user.verified ? 'bg-green-500' : 'bg-amber-400'}`} />
                  {selectedUser.user.verified ? 'Verified' : 'Pending'}
                </span>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-lg leading-none"
                >×</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Account info */}
              <div className="px-6 py-5 border-b border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Account</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow label="Name" value={formatValue(selectedUser.user.name)} />
                  <InfoRow label="Email" value={formatValue(selectedUser.user.email)} />
                  <InfoRow label="Mobile" value={formatValue(selectedUser.user.mobile)} />
                  <InfoRow label="Provider" value={formatValue(selectedUser.user.provider)} />
                  <InfoRow label="Role" value={formatValue(selectedUser.user.role?.charAt(0).toUpperCase() + selectedUser.user.role?.slice(1))} />
                  <InfoRow label="Verified" value={selectedUser.user.verified ? 'Yes' : 'No'} />
                  <InfoRow label="User ID" value={formatValue(selectedUser.user._id)} />
                  <InfoRow label="Google ID" value={formatValue(selectedUser.user.googleId)} />
                  <InfoRow label="Created At" value={formatDateTime(selectedUser.user.createdAt)} />
                  <InfoRow label="Updated At" value={formatDateTime(selectedUser.user.updatedAt)} />
                </div>
              </div>

              {/* Profile info */}
              {selectedUser.profile ? (
                <div className="px-6 py-5 border-b border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Profile</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoRow label="Full Name" value={formatValue(selectedUser.profile.fullName)} />
                    <InfoRow label="Employee ID" value={formatValue(selectedUser.profile.employeeId)} />
                    <InfoRow label="Email" value={formatValue(selectedUser.profile.email)} />
                    <InfoRow label="Mobile" value={formatValue(selectedUser.profile.mobile)} />
                    <InfoRow label="Railway Zone" value={formatValue(selectedUser.profile.railwayZone)} />
                    <InfoRow label="Division" value={formatValue(selectedUser.profile.division)} />
                    <InfoRow label="Department" value={formatValue(selectedUser.profile.department)} />
                    <InfoRow label="Branch" value={formatValue(selectedUser.profile.branch)} />
                    <InfoRow label="Designation" value={formatValue(selectedUser.profile.designation)} />
                    <InfoRow label="Pay Level" value={formatValue(selectedUser.profile.payLevel)} />
                    <InfoRow label="Posting Type" value={formatValue(selectedUser.profile.postingType)} />
                    <InfoRow label="Running Staff Type" value={formatValue(selectedUser.profile.runningStaffType)} />
                    <InfoRow label="Current Station" value={formatValue(selectedUser.profile.currentStation)} />
                    <InfoRow label="Desired Station" value={formatValue(selectedUser.profile.desiredStation)} />
                    <InfoRow label="State" value={formatValue(selectedUser.profile.state)} />
                    <InfoRow label="Years of Service" value={formatValue(selectedUser.profile.yearsOfService)} />
                    <InfoRow label="Category" value={formatValue(selectedUser.profile.category)} />
                    <InfoRow label="Gender" value={formatValue(selectedUser.profile.gender)} />
                    <InfoRow label="Profile Verified" value={selectedUser.profile.verified ? 'Yes' : 'No'} />
                    <InfoRow label="Created At" value={formatDateTime(selectedUser.profile.createdAt)} />
                    <InfoRow label="Updated At" value={formatDateTime(selectedUser.profile.updatedAt)} />
                  </div>

                  {selectedUser.profile.bio && (
                    <div className="mt-4">
                      <InfoRow label="Bio" value={selectedUser.profile.bio} />
                    </div>
                  )}

                  {selectedUser.profile.photoUrl && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-[120px_minmax(0,1fr)] gap-4 items-start">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Photo</p>
                        <img
                          src={selectedUser.profile.photoUrl}
                          alt={selectedUser.user.name}
                          className="w-24 h-24 rounded-xl object-cover border border-gray-200"
                        />
                      </div>
                      <InfoRow label="Photo URL" value={selectedUser.profile.photoUrl} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-6 py-5 border-b border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Profile</p>
                  <p className="text-sm text-gray-500">No profile details available.</p>
                </div>
              )}

              {/* Stats */}
              {selectedUser.stats && (
                <div className="px-6 py-5">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Activity</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">Sent requests</p>
                      <p className="text-2xl font-medium text-gray-900 tracking-tight">{selectedUser.stats.sentRequests}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">Received requests</p>
                      <p className="text-2xl font-medium text-gray-900 tracking-tight">{selectedUser.stats.receivedRequests}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;