import { Loader } from '@googlemaps/js-api-loader'

let googleMapsPromise: Promise<typeof google> | null = null

export const loadGoogleMaps = () => {
  if (!googleMapsPromise) {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['places', 'geocoding', 'maps']
    })
    
    googleMapsPromise = loader.load()
  }
  
  return googleMapsPromise
}