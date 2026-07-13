import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { register as apiRegister } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

interface FormData {
  firstName: string; lastName: string
  email: string; password: string
  phone: string; role: string
}

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: { role: 'client' }
  })
  const { setToken } = useAuthStore()
  const navigate = useNavigate()

  const onSubmit = async (data: FormData) => {
    try {
      const res = await apiRegister(data)
      setToken(res.data.token)
      toast.success('Акаунт створено!')
      navigate('/')
    } catch {
      toast.error('Помилка реєстрації. Можливо, email вже використовується.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white dark:bg-gray-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Реєстрація</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Створіть новий акаунт</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Ім'я" placeholder="Анна"
              error={errors.firstName?.message}
              {...register('firstName', { required: true })}/>
            <Input label="Прізвище" placeholder="Петренко"
              error={errors.lastName?.message}
              {...register('lastName', { required: true })}/>
          </div>

          <Input label="Email" type="email" placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email', { required: true })}/>

          <Input label="Пароль" type="password" placeholder="Мін. 6 символів"
            error={errors.password?.message}
            {...register('password', { required: true, minLength: 6 })}/>

          <Input label="Телефон" placeholder="+380501234567"
            {...register('phone')}/>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Роль</label>
            <select {...register('role')}
              className="rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm
                focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 
                bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
              <option value="client">Клієнт (шукаю коворкінг)</option>
              <option value="owner">Власник (маю коворкінг)</option>
            </select>
          </div>

          <Button type="submit" loading={isSubmitting} className="w-full mt-1">
            Зареєструватись
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-4">
          Вже є акаунт?{' '}
          <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:underline">Увійти</Link>
        </p>
      </div>
    </div>
  )
}