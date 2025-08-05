// Geolocation utilities for the Runner app

// Browser detection utility
export function isSafariBrowser(): boolean {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
}

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

    const isSafari = isSafariBrowser()
    
    // Safari-friendly options
    const options = {
      enableHighAccuracy: !isSafari, // Safari can be slow with high accuracy
      timeout: isSafari ? 15000 : 10000, // Give Safari more time
      maximumAge: isSafari ? 600000 : 300000 // Safari can cache longer
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
            if (isSafari) {
              message = 'Safari blocked location access. Please enable location services in System Preferences > Security & Privacy > Location Services and allow Safari to access your location.'
            } else {
              message = 'Location access denied by user'
            }
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable'
            break
          case error.TIMEOUT:
            if (isSafari) {
              message = 'Location request timed out. Safari may require location services to be enabled in System Preferences.'
            } else {
              message = 'Location request timed out'
            }
            break
        }
        reject({
          code: error.code,
          message
        })
      },
      options
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
  // Safari Desktop doesn't support permissions API reliably
  // Check if we're on Safari first
  const isSafari = isSafariBrowser()
  
  if (isSafari || !navigator.permissions) {
    // For Safari and browsers without permissions API, 
    // we can't check permission state without triggering a request
    return false
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' })
    return result.state === 'granted'
  } catch {
    // Fallback for browsers that don't support permissions API properly
    return false
  }
}

// Request location permission
export async function requestLocationPermission(): Promise<boolean> {
  const isSafari = isSafariBrowser()
  
  if (isSafari) {
    // Safari requires user interaction before requesting location
    // Show a more helpful message
    console.log('Safari detected: Location permission requires user interaction')
  }
  
  try {
    await getCurrentPosition()
    return true
  } catch (error: any) {
    console.error('Location permission denied:', error)
    
    // Provide more specific error messages for Safari
    if (isSafari && error.code === 1) {
      throw new Error('Safari requires you to allow location access. Please click "Allow" when prompted, or enable location access in Safari preferences.')
    }
    
    return false
  }
}

// Filter tasks within radius (in kilometers)
export function filterTasksByRadius(
  userLat: number,
  userLon: number,
  tasks: { latitude?: number; longitude?: number }[],
  radiusKm: number = 3
): { latitude?: number; longitude?: number }[] {
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
export function sortTasksByDistance<T extends { latitude?: number; longitude?: number }>(
  userLat: number,
  userLon: number,
  tasks: T[]
): Array<T & { distance: number }> {
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

// Get Safari-specific location permission instructions
export function getSafariLocationInstructions(): string {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  
  if (isMac) {
    return `To enable location access in Safari on macOS:
1. Open System Preferences > Security & Privacy
2. Click the Privacy tab
3. Select Location Services from the left sidebar
4. Make sure Location Services is enabled
5. Scroll down and find Safari
6. Check the box next to Safari to allow location access
7. Refresh this page and try again`
  } else {
    return `To enable location access in Safari:
1. Go to Safari Preferences > Websites
2. Select Location from the left sidebar  
3. Find this website and set it to "Allow"
4. Refresh this page and try again`
  }
}

// Check if we should show Safari-specific help
export function shouldShowSafariHelp(error: any): boolean {
  return isSafariBrowser() && error?.code === 1 // PERMISSION_DENIED
}