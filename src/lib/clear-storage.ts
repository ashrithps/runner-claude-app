export function clearAppStorage() {
  try {
    localStorage.removeItem('runner-app-storage')
    console.log('✅ Cleared runner app storage')
    // Force page reload to reinitialize the store
    window.location.reload()
  } catch (err) {
    console.error('Failed to clear storage:', err)
  }
}

export function debugStorage() {
  try {
    const stored = localStorage.getItem('runner-app-storage')
    if (stored) {
      const parsed = JSON.parse(stored)
      console.log('Current storage:', parsed)
      
      if (parsed.state?.user?.id) {
        const userId = parsed.state.user.id
        const isValid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)
        console.log('User ID:', userId, 'Valid UUID:', isValid)
      }
    } else {
      console.log('No storage found')
    }
  } catch (err) {
    console.error('Failed to debug storage:', err)
  }
}