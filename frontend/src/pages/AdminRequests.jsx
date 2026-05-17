import React, { useState, useEffect } from 'react';
import { API as axios } from '../api/axios';

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/requests', {
        params: {
          page,
          limit: 10,
          status: statusFilter || undefined
        }
      });
      setRequests(response.data.requests);
      setTotalPages(response.data.pagination.pages);
      setError('');
    } catch (err) {
      setError('Failed to load requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (requestId) => {
    try {
      const response = await axios.get(`/admin/requests/${requestId}`);
      setSelectedRequest(response.data);
    } catch (err) {
      console.error('Failed to load request details:', err);
      setError('Failed to load request details');
    }
  };

  if (loading && page === 1) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-600 dark:text-slate-400">Loading requests...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100 mb-8">Transfer Request Management</h1>

        {error && (
          <div className="p-4 mb-4 text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300 rounded border border-red-200 dark:border-red-900/40">
            {error}
          </div>
        )}

        {/* Filter Bar */}
        <div className="mb-6 flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>

        {/* Requests Table */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-none border border-gray-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">From</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">To</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? (
                requests.map((request) => (
                  <tr key={request._id} className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-100/70 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-100">
                      {request.initiator?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-100">
                      {request.recipient?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          request.status === 'accepted'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : request.status === 'rejected'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            : request.status === 'withdrawn'
                            ? 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-100'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleViewDetails(request._id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-slate-400">
                    No requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800"
          >
            Previous
          </button>
          <span className="text-gray-600 dark:text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800"
          >
            Next
          </button>
        </div>

        {/* Request Details Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg dark:shadow-none border border-gray-200 dark:border-slate-700 max-w-2xl w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Transfer Request Details</h2>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-slate-400">Initiator</p>
                      <p className="font-medium text-gray-900 dark:text-slate-100">
                        {selectedRequest.initiator?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-500">{selectedRequest.initiator?.email}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-500">{selectedRequest.initiator?.mobile}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-slate-400">Recipient</p>
                      <p className="font-medium text-gray-900 dark:text-slate-100">
                        {selectedRequest.recipient?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-500">{selectedRequest.recipient?.email}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-500">{selectedRequest.recipient?.mobile}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Status</p>
                    <p
                      className={`text-lg font-semibold ${
                        selectedRequest.status === 'accepted'
                          ? 'text-green-600 dark:text-green-300'
                          : selectedRequest.status === 'rejected'
                          ? 'text-red-600 dark:text-red-300'
                          : selectedRequest.status === 'pending'
                          ? 'text-yellow-600 dark:text-yellow-300'
                          : 'text-gray-600 dark:text-slate-400'
                      }`}
                    >
                      {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                    </p>
                  </div>

                  {selectedRequest.message && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-slate-400">Message</p>
                      <div className="mt-2 p-3 bg-gray-50 dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700">
                        <p className="text-gray-700 dark:text-slate-200">{selectedRequest.message}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-slate-400">Created</p>
                      <p className="font-medium text-gray-900 dark:text-slate-100">
                        {new Date(selectedRequest.createdAt).toLocaleDateString()}{' '}
                        {new Date(selectedRequest.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-slate-400">Updated</p>
                      <p className="font-medium text-gray-900 dark:text-slate-100">
                        {new Date(selectedRequest.updatedAt).toLocaleDateString()}{' '}
                        {new Date(selectedRequest.updatedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRequests;
