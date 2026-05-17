const { loadStationCatalog, normalizeStationName } = require('./stationCatalog')

const BASE_STATIONS = [
  { name: 'New Delhi', aliases: ['Delhi', 'Delhi Central', 'NDLS'], lat: 28.6429, lon: 77.2195 },
  { name: 'Delhi Cantt', aliases: ['Delhi Cantt', 'Delhi Cantonment'], lat: 28.5912, lon: 77.1171 },
  { name: 'Old Delhi', aliases: ['Delhi Junction', 'Old Delhi'], lat: 28.6562, lon: 77.2385 },
  { name: 'Patna Junction', aliases: ['Patna', 'PNBE'], lat: 25.5961, lon: 85.1376 },
  { name: 'Howrah Junction', aliases: ['Howrah', 'HWH'], lat: 22.5850, lon: 88.3426 },
  { name: 'Sealdah', aliases: ['Sealdah Station'], lat: 22.5673, lon: 88.3710 },
  { name: 'Mumbai CST', aliases: ['CST', 'Chhatrapati Shivaji Terminus', 'Mumbai CSMT'], lat: 18.9402, lon: 72.8356 },
  { name: 'Mumbai Central', aliases: ['Mumbai Central Station'], lat: 18.9696, lon: 72.8194 },
  { name: 'Bandra Terminus', aliases: ['Bandra'], lat: 19.0544, lon: 72.8409 },
  { name: 'Borivali', aliases: ['Borivali Station'], lat: 19.2293, lon: 72.8578 },
  { name: 'Chennai Central', aliases: ['Chennai', 'Madras Central', 'MAS'], lat: 13.0827, lon: 80.2750 },
  { name: 'Bengaluru City', aliases: ['Bangalore', 'KSR Bengaluru', 'SBC'], lat: 12.9756, lon: 77.5727 },
  { name: 'Hyderabad Deccan', aliases: ['Hyderabad', 'Nampally', 'HYB'], lat: 17.3984, lon: 78.4898 },
  { name: 'Secunderabad Junction', aliases: ['Secunderabad', 'SC'], lat: 17.4399, lon: 78.4983 },
  { name: 'Pune Junction', aliases: ['Pune', 'PUNE'], lat: 18.5288, lon: 73.8743 },
  { name: 'Nagpur', aliases: ['NGP'], lat: 21.1458, lon: 79.0882 },
  { name: 'Bhopal Junction', aliases: ['Bhopal', 'BPL'], lat: 23.2599, lon: 77.4126 },
  { name: 'Indore Junction', aliases: ['Indore', 'INDB'], lat: 22.7196, lon: 75.8577 },
  { name: 'Ahmedabad Junction', aliases: ['Ahmedabad', 'ADI'], lat: 23.0205, lon: 72.5873 },
  { name: 'Vadodara Junction', aliases: ['Vadodara', 'BRC'], lat: 22.3072, lon: 73.1812 },
  { name: 'Surat', aliases: ['ST'], lat: 21.1702, lon: 72.8311 },
  { name: 'Jaipur Junction', aliases: ['Jaipur', 'JP'], lat: 26.9124, lon: 75.7873 },
  { name: 'Lucknow Charbagh', aliases: ['Lucknow', 'LKO'], lat: 26.8390, lon: 80.9231 },
  { name: 'Kanpur Central', aliases: ['Kanpur', 'CNB'], lat: 26.4499, lon: 80.3319 },
  { name: 'Varanasi Junction', aliases: ['Varanasi', 'BSB'], lat: 25.3176, lon: 82.9739 },
  { name: 'Prayagraj Junction', aliases: ['Allahabad', 'Prayagraj', 'PRYJ'], lat: 25.4358, lon: 81.8463 },
  { name: 'Gaya Junction', aliases: ['Gaya', 'GAYA'], lat: 24.7969, lon: 85.0023 },
  { name: 'Dhanbad Junction', aliases: ['Dhanbad', 'DHN'], lat: 23.7957, lon: 86.4304 },
  { name: 'Asansol Junction', aliases: ['Asansol', 'ASN'], lat: 23.6833, lon: 86.9661 },
  { name: 'Ranchi', aliases: ['RNC'], lat: 23.3441, lon: 85.3096 },
  { name: 'Bhubaneswar', aliases: ['BBS'], lat: 20.2961, lon: 85.8245 },
  { name: 'Cuttack', aliases: ['CTC'], lat: 20.4625, lon: 85.8828 },
  { name: 'Guwahati', aliases: ['GHY'], lat: 26.1445, lon: 91.7362 },
  { name: 'Siliguri Junction', aliases: ['Siliguri', 'SGUJ'], lat: 26.7271, lon: 88.3953 },
  { name: 'Raipur Junction', aliases: ['Raipur', 'R'], lat: 21.2514, lon: 81.6296 },
  { name: 'Bilaspur Junction', aliases: ['Bilaspur', 'BSP'], lat: 22.0797, lon: 82.1409 },
  { name: 'Jabalpur', aliases: ['Jabalpur', 'JBP'], lat: 23.1815, lon: 79.9864 },
  { name: 'Kota Junction', aliases: ['Kota', 'KOTA'], lat: 25.2138, lon: 75.8648 },
  { name: 'Agra Cantt', aliases: ['Agra', 'AGC'], lat: 27.1591, lon: 78.0131 },
  { name: 'Chandigarh', aliases: ['CDG'], lat: 30.7333, lon: 76.7794 },
  { name: 'Amritsar Junction', aliases: ['Amritsar', 'ASR'], lat: 31.6340, lon: 74.8723 },
  { name: 'Jammu Tawi', aliases: ['Jammu', 'JAT'], lat: 32.7270, lon: 74.8570 },
  { name: 'Mangalore Central', aliases: ['Mangalore', 'MAQ'], lat: 12.8707, lon: 74.8408 },
  { name: 'Kozhikode', aliases: ['Calicut', 'CLT'], lat: 11.2588, lon: 75.7804 },
  { name: 'Ernakulam Junction', aliases: ['Ernakulam', 'ERS'], lat: 9.9816, lon: 76.2999 },
  { name: 'Thiruvananthapuram Central', aliases: ['Trivandrum', 'TVC'], lat: 8.4878, lon: 76.9522 },
  { name: 'Madurai Junction', aliases: ['Madurai', 'MDU'], lat: 9.9170, lon: 78.1198 },
  { name: 'Tirupati', aliases: ['TPTY'], lat: 13.6288, lon: 79.4192 },
  { name: 'Vijayawada Junction', aliases: ['Vijayawada', 'BZA'], lat: 16.5062, lon: 80.6480 },
  { name: 'Visakhapatnam', aliases: ['Vizag', 'VSKP'], lat: 17.6868, lon: 83.2185 }
]

