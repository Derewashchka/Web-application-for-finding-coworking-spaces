import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { QrCode, X, Download } from 'lucide-react'
import type { Booking } from '../../types'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'

interface Props {
  booking: Booking
}

export default function BookingQR({ booking }: Props) {
  const [open, setOpen] = useState(false)

  // Data that encode in QR
  const qrData = JSON.stringify({
    id:       booking.id,
    coworking: booking.coworking.name,
    from:     booking.dateFrom,
    to:       booking.dateTo,
    price:    booking.totalPrice,
    status:   booking.status,
  })

  const handleDownload = () => {
    const svg = document.getElementById('booking-qr-svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `booking-${booking.id}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (booking.status !== 'confirmed') return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500
          hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        <QrCode size={11}/> QR-код
      </button>

      {/* Modal window */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center
            justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full
              flex flex-col items-center gap-4 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Cap */}
            <div className="flex items-center justify-between w-full">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  QR-код бронювання
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  #{booking.id}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
                  text-gray-400 transition-colors"
              >
                <X size={15}/>
              </button>
            </div>

            {/* QR */}
            <div className="p-4 border-2 border-gray-100 dark:border-gray-800 rounded-xl bg-white">
              <QRCodeSVG
                id="booking-qr-svg"
                value={qrData}
                size={200}
                level="M"
                includeMargin={false}
              />
            </div>

            {/* Booking details */}
            <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-xs
              flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-gray-400 dark:text-gray-500">Коворкінг</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {booking.coworking.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 dark:text-gray-500">Початок</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {format(new Date(booking.dateFrom),
                    'dd MMM yyyy, HH:mm', { locale: uk })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 dark:text-gray-500">Кінець</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {format(new Date(booking.dateTo),
                    'dd MMM yyyy, HH:mm', { locale: uk })}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-1.5 mt-0.5">
                <span className="text-gray-400 dark:text-gray-500">Сума</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {booking.totalPrice} ₴
                </span>
              </div>
            </div>

            {/* Download button */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400
                hover:text-gray-800 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 
                hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg
                px-3 py-2 transition-colors w-full justify-center"
            >
              <Download size={13}/> Завантажити QR
            </button>

            <p className="text-[10px] text-gray-300 dark:text-gray-600 text-center">
              Пред'явіть цей код на рецепції для верифікації
            </p>
          </div>
        </div>
      )}
    </>
  )
}