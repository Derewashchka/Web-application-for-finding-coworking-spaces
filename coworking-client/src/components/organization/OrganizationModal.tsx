import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { createOrganization, updateOrganization } from '../../api/organizations'
import type { ContactInfo, Organization } from '../../types'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { X, Building2, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

// Відомі типи контактів з іконками і плейсхолдерами
const CONTACT_PRESETS = [
  { key: 'phone',     label: 'Телефон',    placeholder: '+380501234567' },
  { key: 'email',     label: 'Email',      placeholder: 'info@workhub.ua' },
  { key: 'website',   label: 'Вебсайт',    placeholder: 'https://workhub.ua' },
  { key: 'telegram',  label: 'Telegram',   placeholder: 'workhub_ua' },
  { key: 'instagram', label: 'Instagram',  placeholder: 'workhub.ua' },
  { key: 'facebook',  label: 'Facebook',   placeholder: 'workhub.ukraine' },
  { key: 'twitter',   label: 'Twitter/X',  placeholder: 'workhub_ua' },
  { key: 'linkedin',  label: 'LinkedIn',   placeholder: 'company/workhub' },
  { key: 'viber',     label: 'Viber',      placeholder: '+380501234567' },
  { key: 'hours',     label: 'Години роботи', placeholder: 'Пн-Пт 08:00-22:00' },
]

interface FormBase {
  name:        string
  address:     string
  description: string
  logoUrl:     string
}

interface ContactRow {
  key:   string
  value: string
}

interface Props {
  existing?: Organization | null
  onClose:   () => void
  onSaved:   (org: Organization) => void
}

export default function OrganizationModal({ existing, onClose, onSaved }: Props) {
  const {
    register, handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormBase>({
    defaultValues: {
      name:        existing?.name        ?? '',
      address:     existing?.address     ?? '',
      description: existing?.description ?? '',
      logoUrl:     existing?.logoUrl     ?? '',
    }
  })

  // Контакти як масив рядків {key, value}
  const [contacts, setContacts] = useState<ContactRow[]>(() => {
    if (!existing?.contacts) return []
    return Object.entries(existing.contacts).map(([key, value]) => ({ key, value }))
  })

  const [customKey, setCustomKey] = useState('')

  const addPreset = (key: string) => {
    if (contacts.some(c => c.key === key)) return
    setContacts(prev => [...prev, { key, value: '' }])
  }

  const addCustom = () => {
    const k = customKey.trim().toLowerCase().replace(/\s+/g, '_')
    if (!k || contacts.some(c => c.key === k)) return
    setContacts(prev => [...prev, { key: k, value: '' }])
    setCustomKey('')
  }

  const updateContact = (idx: number, value: string) => {
    setContacts(prev => prev.map((c, i) => i === idx ? { ...c, value } : c))
  }

  const removeContact = (idx: number) => {
    setContacts(prev => prev.filter((_, i) => i !== idx))
  }

  const onSubmit = async (data: FormBase) => {
    const contactsObj: ContactInfo = {}
    contacts.forEach(c => {
      if (c.value.trim()) contactsObj[c.key] = c.value.trim()
    })

    try {
      const payload = {
        name:        data.name,
        address:     data.address,
        description: data.description || undefined,
        logoUrl:     data.logoUrl     || undefined,
        contacts:    Object.keys(contactsObj).length > 0 ? contactsObj : undefined,
      }
      const res = existing
        ? await updateOrganization(payload)
        : await createOrganization(payload)

      toast.success(existing ? 'Організацію оновлено' : 'Організацію створено!')
      onSaved(res.data)
      onClose()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Помилка')
    }
  }

  const getPlaceholder = (key: string) =>
    CONTACT_PRESETS.find(p => p.key === key)?.placeholder ?? key

  const getLabel = (key: string) =>
    CONTACT_PRESETS.find(p => p.key === key)?.label ?? key

  const unusedPresets = CONTACT_PRESETS.filter(
    p => !contacts.some(c => c.key === p.key)
  )

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center
      justify-center p-4 overflow-y-auto"
      onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full
        max-w-lg p-6 my-4"
        onClick={e => e.stopPropagation()}>

        {/* Шапка */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-gray-500"/>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {existing ? 'Редагувати організацію' : 'Створити організацію'}
            </h2>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
              text-gray-400 transition-colors">
            <X size={16}/>
          </button>
        </div>

        {!existing && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20
            border border-amber-100 dark:border-amber-800
            rounded-xl text-xs text-amber-700 dark:text-amber-400">
            Для того щоб додавати коворкінги, спочатку створіть організацію.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Назва організації *" placeholder="WorkHub Ukraine"
            error={errors.name?.message}
            {...register('name', { required: 'Введіть назву' })}/>

          <Input label="Адреса *" placeholder="м. Київ, вул. Хрещатик, 10"
            error={errors.address?.message}
            {...register('address', { required: 'Введіть адресу' })}/>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Опис
            </label>
            <textarea rows={3} placeholder="Коротко про вашу організацію..."
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                px-3 py-2 text-sm outline-none focus:border-gray-400
                resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
              {...register('description')}/>
          </div>

          <Input label="URL логотипу" placeholder="https://..."
            {...register('logoUrl')}/>

          {/* ── Контактна інформація ── */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Контактна інформація
            </p>

            {/* Додані контакти */}
            {contacts.map((c, idx) => (
              <div key={c.key} className="flex gap-2 mb-2 items-center">
                <div className="w-28 shrink-0">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400
                    bg-gray-100 dark:bg-gray-800 px-2 py-1.5 rounded-lg
                    block text-center truncate">
                    {getLabel(c.key)}
                  </span>
                </div>
                <input
                  value={c.value}
                  onChange={e => updateContact(idx, e.target.value)}
                  placeholder={getPlaceholder(c.key)}
                  className="flex-1 text-sm border border-gray-200 dark:border-gray-700
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                    rounded-lg px-3 py-1.5 outline-none focus:border-gray-400
                    placeholder:text-gray-400 dark:placeholder:text-gray-600"
                />
                <button type="button" onClick={() => removeContact(idx)}
                  className="p-1.5 text-gray-400 hover:text-red-500
                    hover:bg-red-50 dark:hover:bg-red-900/20
                    rounded-lg transition-colors shrink-0">
                  <Trash2 size={14}/>
                </button>
              </div>
            ))}

            {/* Додати з пресетів */}
            {unusedPresets.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                  Додати поле:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {unusedPresets.map(p => (
                    <button key={p.key} type="button"
                      onClick={() => addPreset(p.key)}
                      className="px-2.5 py-1 text-xs border border-gray-200
                        dark:border-gray-700 rounded-lg text-gray-600
                        dark:text-gray-400 hover:border-gray-400
                        dark:hover:border-gray-500 hover:bg-gray-50
                        dark:hover:bg-gray-800 transition-colors">
                      + {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Довільне поле */}
            <div className="flex gap-2 mt-3">
              <input
                value={customKey}
                onChange={e => setCustomKey(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
                placeholder="Своя назва поля..."
                className="flex-1 text-sm border border-dashed border-gray-200
                  dark:border-gray-700 bg-transparent rounded-lg px-3 py-1.5
                  outline-none focus:border-gray-400 text-gray-700 dark:text-gray-300
                  placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
              <button type="button" onClick={addCustom}
                disabled={!customKey.trim()}
                className="flex items-center gap-1 px-3 py-1.5 text-xs
                  border border-dashed border-gray-300 dark:border-gray-600
                  rounded-lg text-gray-500 hover:border-gray-400
                  disabled:opacity-40 transition-colors">
                <Plus size={13}/> Додати
              </button>
            </div>
          </div>

          <div className="flex gap-3 mt-1">
            <Button type="button" variant="outline" className="flex-1"
              onClick={onClose}>
              Скасувати
            </Button>
            <Button type="submit" loading={isSubmitting} className="flex-1">
              {existing ? 'Зберегти' : 'Створити'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}