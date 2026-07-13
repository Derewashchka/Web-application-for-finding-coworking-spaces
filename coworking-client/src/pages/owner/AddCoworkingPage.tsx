import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { createCoworking } from '../../api/coworkings'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import toast from 'react-hot-toast'
import { Building2 } from 'lucide-react'
import LocationPicker from '../../components/map/LocationPicker'

interface FormData {
  name: string
  city: string
  address: string
  pricePerHour: number
  totalSeats: number
  description: string
  photoUrl: string
  amenities: string
  latitude: number
  longitude: number
}

const AMENITY_OPTIONS = ['WiFi','Кухня','Кава','Принтер','Паркінг','Переговорна','Лаундж']

export default function AddCoworkingPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    defaultValues: { totalSeats: 10, amenities: '' }
  })

  const selectedAmenities = (watch('amenities') || '').split(',').filter(Boolean)

  const toggleAmenity = (a: string) => {
    const current = selectedAmenities
    const updated = current.includes(a)
      ? current.filter(x => x !== a)
      : [...current, a]
    setValue('amenities', updated.join(','))
  }

  const onSubmit = async (data: FormData) => {
    try {
      await createCoworking({
        ...data,
        pricePerHour: Number(data.pricePerHour),
        totalSeats:   Number(data.totalSeats),
        latitude:     data.latitude ? Number(data.latitude) : undefined,
        longitude:    data.longitude ? Number(data.longitude) : undefined,
      })
      toast.success('Коворкінг додано! Очікуйте на підтвердження адміністратором.')
      navigate('/profile')
    } catch {
      toast.error('Помилка при додаванні коворкінгу')
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Card padding="md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Building2 size={15} className="text-gray-700"/>
            </div>
            <CardTitle>Додати коворкінг</CardTitle>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Після додавання коворкінг потрапить на модерацію адміністратора
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">

          {/* Basic information */}
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Назва коворкінгу *"
              placeholder="WorkHub Central"
              error={errors.name?.message}
              {...register('name', { required: "Введіть назву" })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Місто *"
              placeholder="Київ"
              error={errors.city?.message}
              {...register('city', { required: "Введіть місто" })}
            />
            <Input
              label="Адреса *"
              placeholder="вул. Хрещатик, 10"
              error={errors.address?.message}
              {...register('address', { required: "Введіть адресу" })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Ціна за годину (₴) *"
              type="number"
              placeholder="100"
              error={errors.pricePerHour?.message}
              {...register('pricePerHour', {
                required: "Введіть ціну",
                min: { value: 1, message: "Мінімум 1 ₴" }
              })}
            />
            <Input
              label="Кількість місць *"
              type="number"
              placeholder="20"
              error={errors.totalSeats?.message}
              {...register('totalSeats', {
                required: "Введіть кількість місць",
                min: { value: 1, message: "Мінімум 1" }
              })}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Опис</label>
            <textarea
              rows={3}
              placeholder="Розкажіть про ваш простір..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm
                outline-none focus:border-gray-400 resize-none placeholder:text-gray-400"
              {...register('description')}
            />
          </div>

          {/* Photo */}
          <Input
            label="URL фотографії"
            placeholder="https://example.com/photo.jpg"
            {...register('photoUrl')}
          />

          {/* Amenities */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Зручності</label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map(a => {
                const active = selectedAmenities.includes(a)
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {a}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Map for selecting coordinates */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Розташування на карті (необов'язково)</label>
            <LocationPicker
              latitude={watch('latitude') || null}
              longitude={watch('longitude') || null}
              onChange={(lat, lng) => {
                setValue('latitude',  lat)
                setValue('longitude', lng)
              }}
            />
            <input type="hidden" {...register('latitude')} />
            <input type="hidden" {...register('longitude')} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/profile')}
            >
              Скасувати
            </Button>
            <Button type="submit" loading={isSubmitting} className="flex-1">
              Додати коворкінг
            </Button>
          </div>
        </form>
      </Card>
    </main>
  )
}