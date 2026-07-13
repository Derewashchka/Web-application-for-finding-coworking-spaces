import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

interface FormData { email: string; password: string }

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>()
  const { setToken } = useAuthStore()
  const navigate = useNavigate()

  const onSubmit = async (data: FormData) => {
    try {
      const res = await login(data.email, data.password)
      setToken(res.data.token)
      toast.success('Ласкаво просимо!')
      navigate('/')
    } catch {
      toast.error('Невірний email або пароль')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-gray-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Вхід</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Увійдіть у свій акаунт</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Email" type="email" placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email', { required: "Введіть email" })}/>

          <Input label="Пароль" type="password" placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', { required: "Введіть пароль" })}/>

          <Button type="submit" loading={isSubmitting} className="w-full mt-1">
            Увійти
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-4">
          Немає акаунту?{' '}
          <Link to="/register" className="text-gray-700 dark:text-gray-300 hover:underline">
            Зареєструватись
          </Link>
        </p>
      </div>
    </div>
  )
}