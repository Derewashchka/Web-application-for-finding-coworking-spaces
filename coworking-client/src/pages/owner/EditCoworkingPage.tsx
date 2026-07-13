import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { getCoworkingById, updateCoworking } from '../../api/coworkings'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
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

export default function EditCoworkingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting }
  } = useForm<FormData>()

  const selectedAmenities = (watch('amenities') || '').split(',').filter(Boolean)

  const toggleAmenity = (a: string) => {
    const updated = selectedAmenities.includes(a)
      ? selectedAmenities.filter(x => x !== a)
      : [...selectedAmenities, a]
    setValue('amenities', updated.join(','))
  }

  useEffect(() => {
    getCoworkingById(Number(id))
      .then(({ data }) => {
        setValue('name',         data.name)
        setValue('city',         data.city)
        setValue('address',      data.address)
        setValue('pricePerHour', data.pricePerHour)
        setValue('totalSeats',   data.totalSeats)
        setValue('description',  data.description ?? '')
        setValue('photoUrl',     data.photoUrl ?? '')
        setValue('amenities',    data.amenities ?? '')
        setValue('latitude',     data.latitude ?? '')
        setValue('longitude',    data.longitude ?? '')
      })
      .finally(() => setLoading(false))
  }, [id, setValue])

  const onSubmit = async (data: FormData) => {
    try {
      await updateCoworking(Number(id), {
        ...data,
        pricePerHour: Number(data.pricePerHour),
        totalSeats:   Number(data.totalSeats),
        latitude:     data.latitude  ? Number(data.latitude)  : undefined,
        longitude:    data.longitude ? Number(data.longitude) : undefined,
      })
      toast.success('Коворкінг оновлено!')
      navigate('/profile')
    } catch {
      toast.error('Помилка при оновленні')
    }
  }

  if (loading) return <Spinner/>

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Card padding="md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Building2 size={15} className="text-gray-700"/>
            </div>
            <CardTitle>Редагування коворкінгу</CardTitle>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
          <Input label="Назва *" placeholder="WorkHub Central"
            error={errors.name?.message}
            {...register('name', { required: 'Введіть назву' })}/>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Місто *" placeholder="Київ"
              error={errors.city?.message}
              {...register('city', { required: 'Введіть місто' })}/>
            <Input label="Адреса *" placeholder="вул. Хрещатик, 10"
              error={errors.address?.message}
              {...register('address', { required: 'Введіть адресу' })}/>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Ціна за годину (₴) *" type="number" placeholder="100"
              error={errors.pricePerHour?.message}
              {...register('pricePerHour', { required: true, min: 1 })}/>
            <Input label="Кількість місць *" type="number" placeholder="20"
              error={errors.totalSeats?.message}
              {...register('totalSeats', { required: true, min: 1 })}/>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Опис</label>
            <textarea rows={3} placeholder="Розкажіть про ваш простір..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm
                outline-none focus:border-gray-400 resize-none placeholder:text-gray-400"
              {...register('description')}/>
          </div>

          <Input label="URL фотографії" placeholder="https://..."
            {...register('photoUrl')}/>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Зручності</label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map(a => {
                const active = selectedAmenities.includes(a)
                return (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}>
                    {a}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Карта для вибору координат */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Розташування на карті</label>
            <LocationPicker
              latitude={watch('latitude') || null}
              longitude={watch('longitude') || null}
              onChange={(lat, lng) => {
                setValue('latitude',  lat)
                setValue('longitude', lng)
              }}
            />
            {/* Приховані поля для React Hook Form */}
            <input type="hidden" {...register('latitude')} />
            <input type="hidden" {...register('longitude')} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1"
              onClick={() => navigate('/profile')}>
              Скасувати
            </Button>
            <Button type="submit" loading={isSubmitting} className="flex-1">
              Зберегти зміни
            </Button>
          </div>
        </form>
      </Card>
    </main>
  )
}