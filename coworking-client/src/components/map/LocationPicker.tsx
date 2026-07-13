import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Navigation } from 'lucide-react'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface LatLng { lat: number; lng: number }

function ClickHandler({ onSelect }: { onSelect: (pos: LatLng) => void }) {
  useMapEvents({
    click(e) { onSelect({ lat: e.latlng.lat, lng: e.latlng.lng }) }
  })
  return null
}

function FlyTo({ pos }: { pos: LatLng }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([pos.lat, pos.lng], 15, { duration: 1 })
  }, [pos.lat, pos.lng])
  return null
}

interface Props {
  latitude?:  number | null
  longitude?: number | null
  onChange:   (lat: number, lng: number) => void
}

export default function LocationPicker({ latitude, longitude, onChange }: Props) {
  const hasCoords = latitude && longitude
  const defaultCenter: [number, number] = hasCoords
    ? [latitude!, longitude!]
    : [48.3794, 31.1656]

  const [marker, setMarker] = useState<LatLng | null>(
    hasCoords ? { lat: latitude!, lng: longitude! } : null
  )
  const [flyTarget, setFlyTarget] = useState<LatLng | null>(null)

  const handleSelect = (pos: LatLng) => {
    setMarker(pos)
    onChange(
      Math.round(pos.lat * 10000) / 10000,
      Math.round(pos.lng * 10000) / 10000
    )
  }

  const handleMyLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(pos => {
      const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      setMarker(p)
      setFlyTarget(p)
      onChange(
        Math.round(p.lat * 10000) / 10000,
        Math.round(p.lng * 10000) / 10000
      )
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300
          flex items-center gap-1.5">
          <MapPin size={14} className="text-gray-500"/>
          Місцезнаходження на карті
          <span className="text-xs font-normal text-gray-400">(натисніть щоб обрати)</span>
        </label>
        <button
          type="button"
          onClick={handleMyLocation}
          className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400
            hover:text-gray-800 dark:hover:text-white transition-colors
            border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1"
        >
          <Navigation size={11}/>
          Моє місцезнаходження
        </button>
      </div>

      <div className="rounded-xl overflow-hidden border border-gray-200
        dark:border-gray-700 h-64 relative">
        <MapContainer
          center={defaultCenter}
          zoom={hasCoords ? 14 : 6}
          className="w-full h-full"
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a>'
          />
          <ClickHandler onSelect={handleSelect}/>
          {flyTarget && <FlyTo pos={flyTarget}/>}
          {marker && (
            <Marker position={[marker.lat, marker.lng]}/>
          )}
        </MapContainer>

        {!marker && (
          <div className="absolute inset-0 pointer-events-none flex items-end
            justify-center pb-3 z-[400]">
            <div className="bg-black/60 text-white text-xs px-3 py-1.5
              rounded-full backdrop-blur-sm">
              Натисніть на карті щоб поставити мітку
            </div>
          </div>
        )}
      </div>

      {/* Show coordinates */}
      {marker && (
        <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400
          bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
          <span>Широта: <strong className="text-gray-700 dark:text-gray-300">{marker.lat}</strong></span>
          <span>Довгота: <strong className="text-gray-700 dark:text-gray-300">{marker.lng}</strong></span>
          <button
            type="button"
            onClick={() => { setMarker(null); onChange(0, 0) }}
            className="ml-auto text-gray-400 hover:text-red-500 transition-colors"
          >
            Скинути
          </button>
        </div>
      )}
    </div>
  )
}