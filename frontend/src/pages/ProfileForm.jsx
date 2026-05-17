import React, { useEffect, useState } from 'react'
import { API } from '../api/axios'
import { useNavigate } from 'react-router-dom'
import { ZONES } from '../constants/zones'
import { DEPARTMENTS, DEPARTMENTS_WITH_BRANCHES, DEPARTMENTS_WITH_BRANCHES_AND_DESIGNATIONS } from '../constants/departments'
import { PAY_LEVEL_OPTIONS, POSTING_TYPE_OPTIONS, RUNNING_STAFF_OPTIONS } from '../constants/railwayMetadata'

export default function ProfileForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [stationOptions, setStationOptions] = useState([])
  const [profile, setProfile] = useState({
    fullName: '',
    employeeId: '',
    mobile: '',
    email: '',
    railwayZone: '',
    division: '',
    department: '',
    branch: '',
    designation: '',
    payLevel: '',
    postingType: '',
    runningStaffType: '',
    currentStation: '',
    desiredStation: '',
    state: '',
    yearsOfService: '',
    category: '',
    gender: '',
    bio: '',
    photoUrl: ''
  })

  // Load existing profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await API.get('/profiles/me')
        setProfile(res.data)
        setIsEditing(true)
      } catch (err) {
        // New user, no profile yet
        setIsEditing(false)
      }
    }
    loadProfile()
  }, [])

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
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile((prev) => {
      if (name === 'railwayZone') {
        // clear downstream fields when zone changes
        return { ...prev, [name]: value, division: '', department: '', branch: '', designation: '' }
      }
      if (name === 'division') {
        // clear downstream fields when division changes
        return { ...prev, [name]: value, department: '', branch: '', designation: '' }
      }
      if (name === 'department') {
        // clear downstream fields when department changes
        return { ...prev, [name]: value, branch: '', designation: '' }
      }
      if (name === 'branch') {
        // clear designation when branch changes
        return { ...prev, [name]: value, designation: '' }
      }
      return { ...prev, [name]: value }
    })
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      setLoading(true)
      // For now, create object URL. In production, upload to Cloudinary/S3
      const photoUrl = URL.createObjectURL(file)
      setProfile((prev) => ({ ...prev, photoUrl }))
      setMessage({ type: 'success', text: 'Photo uploaded' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload photo' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await API.post('/profiles', profile)
      setMessage({ type: 'success', text: isEditing ? 'Profile updated successfully!' : 'Profile saved successfully!' })
      setTimeout(() => navigate('/'), 2000)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save profile'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <datalist id="station-catalog">
          {stationOptions.map((station) => (
            <option key={station.name} value={station.name}>
              {station.state ? `${station.name} - ${station.state}` : station.name}
            </option>
          ))}
        </datalist>
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2">
            {isEditing ? 'Edit Your Profile' : 'Complete Your Profile'}
          </h1>
          <p className="text-gray-600 mb-6">
            {isEditing
              ? 'Update your information to reflect any changes in your transfer preferences.'
              : 'Fill in your details to be visible to other Railway employees looking for mutual transfers.'}
          </p>

          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {profile.photoUrl && (
                <img
                  src={profile.photoUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
              )}
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <span className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 inline-block">
                  Upload Photo
                </span>
              </label>
              <p className="text-sm text-gray-500 mt-2">JPG, PNG up to 5MB</p>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID *
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={profile.employeeId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="e.g., IR123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="your.email@railways.gov.in"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile *
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={profile.mobile}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="10-digit mobile number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Service
                </label>
                <input
                  type="number"
                  name="yearsOfService"
                  value={profile.yearsOfService}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="e.g., 5"
                />
              </div>
            </div>

            {/* Railway Information */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Railway Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Railway Zone *
                  </label>
                  <select
                    name="railwayZone"
                    value={profile.railwayZone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Select Zone</option>
                    <option value="Central Railway">Central Railway</option>
                    <option value="Eastern Railway">Eastern Railway</option>
                    <option value="East Central Railway">East Central Railway</option>
                    <option value="East Coast Railway">East Coast Railway</option>
                    <option value="Northern Railway">Northern Railway</option>
                    <option value="North Central Railway">North Central Railway</option>
                    <option value="North Eastern Railway">North Eastern Railway</option>
                    <option value="Northeast Frontier Railway">Northeast Frontier Railway</option>
                    <option value="North Western Railway">North Western Railway</option>
                    <option value="Southern Railway">Southern Railway</option>
                    <option value="South Central Railway">South Central Railway</option>
                    <option value="South Eastern Railway">South Eastern Railway</option>
                    <option value="South East Central Railway">South East Central Railway</option>
                    <option value="South Western Railway">South Western Railway</option>
                    <option value="Western Railway">Western Railway</option>
                    <option value="West Central Railway">West Central Railway</option>
                    <option value="Kolkata Metro Railway">Kolkata Metro Railway</option>
                    <option value="South Coast Railway">South Coast Railway</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Division
                  </label>
                  <select
                    name="division"
                    value={profile.division}
                    onChange={handleChange}
                    className="w-full px-4 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Select Division</option>
                    {(ZONES.find((z) => z.zone === profile.railwayZone)?.divisions || []).map((div) => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    name="department"
                    value={profile.department}
                    onChange={handleChange}
                    required
                    disabled={!profile.division}
                    className="w-full px-4 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch/Section *
                  </label>
                  <select
                    name="branch"
                    value={profile.branch}
                    onChange={handleChange}
                    required
                    disabled={!profile.department}
                    className="w-full px-4 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Branch/Section</option>
                    {profile.department && DEPARTMENTS_WITH_BRANCHES[profile.department] && 
                      DEPARTMENTS_WITH_BRANCHES[profile.department].map((branch) => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))
                    }
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Designation *
                  </label>
                  <select
                    name="designation"
                    value={profile.designation}
                    onChange={handleChange}
                    required
                    disabled={!profile.branch}
                    className="w-full px-4 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Designation</option>
                    {profile.department && profile.branch &&
                      (DEPARTMENTS_WITH_BRANCHES_AND_DESIGNATIONS[profile.department]?.[profile.branch] || []).map((designation) => (
                        <option key={designation} value={designation}>
                          {designation}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pay Level *
                  </label>
                  <select
                    name="payLevel"
                    value={profile.payLevel}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {PAY_LEVEL_OPTIONS.map((option) => (
                      <option key={option.value || 'placeholder'} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posting Type
                  </label>
                  <select
                    name="postingType"
                    value={profile.postingType}
                    onChange={handleChange}
                    className="w-full px-4 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {POSTING_TYPE_OPTIONS.map((option) => (
                      <option key={option.value || 'placeholder'} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Running / Non-Running Staff
                  </label>
                  <select
                    name="runningStaffType"
                    value={profile.runningStaffType}
                    onChange={handleChange}
                    className="w-full px-4 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {RUNNING_STAFF_OPTIONS.map((option) => (
                      <option key={option.value || 'placeholder'} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={profile.category}
                    onChange={handleChange}
                    className="w-full px-4 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Select Category</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Posting Information */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Transfer Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Posting Station *
                  </label>
                  <input
                    type="text"
                    name="currentStation"
                    value={profile.currentStation}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="e.g., Delhi Central"
                    list="station-catalog"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desired Transfer Station *
                  </label>
                  <input
                    type="text"
                    name="desiredStation"
                    value={profile.desiredStation}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="e.g., Mumbai Central"
                    list="station-catalog"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={profile.state}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="e.g., Delhi"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="border-t pt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About You
                </label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Tell other employees about yourself..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition"
              >
                {loading ? 'Saving...' : isEditing ? 'Update Profile' : 'Save Profile'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium transition"
              >
                Back to Home
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
