// Geolocation utilities for the Runner app

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface LocationError {
  code: number
  message: string
}

// Get current position with timeout and high accuracy
export function getCurrentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser'
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        let message = 'Unknown location error'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable'
            break
          case error.TIMEOUT:
            message = 'Location request timed out'
            break
        }
        reject({
          code: error.code,
          message
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}

// Calculate distance between two points using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in kilometers
  
  return Math.round(distance * 100) / 100 // Round to 2 decimal places
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Check if location permission is granted
export async function checkLocationPermission(): Promise<boolean> {
  if (!navigator.permissions) {
    // Fallback: try to get location directly
    try {
      await getCurrentPosition()
      return true
    } catch {
      return false
    }
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' })
    return result.state === 'granted'
  } catch {
    // Fallback for browsers that don't support permissions API
    try {
      await getCurrentPosition()
      return true
    } catch {
      return false
    }
  }
}

// Request location permission
export async function requestLocationPermission(): Promise<boolean> {
  try {
    await getCurrentPosition()
    return true
  } catch (error) {
    console.error('Location permission denied:', error)
    return false
  }
}

// Filter tasks within radius (in kilometers)
export function filterTasksByRadius(
  userLat: number,
  userLon: number,
  tasks: any[],
  radiusKm: number = 3
): any[] {
  return tasks.filter(task => {
    if (!task.latitude || !task.longitude) return false
    
    const distance = calculateDistance(
      userLat,
      userLon,
      task.latitude,
      task.longitude
    )
    
    return distance <= radiusKm
  })
}

// Sort tasks by distance from user
export function sortTasksByDistance(
  userLat: number,
  userLon: number,
  tasks: any[]
): Array<any & { distance: number }> {
  return tasks
    .map(task => ({
      ...task,
      distance: task.latitude && task.longitude 
        ? calculateDistance(userLat, userLon, task.latitude, task.longitude)
        : Infinity
    }))
    .sort((a, b) => a.distance - b.distance)
}

// Format distance for display
export function formatDistance(distance: number): string {
  if (distance < 0.1) return 'Very close'
  if (distance < 1) return `${Math.round(distance * 1000)}m away`
  return `${distance}km away`
}

// Get approximate address from coordinates (requires reverse geocoding API)
export async function getAddressFromCoordinates(lat: number, lon: number): Promise<string> {
  // This would require a geocoding service like Google Maps API
  // For now, return formatted coordinates
  return `${lat.toFixed(4)}, ${lon.toFixed(4)}`
}