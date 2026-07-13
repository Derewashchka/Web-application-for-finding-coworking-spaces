import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { updateMe } from '../../api/users'
import { useAuthStore } from '../../store/authStore'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { X, User, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

interface FormData {
  firstName:       string
  lastName:        string
  phone:           string
  currentPassword: string
  newPassword:     string
  confirmPassword: string
}

interface Props {
  onClose:  () => void
  onSaved:  () => void
}

export default function EditProfileModal({ onClose, onSaved }: Props) {
  const { user, setToken, updateUser } = useAuthStore()
  const [tab, setTab] = useState<'info' | 'password'>('info')

  const {
    register, handleSubmit, watch,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName:  user?.lastName  ?? '',
      phone:     user?.phone     ?? '',
    }
  })

  const onSubmit = async (data: FormData) => {
    if (tab === 'password') {
      if (data.newPassword !== data.confirmPassword) {
        toast.error('Паролі не збігаються')
        return
      }
    }

    try {
      const res = await updateMe({
        firstName:       data.firstName,
        lastName:        data.lastName,
        phone:           data.phone || undefined,
        currentPassword: tab === 'password' ? data.currentPassword : undefined,
        newPassword:     tab === 'password' ? data.newPassword     : undefined,
      })

      if (res.data && res.data.token) {
        setToken(res.data.token)
      } else {
        updateUser({
          firstName: data.firstName,
          lastName:  data.lastName,
          phone:     data.phone || undefined,
        })
      }

      toast.success(
        tab === 'password' ? 'Пароль змінено успішно' : 'Профіль оновлено'
      )
      onSaved()
      onClose()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Помилка оновлення')
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Cap */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Редагування профілю
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
          >
            <X size={16}/>
          </button>
        </div>

        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-5">
          {[
            { key: 'info'     as const, icon: User, label: 'Особисті дані' },
            { key: 'password' as const, icon: Lock, label: 'Пароль'        },
          ].map(t => (
            <button 
              key={t.key} 
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tab === t.key
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <t.icon size={13}/>{t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {tab === 'info' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Ім'я *"
                  placeholder="Анна"
                  error={errors.firstName?.message}
                  {...register('firstName', { required: "Введіть ім'я" })}
                />
                <Input
                  label="Прізвище *"
                  placeholder="Петренко"
                  error={errors.lastName?.message}
                  {...register('lastName', { required: 'Введіть прізвище' })}
                />
              </div>
              <Input
                label="Телефон"
                placeholder="+380501234567"
                {...register('phone')}
              />
            </>
          ) : (
            <>
              <Input
                label="Поточний пароль *"
                type="password"
                placeholder="••••••••"
                error={errors.currentPassword?.message}
                {...register('currentPassword', {
                  required: 'Введіть поточний пароль'
                })}
              />
              <Input
                label="Новий пароль *"
                type="password"
                placeholder="Мінімум 6 символів"
                error={errors.newPassword?.message}
                {...register('newPassword', {
                  required:  'Введіть новий пароль',
                  minLength: { value: 6, message: 'Мінімум 6 символів' }
                })}
              />
              <Input
                label="Підтвердіть пароль *"
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Підтвердіть пароль',
                  validate: v =>
                    v === watch('newPassword') || 'Паролі не збігаються'
                })}
              />
            </>
          )}

          <div className="flex gap-3 mt-1">
            <Button
              type="button" variant="outline"
              className="flex-1" onClick={onClose}
            >
              Скасувати
            </Button>
            <Button
              type="submit" loading={isSubmitting}
              className="flex-1"
            >
              Зберегти
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}