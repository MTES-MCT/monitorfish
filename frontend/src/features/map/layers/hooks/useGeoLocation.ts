import { useCallback, useEffect, useState } from 'react'

interface Coordinates {
  latitude: number
  longitude: number
}

export const useGeoLocation = (localStorageKey = 'is-location-granted') => {
  const [shouldRequestLocation, setShouldRequestLocation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<GeolocationPositionError>()
  const [coordinates, setCoordinates] = useState<Coordinates>()

  const onSuccess = useCallback(
    (location: GeolocationPosition) => {
      setLoading(false)
      setCoordinates({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      })

      if (!('permissions' in navigator)) {
        localStorage.setItem(localStorageKey, JSON.stringify(true))
      }
    },
    [localStorageKey]
  )

  const onError = useCallback((nextError: GeolocationPositionError) => {
    setLoading(false)
    setError(nextError)
  }, [])

  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
        if (permissionStatus.state !== 'granted') {
          setShouldRequestLocation(true)
        }
      })
    } else {
      const isLocationGranted = JSON.parse(localStorage.getItem(localStorageKey) || 'false')
      if (!isLocationGranted) {
        setShouldRequestLocation(true)
      }
    }
  }, [localStorageKey])

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      const geoError = new GeolocationPositionError()
      setError({
        ...geoError,
        message: 'Geolocation not supported'
      })

      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: false,
      maximumAge: 18000000,
      timeout: 10000
    })

    navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: false,
      maximumAge: 18000000,
      timeout: 10000
    })
  }, [shouldRequestLocation, onSuccess, onError])

  return { coordinates, error, loading }
}
