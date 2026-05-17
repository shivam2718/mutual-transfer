import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../api/axios';

export default function MyMatches() {
  const [matches, setMatches] = useState([]);
  const [requestsByRecipient, setRequestsByRecipient] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const [matchesResponse, requestsResponse] = await Promise.all([
        API.get('/matches'),
        API.get('/requests?type=sent')
      ]);

      setMatches(matchesResponse.data || []);

      const requestsMap = {};
      (requestsResponse.data || []).forEach((request) => {
        const recipientId = request.recipient?._id || request.recipient;
        if (recipientId && !requestsMap[recipientId]) {
          requestsMap[recipientId] = request;
        }
      });
      setRequestsByRecipient(requestsMap);
      setError('');
    } catch (err) {
      console.error('Error fetching matches:', err);
      setMatches([]);
      setRequestsByRecipient({});
      setError(err.response?.data?.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (profileId) => {
    navigate(`/profile/${profileId}`);
  };

  const handleSendRequest = async (recipientId) => {
    try {
      await API.post('/requests', {
        recipientId,
        message: 'Interested in transferring to your station',
      });
      alert('Request sent successfully!');
      fetchMatches();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-blue-600">Loading matches...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Matches</h1>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
            <p className="font-semibold">Note:</p>
            <p>{error}</p>
          </div>
        )}

        {matches.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg mb-4">No matches found yet</p>
            <p className="text-gray-500 text-sm mb-6">Complete your profile and search to find compatible matches for transfer</p>
            <button
              onClick={() => navigate('/search')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Find Matches
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match) => (
              <div
                key={match._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6"
              >
                {(() => {
                  const recipientId = match.user?._id || match.user;
                  const request = recipientId ? requestsByRecipient[recipientId] : null;
                  return (
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {match.fullName || 'Unknown'}
                    </h3>
                    <p className="text-gray-600">
                      {match.designation || 'N/A'}
                    </p>
                  </div>
                  {request && (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        request.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : request.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : request.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)} Request
                    </span>
                  )}
                </div>
                  );
                })()}

                <div className="space-y-2 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Current Station:</p>
                    <p className="font-semibold text-gray-900">
                      {match.currentStation || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Desired Station:</p>
                    <p className="font-semibold text-gray-900">
                      {match.desiredStation || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Department:</p>
                    <p className="font-semibold text-gray-900">
                      {match.department || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleViewProfile(match._id)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    View Profile
                  </button>
                  {(() => {
                    const recipientId = match.user?._id || match.user;
                    const request = recipientId ? requestsByRecipient[recipientId] : null;

                    if (request && request.status !== 'rejected') {
                      return (
                        <button
                          type="button"
                          disabled
                          className="flex-1 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg cursor-not-allowed font-medium"
                        >
                          {request.status === 'pending'
                            ? 'Request Pending'
                            : request.status === 'accepted'
                            ? 'Request Accepted'
                            : 'Request Withdrawn'}
                        </button>
                      )
                    }

                    return (
                      <button
                        onClick={() => handleSendRequest(recipientId)}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        {request?.status === 'rejected' ? 'Send Request Again' : 'Send Request'}
                      </button>
                    )
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
