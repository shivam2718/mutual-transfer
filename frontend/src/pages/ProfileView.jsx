import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { API } from '../api/axios'

export default function ProfileView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [existingRequest, setExistingRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [showRequestForm, setShowRequestForm] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [id])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const res = await API.get(`/profiles/${id}`)
      const profileData = res.data
      setProfile(profileData)

      const recipientUserId = profileData?.user?._id
      if (recipientUserId) {
        const requestsRes = await API.get('/requests?type=sent')
        const found = (requestsRes.data || []).find((request) => {
          const requestRecipientId = request.recipient?._id || request.recipient
          return requestRecipientId === recipientUserId
        })
        setExistingRequest(found || null)
      } else {
        setExistingRequest(null)
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
      setExistingRequest(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSendRequest = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      await API.post('/requests', {
        recipientId: profile.user._id,
        message
      })
      setMessage('')
      setShowRequestForm(false)
      // Show success message
      alert('Transfer request sent successfully!')
      await loadProfile()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">Profile not found</p>
          <button
            onClick={() => navigate('/search')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Search
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/search')}
          className="mb-6 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        >
          ← Back to Search
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header with Photo */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {profile.photoUrl && (
                <img
                  src={profile.photoUrl}
                  alt={profile.fullName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              )}
              <div className="text-white text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold mb-2">{profile.fullName}</h1>
                <p className="text-blue-100 text-lg mb-2">{profile.designation}</p>
                <div className="flex flex-wrap gap-4 mt-4">
                  <div>
                    <span className="text-blue-100 text-sm">Employee ID:</span>
                    <p className="font-semibold">{profile.employeeId || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-blue-100 text-sm">Gender:</span>
                    <p className="font-semibold">{profile.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-blue-100 text-sm">Years of Service:</span>
                    <p className="font-semibold">{profile.yearsOfService || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-8 space-y-6">
            {/* Railway Information */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-bold mb-4">Railway Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600 text-sm">Railway Zone</span>
                  <p className="font-medium">{profile.railwayZone || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Division</span>
                  <p className="font-medium">{profile.division || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Department</span>
                  <p className="font-medium">{profile.department || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Branch/Section</span>
                  <p className="font-medium">{profile.branch || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Pay Level</span>
                  <p className="font-medium">{profile.payLevel || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Category</span>
                  <p className="font-medium">{profile.category || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">State</span>
                  <p className="font-medium">{profile.state || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Transfer Information */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-bold mb-4">Transfer Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600 text-sm">Current Station</span>
                  <p className="font-medium text-lg">{profile.currentStation || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Desired Station</span>
                  <p className="font-medium text-lg text-green-600">{profile.desiredStation || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div>
                <h2 className="text-xl font-bold mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Verification Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Verification Status:</span>{' '}
                {profile.verified ? (
                  <span className="text-green-600 font-medium">✓ Verified</span>
                ) : (
                  <span className="text-yellow-600 font-medium">⚠ Not Verified</span>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t bg-gray-50 p-8 flex gap-4 flex-wrap">
            {existingRequest && (
              <div className="flex-1 min-w-max rounded-lg border border-gray-300 bg-white px-6 py-3">
                <p className="text-sm text-gray-600">Request Status</p>
                <p className="font-semibold text-gray-900">
                  {existingRequest.status.charAt(0).toUpperCase() + existingRequest.status.slice(1)}
                </p>
              </div>
            )}

            {(!existingRequest || existingRequest.status === 'rejected') && (
              <button
                onClick={() => setShowRequestForm(!showRequestForm)}
                className="flex-1 min-w-max bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition"
              >
                {showRequestForm ? 'Cancel Request' : existingRequest?.status === 'rejected' ? '✉ Send Request Again' : '✉ Send Transfer Request'}
              </button>
            )}
          </div>

          {/* Request Form */}
          {showRequestForm && (!existingRequest || existingRequest.status === 'rejected') && (
            <div className="border-t bg-gray-50 p-8">
              <form onSubmit={handleSendRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={500}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Tell them why you'd like a transfer..."
                  />
                  <p className="text-xs text-gray-500 mt-1">{message.length}/500 characters</p>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                  >
                    {sending ? 'Sending...' : 'Send Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="flex-1 border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