const STATIONS = loadStationCatalog(BASE_STATIONS)

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function haversineDistanceKm(a, b) {
  const radius = 6371
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const deltaLat = ((b.lat - a.lat) * Math.PI) / 180
  const deltaLon = ((b.lon - a.lon) * Math.PI) / 180

  const sinLat = Math.sin(deltaLat / 2)
  const sinLon = Math.sin(deltaLon / 2)
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon

  return 2 * radius * Math.asin(Math.sqrt(h))
}

function resolveStation(value) {
  const normalized = normalizeStationName(value)
  if (!normalized) return null

  const exactMatch = STATIONS.find((station) => {
    if (normalizeStationName(station.name) === normalized) return true
    return (station.aliases || []).some((alias) => normalizeStationName(alias) === normalized)
  })

  if (exactMatch) return exactMatch

  return (
    STATIONS.find((station) => {
      const stationName = normalizeStationName(station.name)
      if (stationName.includes(normalized) || normalized.includes(stationName)) return true
      return (station.aliases || []).some((alias) => {
        const normalizedAlias = normalizeStationName(alias)
        return normalizedAlias.includes(normalized) || normalized.includes(normalizedAlias)
      })
    }) || null
  )
}

function buildNearbyStationConditions(stationName, radiusKm) {
  const origin = resolveStation(stationName)
  if (!origin) return []

  const maxRadiusKm = Math.max(1, Math.min(Number(radiusKm) || 0, 500))
  const stationTerms = new Set()

  for (const station of STATIONS) {
    const distanceKm = haversineDistanceKm(origin, station)
    if (distanceKm <= maxRadiusKm) {
      stationTerms.add(station.name)
      for (const alias of station.aliases || []) {
        stationTerms.add(alias)
      }
    }
  }

  return Array.from(stationTerms).map((term) => ({
    desiredStation: { $regex: `^${escapeRegex(term)}$`, $options: 'i' }
  }))
}

module.exports = {
  buildNearbyStationConditions,
  haversineDistanceKm,
  resolveStation,
  normalizeStationName
}