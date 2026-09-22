import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Clock, Mail, MapPin, Phone } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { submitContactMessage } from '@/features/contact/api'
import { useDocumentHead } from '@/hooks/useDocumentHead'

const schema = z.object({
  name: z.string().min(2, 'Enter your name'),
  email: z.email('Enter a valid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Tell us a bit more (at least 10 characters)'),
})
type FormValues = z.infer<typeof schema>

const CONTACT_CARDS = [
  { icon: Phone, label: 'Call us', value: '+91 98765 43210', href: 'tel:+919876543210' },
  { icon: Mail, label: 'Email us', value: 'hello@lagharahardwares.com', href: 'mailto:hello@lagharahardwares.com' },
  { icon: MapPin, label: 'Visit us', value: 'No. 12, Industrial Estate Road, Chennai, Tamil Nadu 600032', href: null },
  { icon: Clock, label: 'Hours', value: 'Mon–Sat, 9:30 AM – 7:30 PM', href: null },
]

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useDocumentHead({
    title: 'Contact — Laghara Hardwares',
    description: 'Get in touch with Laghara Hardwares for trade pricing, bulk orders, or support.',
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setFormError(null)
    try {
      await submitContactMessage({
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        message: values.message,
      })
      setSubmitted(true)
      reset()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not send your message')
    }
  }

  return (
    <div className="container-page py-10 lg:py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold text-sand-900 lg:text-4xl">Get in touch</h1>
        <p className="mt-3 text-sand-600">
          Trade pricing, bulk orders, or a question about a fitting — we usually reply within a
          business day.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          {submitted ? (
            <div className="flex flex-col items-center justify-center rounded-card border border-add-500/30 bg-add-50 p-10 text-center">
              <CheckCircle2 className="size-10 text-add-600" />
              <p className="mt-3 font-bold text-sand-900">Message sent</p>
              <p className="mt-1 text-sm text-sand-600">We'll get back to you shortly.</p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 text-sm font-bold text-brass-600 hover:text-brass-700"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-card border border-sand-200 bg-white p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Name" error={errors.name?.message} {...register('name')} />
                <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
              </div>
              <Input label="Phone (optional)" type="tel" {...register('phone')} />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-sand-800">Message</label>
                <textarea
                  {...register('message')}
                  rows={5}
                  className="w-full rounded-xl border border-sand-300 bg-white px-3.5 py-2.5 text-sm focus:border-brass-600 focus:outline-none"
                />
                {errors.message ? <p className="mt-1.5 text-sm text-danger">{errors.message.message}</p> : null}
              </div>
              {formError ? <p className="text-sm text-danger">{formError}</p> : null}
              <Button type="submit" loading={isSubmitting}>
                Send message
              </Button>
            </form>
          )}
        </div>

        <div className="space-y-3">
          {CONTACT_CARDS.map((card) => {
            const content = (
              <div className="flex items-start gap-3 rounded-card border border-sand-200 bg-white p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brass-100 text-brass-600">
                  <card.icon className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-sand-500 uppercase">{card.label}</p>
                  <p className="mt-0.5 text-sm font-medium text-sand-900">{card.value}</p>
                </div>
              </div>
            )
            return card.href ? (
              <a key={card.label} href={card.href} className="block transition-opacity hover:opacity-80">
                {content}
              </a>
            ) : (
              <div key={card.label}>{content}</div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
