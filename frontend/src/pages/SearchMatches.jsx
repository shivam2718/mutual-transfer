import React, { useState, useEffect } from 'react'
import { API } from '../api/axios'
import { useNavigate } from 'react-router-dom'
import { ZONES } from '../constants/zones'
import { DEPARTMENTS, DEPARTMENTS_WITH_BRANCHES, DEPARTMENTS_WITH_BRANCHES_AND_DESIGNATIONS } from '../constants/departments'
import { PAY_LEVEL_OPTIONS, POSTING_TYPE_OPTIONS, RUNNING_STAFF_OPTIONS } from '../constants/railwayMetadata'

export default function SearchMatches() {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState([])
  const [requestsByRecipient, setRequestsByRecipient] = useState({})
  const [loading, setLoading] = useState(false)
  const [sendingProfileId, setSendingProfileId] = useState(null)
  const [stationOptions, setStationOptions] = useState([])
  const [filters, setFilters] = useState({
    railwayZone: '',
    division: '',
    department: '',
    branch: '',
    designation: '',
    currentStation: '',
    desiredStation: '',
    payLevel: '',
    postingType: '',
    runningStaffType: '',
    includeNearbyDesiredStations: false,
    includeNearbyCurrentStations: false,
    nearbyRadiusKm: 25
  })

  const requiredSearchFilterFields = [
    'railwayZone',
    'division',
    'department',
    'branch',
    'designation',
    'payLevel',
    'postingType',
    'runningStaffType'
  ]

  const areSearchFiltersComplete = requiredSearchFilterFields.every((field) => {
    const value = filters[field]
    return value !== undefined && value !== null && String(value).trim() !== ''
  })

  const profileFieldGroups = [
    {
      title: 'Railway',
      fields: [
        { name: 'railwayZone', label: 'Railway Zone', type: 'select', options: ['', 'Central Railway', 'Eastern Railway', 'East Central Railway', 'East Coast Railway', 'Northern Railway', 'North Central Railway', 'North Eastern Railway', 'Northeast Frontier Railway', 'North Western Railway', 'Southern Railway', 'South Central Railway', 'South Eastern Railway', 'South East Central Railway', 'South Western Railway', 'Western Railway', 'West Central Railway', 'Kolkata Metro Railway', 'South Coast Railway'] },
        { name: 'division', label: 'Division', type: 'text', placeholder: 'Search by division' },
        { name: 'department', label: 'Department', type: 'select', options: ['', ...DEPARTMENTS] },
        { name: 'branch', label: 'Branch/Section', type: 'select', options: [] },
        { name: 'designation', label: 'Designation', type: 'text', placeholder: 'e.g., Engineer' },
        { name: 'payLevel', label: 'Pay Level / Grade Pay', type: 'select', options: PAY_LEVEL_OPTIONS.map((option) => option.value), optionsMeta: PAY_LEVEL_OPTIONS },
        { name: 'postingType', label: 'Posting Type', type: 'select', options: POSTING_TYPE_OPTIONS.map((option) => option.value), optionsMeta: POSTING_TYPE_OPTIONS },
        { name: 'runningStaffType', label: 'Running / Non-Running', type: 'select', options: RUNNING_STAFF_OPTIONS.map((option) => option.value), optionsMeta: RUNNING_STAFF_OPTIONS }
      ]
    },
    {
      title: 'Transfer Preferences',
      fields: [
        { name: 'currentStation', label: 'Current Station', type: 'text', placeholder: 'e.g., Delhi Central' },
        { name: 'desiredStation', label: 'Desired Station', type: 'text', placeholder: 'e.g., Mumbai Central' }
      ]
    }
  ]

  useEffect(() => {
    async function loadStationOptions() {
      try {
        const res = await API.get('/profiles/stations')
        setStationOptions(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        console.error('Failed to fetch station catalog:', err)
      }
    }

    loadStationOptions()
    searchProfiles()
  }, [])

  const searchProfiles = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return
        queryParams.append(key, String(value))
      })

      const [profilesRes, requestsRes] = await Promise.all([
        API.get(`/profiles?${queryParams.toString()}`),
        API.get('/requests?type=sent')
      ])

      setProfiles(profilesRes.data || [])

      const requestsMap = {}
      ;(requestsRes.data || []).forEach((request) => {
        const recipientId = request.recipient?._id || request.recipient
        if (recipientId && !requestsMap[recipientId]) {
          requestsMap[recipientId] = request
        }
      })
      setRequestsByRecipient(requestsMap)
    } catch (err) {
      console.error('Failed to fetch profiles:', err)
      setProfiles([])
      setRequestsByRecipient({})
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => {
      if (name === 'railwayZone') {
        return { ...prev, [name]: value, division: '', department: '', branch: '', designation: '' }
      }
      if (name === 'division') {
        return { ...prev, [name]: value, department: '', branch: '', designation: '' }
      }
      if (name === 'department') {
        return { ...prev, [name]: value, branch: '', designation: '' }
      }
      if (name === 'branch') {
        return { ...prev, [name]: value, designation: '' }
      }
      return { ...prev, [name]: value }
    })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    searchProfiles()
  }

  const handleClearFilters = () => {
    setFilters({
      railwayZone: '',
      division: '',
      department: '',
      branch: '',
      designation: '',
      currentStation: '',
      desiredStation: '',
      payLevel: '',
      postingType: '',
      runningStaffType: '',
      includeNearbyDesiredStations: false,
      includeNearbyCurrentStations: false,
      nearbyRadiusKm: 25
    })
  }

  const renderField = (field) => {
    const commonClassName = 'w-full px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm'
    const isTransferPreferenceField = field.name === 'currentStation' || field.name === 'desiredStation'

    if (field.name === 'division') {
      const divisions = ZONES.find((z) => z.zone === filters.railwayZone)?.divisions || []
      return (
        <select
          name="division"
          value={filters.division}
          onChange={handleFilterChange}
          className={commonClassName}
        >
          <option value="">{filters.railwayZone ? `All Divisions` : 'Select a Railway Zone first'}</option>
          {divisions.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      )
    }

    if (field.name === 'branch') {
      const branches = filters.department ? DEPARTMENTS_WITH_BRANCHES[filters.department] || [] : []
      return (
        <select
          name="branch"
          value={filters.branch}
          onChange={handleFilterChange}
          disabled={!filters.department}
          className={`${commonClassName} disabled:bg-gray-100 disabled:cursor-not-allowed`}
        >
          <option value="">{filters.department ? `All Branches` : 'Select a Department first'}</option>
          {branches.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      )
    }

    if (field.name === 'designation') {
      const designations =
        filters.department && filters.branch
          ? DEPARTMENTS_WITH_BRANCHES_AND_DESIGNATIONS[filters.department]?.[filters.branch] || []
          : []
      return (
        <select
          name="designation"
          value={filters.designation}
          onChange={handleFilterChange}
          disabled={!filters.branch}
          className={`${commonClassName} disabled:bg-gray-100 disabled:cursor-not-allowed`}
        >
          <option value="">{filters.branch ? `All Designations` : 'Select a Branch first'}</option>
          {designations.map((designation) => (
            <option key={designation} value={designation}>{designation}</option>
          ))}
        </select>
      )
    }

    if (field.name === 'department') {
      return (
        <select
          name="department"
          value={filters.department}
          onChange={handleFilterChange}
          disabled={!filters.division}
          className={`${commonClassName} disabled:bg-gray-100 disabled:cursor-not-allowed`}
        >
          <option value="">{filters.division ? `All Departments` : 'Select a Division first'}</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      )
    }

    if (field.type === 'select') {
      const optionsMeta = field.optionsMeta || []
      return (
        <select
          name={field.name}
          value={filters[field.name]}
          onChange={handleFilterChange}
          className={commonClassName}
        >
          {field.options.map((option) => {
            const meta = optionsMeta.find((entry) => entry.value === option)
            const label = meta ? meta.label : (option || `All ${field.label}`)
            return (
              <option key={option || 'all'} value={option}>
                {label}
              </option>
            )
          })}
        </select>
      )
    }

    return (
      <input
        type={field.type}
        name={field.name}
        value={filters[field.name]}
        onChange={handleFilterChange}
        className={`${commonClassName} ${isTransferPreferenceField && !areSearchFiltersComplete ? 'disabled:bg-gray-100 disabled:cursor-not-allowed' : ''}`}
        placeholder={
          isTransferPreferenceField && !areSearchFiltersComplete
            ? 'Complete Search Filters first'
            : field.placeholder
        }
        disabled={isTransferPreferenceField && !areSearchFiltersComplete}
        list={field.name === 'currentStation' || field.name === 'desiredStation' ? 'station-catalog' : undefined}
      />
    )
  }

  const handleSendRequest = async (profile, e) => {
    e.stopPropagation()
    setSendingProfileId(profile._id)
    try {
      await API.post('/requests', {
        recipientId: profile.user?._id,
        message: `Hi ${profile.fullName || 'there'}, I'd like to discuss a mutual transfer.`
      })
      alert('Transfer request sent successfully!')
      searchProfiles()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request')
    } finally {
      setSendingProfileId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <datalist id="station-catalog">
          {stationOptions.map((station) => (
            <option key={station.name} value={station.name}>
              {station.state ? `${station.name} - ${station.state}` : station.name}
            </option>
          ))}
        </datalist>
        <h1 className="text-3xl font-bold mb-2">Find Transfer Matches</h1>
        <p className="text-gray-600 mb-8">
          Search for employees looking for mutual transfers matching your criteria
        </p>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Search Filters</h2>
          <form onSubmit={handleSearch}>
            <div className="space-y-6 mb-6">
              {profileFieldGroups.map((group) => (
                <div key={group.title} className="rounded-2xl border border-gray-200 p-4 bg-gray-50/70">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600 mb-4">
                    {group.title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.fields.map((field) => (
                      <div key={field.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field.label}
                        </label>
                        {renderField(field)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 p-5">
  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
    Nearby Stations Search
  </h3>

  <div className="flex flex-wrap items-start gap-6">

    {/* Checkboxes */}
    <div className="flex flex-col gap-2.5 flex-1 min-w-[220px]">
      <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={filters.includeNearbyDesiredStations}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, includeNearbyDesiredStations: e.target.checked }))
          }
          disabled={!areSearchFiltersComplete}
          className="h-4 w-4 rounded border-gray-300 accent-blue-600 cursor-pointer shrink-0"
        />
        <span className="text-sm font-medium text-slate-800">
          Include nearby for <strong className="text-blue-600">desired</strong> station
        </span>
      </label>

      <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={filters.includeNearbyCurrentStations}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, includeNearbyCurrentStations: e.target.checked }))
          }
          disabled={!areSearchFiltersComplete}
          className="h-4 w-4 rounded border-gray-300 accent-blue-600 cursor-pointer shrink-0"
        />
        <span className="text-sm font-medium text-slate-800">
          Include nearby for <strong className="text-blue-600">current</strong> station
        </span>
      </label>

      <p className="text-xs text-slate-500 leading-relaxed">
        Expands search to include stations within the selected radius.
      </p>
    </div>

    {/* Vertical divider */}
    <div className="self-stretch w-px bg-blue-200 hidden sm:block" />

    {/* Radius input */}
    <div className="flex flex-col gap-1 min-w-[140px]">
      <label className="text-xs font-semibold text-gray-700">
        Radius (km)
      </label>
      <input
        type="number"
        min="1"
        max="500"
        name="nearbyRadiusKm"
        value={filters.nearbyRadiusKm}
        onChange={handleFilterChange}
        disabled={!areSearchFiltersComplete || (!filters.includeNearbyDesiredStations && !filters.includeNearbyCurrentStations)}
        className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-white shadow-sm text-sm text-slate-800
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
      />
      <span className="text-xs text-slate-400">Range: 1 – 500 km</span>
    </div>

  </div>
</div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm"
              >
                Clear Filters
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Results ({profiles.length})
          </h2>

          {profiles.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 text-lg">
                {loading ? 'Loading profiles...' : 'No profiles found matching your criteria'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile) => (
                (() => {
                  const recipientId = profile.user?._id || profile.user
                  const existingRequest = recipientId ? requestsByRecipient[recipientId] : null
                  const status = existingRequest?.status

                  return (
                <div
                  key={profile._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                  onClick={() => navigate(`/profile/${profile._id}`)}
                >
                  {/* Profile Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                    {profile.photoUrl ? (
                      <img
                        src={profile.photoUrl}
                        alt={profile.fullName}
                        className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-4 border-white"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full mx-auto mb-3 border-4 border-white bg-white/20 flex items-center justify-center text-2xl font-bold">
                        {profile.fullName?.[0]?.toUpperCase() || '👤'}
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-center">{profile.fullName}</h3>
                    <p className="text-blue-100 text-center text-sm">{profile.designation}</p>
                  </div>

                  {/* Profile Details */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">🏢 Department</span>
                      <span className="font-medium text-gray-900 text-sm">{profile.department}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">📍 Current</span>
                      <span className="font-medium text-gray-900 text-sm">
                        {profile.currentStation}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">🎯 Desired</span>
                      <span className="font-medium text-gray-900 text-sm">
                        {profile.desiredStation}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">💼 Level</span>
                      <span className="font-medium text-gray-900 text-sm">{profile.payLevel}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">🏛️ Zone</span>
                      <span className="font-medium text-gray-900 text-sm">{profile.railwayZone}</span>
                    </div>

                    {status && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">📋 Request</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                    )}

                    {profile.bio && (
                      <div className="pt-2 border-t">
                        <p className="text-gray-600 text-xs line-clamp-2">{profile.bio}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t p-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // View profile
                        navigate(`/profile/${profile._id}`)
                      }}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={(e) => {
                        handleSendRequest(profile, e)
                      }}
                      disabled={
                        sendingProfileId === profile._id ||
                        !profile.user?._id ||
                        Boolean(existingRequest && existingRequest.status !== 'rejected')
                      }
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                        existingRequest && existingRequest.status !== 'rejected'
                          ? 'border border-gray-300 text-gray-500 bg-gray-100 cursor-not-allowed'
                          : 'border border-blue-600 text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {sendingProfileId === profile._id
                        ? 'Sending...'
                        : existingRequest && existingRequest.status !== 'rejected'
                        ? `Request ${status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Sent'}`
                        : existingRequest?.status === 'rejected'
                        ? 'Send Request Again'
                        : 'Send Request'}
                    </button>
                  </div>
                </div>
                  )
                })()
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
