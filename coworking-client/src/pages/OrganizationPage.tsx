import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrganization } from '../api/organizations'
import CoworkingCard from '../components/coworkings/CoworkingCard'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import {
  MapPin, Globe, Building2, Phone, Mail,
  Clock, ExternalLink, MessageCircle,
  Hash, Calendar, Star
} from 'lucide-react'
import { 
  FaInstagram as Instagram, 
  FaFacebook as Facebook, 
  FaTwitter as Twitter, 
  FaLinkedin as Linkedin 
} from 'react-icons/fa'
import type { Organization } from '../types'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'

// Іконки і кольори для відомих типів контактів
const CONTACT_META: Record<string, {
  icon: React.ElementType
  color: string
  bg: string
  darkBg: string
  buildUrl?: (v: string) => string
  formatValue?: (v: string) => string
}> = {
  phone: {
    icon: Phone,
    color: 'text-blue-500',
    bg: 'bg-blue-50', darkBg: 'dark:bg-blue-900/30',
    buildUrl: v => `tel:${v}`,
  },
  email: {
    icon: Mail,
    color: 'text-purple-500',
    bg: 'bg-purple-50', darkBg: 'dark:bg-purple-900/30',
    buildUrl: v => `mailto:${v}`,
  },
  website: {
    icon: Globe,
    color: 'text-green-500',
    bg: 'bg-green-50', darkBg: 'dark:bg-green-900/30',
    buildUrl: v => v.startsWith('http') ? v : `https://${v}`,
    formatValue: v => v.replace(/^https?:\/\//, ''),
  },
  telegram: {
    icon: MessageCircle,
    color: 'text-sky-500',
    bg: 'bg-sky-50', darkBg: 'dark:bg-sky-900/30',
    buildUrl: v => `https://t.me/${v.replace('@', '')}`,
    formatValue: v => `@${v.replace('@', '')}`,
  },
  instagram: {
    icon: Instagram,
    color: 'text-pink-500',
    bg: 'bg-pink-50', darkBg: 'dark:bg-pink-900/30',
    buildUrl: v => `https://instagram.com/${v.replace('@', '')}`,
    formatValue: v => `@${v.replace('@', '')}`,
  },
  facebook: {
    icon: Facebook,
    color: 'text-blue-600',
    bg: 'bg-blue-50', darkBg: 'dark:bg-blue-900/30',
    buildUrl: v => v.startsWith('http') ? v : `https://facebook.com/${v}`,
  },
  twitter: {
    icon: Twitter,
    color: 'text-sky-400',
    bg: 'bg-sky-50', darkBg: 'dark:bg-sky-900/30',
    buildUrl: v => `https://x.com/${v.replace('@', '')}`,
    formatValue: v => `@${v.replace('@', '')}`,
  },
  linkedin: {
    icon: Linkedin,
    color: 'text-blue-700',
    bg: 'bg-blue-50', darkBg: 'dark:bg-blue-900/30',
    buildUrl: v => `https://linkedin.com/company/${v}`,
  },
  hours: {
    icon: Clock,
    color: 'text-amber-500',
    bg: 'bg-amber-50', darkBg: 'dark:bg-amber-900/30',
  },
  viber: {
    icon: Phone,
    color: 'text-violet-500',
    bg: 'bg-violet-50', darkBg: 'dark:bg-violet-900/30',
    buildUrl: v => `viber://chat?number=${v}`,
  },
}

// Мітки для відомих ключів
const CONTACT_LABELS: Record<string, string> = {
  phone: 'Телефон', email: 'Email', website: 'Вебсайт',
  telegram: 'Telegram', instagram: 'Instagram', facebook: 'Facebook',
  twitter: 'Twitter/X', linkedin: 'LinkedIn', viber: 'Viber',
  hours: 'Години роботи',
}

function ContactItem({ contactKey, value }: { contactKey: string; value: string }) {
  const meta = CONTACT_META[contactKey]
  const Icon   = meta?.icon ?? Hash
  const color  = meta?.color  ?? 'text-gray-500'
  const bg     = meta?.bg     ?? 'bg-gray-50'
  const darkBg = meta?.darkBg ?? 'dark:bg-gray-800'
  const url    = meta?.buildUrl?.(value)
  const label  = CONTACT_LABELS[contactKey] ?? contactKey
  const display = meta?.formatValue?.(value) ?? value

  const inner = (
    <div className={`flex items-center gap-3 text-sm text-gray-600
      dark:text-gray-400 transition-colors group
      ${url ? 'hover:text-gray-900 dark:hover:text-white cursor-pointer' : ''}`}>
      <div className={`w-8 h-8 rounded-lg ${bg} ${darkBg}
        flex items-center justify-center shrink-0
        ${url ? `group-hover:${bg.replace('50','100')}` : ''} transition-colors`}>
        <Icon size={14} className={color}/>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
        <p className="truncate font-medium text-gray-700 dark:text-gray-300">
          {display}
        </p>
      </div>
      {url && (
        <ExternalLink size={11} className="text-gray-300 shrink-0 ml-auto"/>
      )}
    </div>
  )

  if (url) {
    return (
      <a href={url} target={url.startsWith('tel') || url.startsWith('mailto') || url.startsWith('viber') ? '_self' : '_blank'}
        rel="noopener noreferrer" className="block">
        {inner}
      </a>
    )
  }
  return inner
}

export default function OrganizationPage() {
  const { id } = useParams<{ id: string }>()
  const [org,     setOrg]     = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrganization(Number(id))
      .then(r => setOrg(r.data))
      .catch(() => setOrg(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner/>
  if (!org) return (
    <div className="text-center py-20 text-gray-400">
      Організацію не знайдено
    </div>
  )

  const contacts = org.contacts ?? {}
  const hasContacts = Object.keys(contacts).length > 0

  const avgRating = org.coworkings && org.coworkings.length > 0
    ? (org.coworkings.reduce((s, c) => s + (c.rating || 0), 0) / org.coworkings.length).toFixed(1)
    : null

  // Сортуємо: спочатку відомі, потім кастомні
  const sortedContactKeys = Object.keys(contacts).sort((a, b) => {
    const ai = Object.keys(CONTACT_META).indexOf(a)
    const bi = Object.keys(CONTACT_META).indexOf(b)
    if (ai === -1 && bi === -1) return 0
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">

      {/* ── Шапка ── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100
        dark:border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-5 flex-wrap">

          {org.logoUrl ? (
            <img src={org.logoUrl} alt={org.name}
              className="w-20 h-20 rounded-xl object-cover
                border border-gray-100 dark:border-gray-700 shrink-0"/>
          ) : (
            <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-800
              flex items-center justify-center shrink-0">
              <Building2 size={32} className="text-gray-400"/>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {org.name}
              </h1>
              {org.isPremiumActive && (
                <Badge variant="yellow">⭐ Premium</Badge>
              )}
            </div>
            <p className="text-sm text-gray-400 flex items-center gap-1 mb-3">
              <MapPin size={13}/>{org.address}
            </p>
            {org.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400
                leading-relaxed max-w-2xl">
                {org.description}
              </p>
            )}
          </div>

          {/* Статистика */}
          <div className="flex gap-6 shrink-0 text-center">
            <div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {org.coworkingsCount}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">коворкінгів</p>
            </div>
            {avgRating && Number(avgRating) > 0 && (
              <div>
                <p className="text-2xl font-semibold text-amber-500">
                  ★ {avgRating}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">рейтинг</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Ліва колонка ── */}
        <div className="flex flex-col gap-4">

          {/* Контакти */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100
            dark:border-gray-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Контактна інформація
            </h2>

            {hasContacts ? (
              <div className="flex flex-col gap-3">
                {sortedContactKeys.map(key => (
                  <ContactItem key={key} contactKey={key} value={contacts[key]}/>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                Контактна інформація не вказана
              </p>
            )}
          </div>

          {/* Дата */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100
            dark:border-gray-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Calendar size={12}/>
              На платформі з{' '}
              {format(new Date(org.createdAt), 'LLLL yyyy', { locale: uk })}
            </div>
          </div>
        </div>

        {/* ── Права колонка — коворкінги ── */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white
            mb-4 flex items-center gap-2">
            <Building2 size={16} className="text-gray-500"/>
            Коворкінги
            <span className="text-sm text-gray-400 font-normal">
              ({org.coworkingsCount})
            </span>
          </h2>

          {!org.coworkings || org.coworkings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Building2 size={32} className="mx-auto mb-2 opacity-20"/>
              <p className="text-sm">Немає затверджених коворкінгів</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {org.coworkings.map(cw => (
                <CoworkingCard key={cw.id} cw={cw}/>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}