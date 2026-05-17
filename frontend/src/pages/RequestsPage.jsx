import React, { useState, useEffect } from 'react'
import { API } from '../api/axios'
import { useNavigate } from 'react-router-dom'

export default function RequestsPage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [blockedUsers, setBlockedUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showBlockedUsers, setShowBlockedUsers] = useState(false)
  const [blockingUserId, setBlockingUserId] = useState(null)
  const [unblockingUserId, setUnblockingUserId] = useState(null)

  useEffect(() => {
    loadCurrentUser()
  }, [filter, statusFilter])

  useEffect(() => {
    if (currentUserId) {
      loadRequests()
    }
  }, [currentUserId, filter, statusFilter])

  const loadCurrentUser = async () => {
    try {
      const res = await API.get('/auth/me')
      setCurrentUserId(res.data?._id || res.data?.user?._id || null)
    } catch (err) {
      console.error('Failed to load current user:', err)
    }
  }

  const loadRequests = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('type', filter)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const [requestsRes, blockedRes] = await Promise.all([
        API.get(`/requests?${params.toString()}`),
        API.get('/requests/blocks'),
      ])

      setRequests(requestsRes.data || [])
      setBlockedUsers(blockedRes.data || [])
    } catch (err) {
      console.error('Failed to load requests:', err)
      setRequests([])
      setBlockedUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleBlockUser = async (userId) => {
    if (!userId) return
    setBlockingUserId(userId)
    try {
      await API.post('/requests/blocks', { blockedUserId: userId })
      await loadRequests()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to block user')
    } finally {
      setBlockingUserId(null)
    }
  }

  const handleUnblockUser = async (userId) => {
    if (!userId) return
    setUnblockingUserId(userId)
    try {
      await API.delete(`/requests/blocks/${userId}`)
      await loadRequests()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unblock user')
    } finally {
      setUnblockingUserId(null)
    }
  }

  const isUserBlocked = (userId) => {
    if (!userId) return false
    return blockedUsers.some((entry) => {
      const blockedId = entry.blocked?._id || entry.blocked
      return blockedId === userId
    })
  }

  const handleAccept = async (requestId) => {
    try {
      await API.put(`/requests/${requestId}/accept`)
      loadRequests()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request')
    }
  }

  const handleReject = async (requestId) => {
    try {
      await API.put(`/requests/${requestId}/reject`)
      loadRequests()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject request')
    }
  }

  const handleWithdraw = async (requestId) => {
    try {
      await API.put(`/requests/${requestId}/withdraw`)
      loadRequests()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to withdraw request')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-100'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'accepted':
        return '✅'
      case 'rejected':
        return '❌'
      case 'withdrawn':
        return '🚫'
      default:
        return '📋'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center py-12 px-4 transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Loading requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 px-4 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-slate-100">Transfer Requests</h1>
        <p className="text-gray-600 dark:text-slate-400 mb-8">
          Manage your transfer requests with other employees
        </p>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md dark:shadow-none border border-gray-200 dark:border-slate-700 p-6 mb-8 transition-colors duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Blocked Users</h2>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Blocked users cannot send you new transfer requests.
              </p>
            </div>
            <button
              onClick={() => setShowBlockedUsers((prev) => !prev)}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-sm font-medium"
            >
              {showBlockedUsers ? 'Hide Blocked Users' : `Show Blocked Users (${blockedUsers.length})`}
            </button>
          </div>

          {showBlockedUsers && (
            <div className="mt-4 border-t border-gray-200 dark:border-slate-700 pt-4">
              {blockedUsers.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-slate-400">No blocked users.</p>
              ) : (
                <div className="space-y-3">
                  {blockedUsers.map((entry) => {
                    const blockedId = entry.blocked?._id || entry.blocked
                    return (
                      <div
                        key={entry._id}
                        className="flex items-center justify-between border border-gray-200 dark:border-slate-700 rounded-lg p-3 bg-gray-50 dark:bg-slate-800/70"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-slate-100">
                            {entry.blocked?.name || 'Unknown user'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-slate-400">
                            {entry.blocked?.email || 'No email'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleUnblockUser(blockedId)}
                          disabled={unblockingUserId === blockedId}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-60"
                        >
                          {unblockingUserId === blockedId ? 'Unblocking...' : 'Unblock'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md dark:shadow-none border border-gray-200 dark:border-slate-700 p-6 mb-8 transition-colors duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Type</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Requests</option>
                <option value="sent">Sent by Me</option>
                <option value="received">Received</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md dark:shadow-none border border-gray-200 dark:border-slate-700 p-8 text-center transition-colors duration-200">
            <p className="text-gray-600 dark:text-slate-400 text-lg mb-4">No requests found</p>
            <button
              onClick={() => navigate('/search')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Find Matches
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const isSent = currentUserId ? request.initiator?._id === currentUserId : false
              const otherUser = isSent ? request.recipient : request.initiator
              const otherProfile = isSent ? request.recipientProfile : request.initiatorProfile
              const otherUserId = otherUser?._id
              const blocked = isUserBlocked(otherUserId)

              return (
                <div
                  key={request._id}
                  className="bg-white dark:bg-slate-900 rounded-lg shadow-md dark:shadow-none border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-lg dark:hover:bg-slate-800/60 transition"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                              {otherProfile?.fullName || otherUser?.name || 'Unknown User'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-slate-400">
                              {isSent ? 'Sent to' : 'Received from'} {otherUser?.email}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}{' '}
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4 text-sm">
                          {otherProfile?.currentStation && (
                            <div>
                              <span className="text-gray-600 dark:text-slate-400">Current Station</span>
                              <p className="font-medium text-gray-900 dark:text-slate-100">{otherProfile.currentStation}</p>
                            </div>
                          )}
                          {otherProfile?.desiredStation && (
                            <div>
                              <span className="text-gray-600 dark:text-slate-400">Desired Station</span>
                              <p className="font-medium text-gray-900 dark:text-slate-100">{otherProfile.desiredStation}</p>
                            </div>
                          )}
                          {otherProfile?.designation && (
                            <div>
                              <span className="text-gray-600 dark:text-slate-400">Designation</span>
                              <p className="font-medium text-gray-900 dark:text-slate-100">{otherProfile.designation}</p>
                            </div>
                          )}
                          {otherProfile?.department && (
                            <div>
                              <span className="text-gray-600 dark:text-slate-400">Department</span>
                              <p className="font-medium text-gray-900 dark:text-slate-100">{otherProfile.department}</p>
                            </div>
                          )}
                        </div>

                        {request.message && (
                          <div className="mt-4 p-3 bg-black-50 dark:bg-slate-950 rounded-lg border border-blue-200 dark:border-slate-600 transition-colors duration-200">
                            <p className="text-sm font-semibold text-gray-900 dark:text-slate-50 mb-1">Message:</p>
                            <p className="text-sm text-white dark:text-slate-100">{request.message}</p>
                          </div>
                        )}

                        <p className="text-xs text-gray-500 dark:text-slate-500 mt-3">
                          {isSent ? 'Sent' : 'Received'} on {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex-shrink-0 flex gap-2 w-full md:w-auto">
                        {request.status === 'pending' && !isSent && (
                          <>
                            <button
                              onClick={() => handleAccept(request._id)}
                              className="flex-1 md:flex-none bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium transition"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleReject(request._id)}
                              className="flex-1 md:flex-none bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium transition"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {request.status === 'pending' && isSent && (
                          <button
                            onClick={() => handleWithdraw(request._id)}
                            className="flex-1 md:flex-none bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm font-medium transition"
                          >
                            Withdraw
                          </button>
                        )}
                        {request.status !== 'pending' && (
                          <button
                            onClick={() => otherProfile?._id && navigate(`/profile/${otherProfile._id}`)}
                            className="flex-1 md:flex-none bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition"
                          >
                            View Profile
                          </button>
                        )}

                        <button
                          onClick={() => handleBlockUser(otherUserId)}
                          disabled={!otherUserId || blocked || blockingUserId === otherUserId}
                          className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition ${
                            blocked ? 'bg-gray-100 text-gray-600 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500' : 'bg-black text-white hover:bg-gray-800'
                          }`}
                        >
                          {blockingUserId === otherUserId ? 'Blocking...' : blocked ? 'Blocked' : 'Block User'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
