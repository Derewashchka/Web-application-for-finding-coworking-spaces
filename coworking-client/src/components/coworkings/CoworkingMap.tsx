import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Coworking } from '../../types'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function CoworkingMap({ coworkings }: { coworkings: Coworking[] }) {
  const withCoords = coworkings.filter(c => c.latitude && c.longitude)

  if (withCoords.length === 0) return null

  const center: [number, number] = [
    withCoords.reduce((s, c) => s + c.latitude!, 0) / withCoords.length,
    withCoords.reduce((s, c) => s + c.longitude!, 0) / withCoords.length,
  ]

  return (
    <MapContainer center={center} zoom={10}
      className="w-full h-80 rounded-xl border border-gray-100 z-0">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a>'
      />
      {withCoords.map(cw => (
        <Marker key={cw.id} position={[cw.latitude!, cw.longitude!]}>
          <Popup>
            <div className="text-sm">
              <p className="font-medium">{cw.name}</p>
              <p className="text-gray-500">{cw.city}</p>
              <p className="font-semibold mt-1">{cw.pricePerHour} ₴/год</p>
              <Link to={`/coworkings/${cw.id}`}
                className="text-blue-500 hover:underline text-xs">
                Детальніше →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}  