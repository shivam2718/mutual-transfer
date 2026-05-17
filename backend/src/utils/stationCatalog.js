const fs = require('fs')
const path = require('path')

function normalizeStationName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .trim()
}

function isFiniteNumber(value) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

function uniqueValues(values) {
  return Array.from(new Set((values || []).filter(Boolean)))
}

function findStationName(record) {
  const candidateKeys = [
    'name',
    'Name',
    'station',
    'Station',
    'stationName',
    'StationName',
    'station_name',
    'Station_Name',
    'station name',
    'Station Name'
  ]

  for (const key of candidateKeys) {
    if (record && typeof record[key] === 'string' && record[key].trim()) {
      return record[key].trim()
    }
  }

  return ''
}

function findAliases(record) {
  const candidateKeys = ['aliases', 'Aliases', 'alias', 'Alias']
  for (const key of candidateKeys) {
    const value = record && record[key]
    if (Array.isArray(value)) return uniqueValues(value.map((item) => String(item).trim()))
    if (typeof value === 'string' && value.trim()) {
      return uniqueValues(value.split(',').map((item) => item.trim()))
    }
  }
  return []
}

function findState(record) {
  const candidateKeys = ['state', 'State']
  for (const key of candidateKeys) {
    if (record && typeof record[key] === 'string' && record[key].trim()) {
      return record[key].trim()
    }
  }
  return ''
}

function findCoordinates(record) {
  const latKeys = ['lat', 'latitude', 'Latitude', 'Lat']
  const lonKeys = ['lon', 'lng', 'longitude', 'Longitude', 'Lon', 'Lng']

  let lat = null
  let lon = null

  for (const key of latKeys) {
    const numberValue = isFiniteNumber(record && record[key])
    if (numberValue !== null) {
      lat = numberValue
      break
    }
  }

  for (const key of lonKeys) {
    const numberValue = isFiniteNumber(record && record[key])
    if (numberValue !== null) {
      lon = numberValue
      break
    }
  }

  return { lat, lon }
}

function normalizeStationRecord(record) {
  if (!record || typeof record !== 'object') return null

  const name = findStationName(record)
  if (!name) return null

  const aliases = findAliases(record)
  const state = findState(record)
  const { lat, lon } = findCoordinates(record)

  return {
    name,
    aliases,
    state,
    lat,
    lon
  }
}

function readStationRecordsFromFile(filePath) {
  try {
    if (!filePath || !fs.existsSync(filePath)) return []
    const raw = fs.readFileSync(filePath, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.warn(`Unable to load station catalog from ${filePath}:`, err.message)
    return []
  }
}

function resolveStationCatalogPaths() {
  const paths = []

  if (process.env.STATIONS_DATA_PATH) {
    paths.push(process.env.STATIONS_DATA_PATH)
  }

  paths.push(path.join(__dirname, '..', 'data', 'stations.json'))

  const downloadsPath = process.env.USERPROFILE
    ? path.join(process.env.USERPROFILE, 'Downloads', 'stations.json')
    : null

  if (downloadsPath) {
    paths.push(downloadsPath)
  }

  return paths.filter(Boolean)
}

function mergeStationCatalog(baseStations, extraStations) {
  const merged = new Map()

  for (const station of baseStations || []) {
    const normalizedKey = normalizeStationName(station.name)
    if (!normalizedKey) continue
    merged.set(normalizedKey, {
      ...station,
      aliases: uniqueValues(station.aliases || [])
    })
  }

  for (const station of extraStations || []) {
    const normalizedKey = normalizeStationName(station.name)
    if (!normalizedKey) continue

    const existing = merged.get(normalizedKey)
    if (!existing) {
      merged.set(normalizedKey, {
        ...station,
        aliases: uniqueValues(station.aliases || [])
      })
      continue
    }

    merged.set(normalizedKey, {
      ...existing,
      ...station,
      aliases: uniqueValues([...(existing.aliases || []), ...(station.aliases || [])]),
      state: existing.state || station.state,
      lat: existing.lat ?? station.lat,
      lon: existing.lon ?? station.lon
    })
  }

  return Array.from(merged.values())
}

function loadStationCatalog(baseStations = []) {
  const extraStations = []

  for (const filePath of resolveStationCatalogPaths()) {
    const records = readStationRecordsFromFile(filePath)
    if (records.length > 0) {
      extraStations.push(...records.map(normalizeStationRecord).filter(Boolean))
      break
    }
  }

  return mergeStationCatalog(baseStations, extraStations)
}

function getStationSummaries(baseStations = []) {
  return loadStationCatalog(baseStations)
    .map((station) => ({
      name: station.name,
      state: station.state,
      aliases: station.aliases || []
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

module.exports = {
  getStationSummaries,
  loadStationCatalog,
  mergeStationCatalog,
  normalizeStationName
}