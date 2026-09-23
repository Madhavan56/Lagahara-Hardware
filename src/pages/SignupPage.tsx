import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { useAuth } from '@/features/auth/AuthProvider'

const schema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'At least 8 characters'),
})

type FormValues = z.infer<typeof schema>

export default function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setFormError(null)
    try {
      const { needsEmailConfirmation } = await signUp(values.email, values.password, values.fullName)
      if (needsEmailConfirmation) {
        setNeedsConfirmation(true)
      } else {
        navigate('/account', { replace: true })
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not create account')
    }
  }

  const fieldVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.55 + i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    }),
  }

  if (needsConfirmation) {
    return (
      <AuthLayout title="Check your email" subtitle="Confirm your account to continue">
        <div className="text-center">
          <p className="text-sm text-sand-600">
            We've sent a confirmation link. Once confirmed, you can sign in.
          </p>
          <Link to="/login" className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:text-brand-900">
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Create an account" subtitle="Join Laghara for exclusive access">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full name field */}
        <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
          <Input label="Full name" autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
        </motion.div>

        {/* Email field */}
        <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
          <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        </motion.div>

        {/* Password field */}
        <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            hint="At least 8 characters"
            error={errors.password?.message}
            {...register('password')}
          />
        </motion.div>

        {/* Error message */}
        {formError ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm text-danger">{formError}</p>
          </motion.div>
        ) : null}

        {/* Submit button */}
        <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
          <Button type="submit" block loading={isSubmitting}>
            Create account
          </Button>
        </motion.div>

        {/* Sign in link */}
        <motion.div className="text-center" custom={4} variants={fieldVariants} initial="hidden" animate="visible">
          <p className="text-sm text-sand-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-900">
              Sign in
            </Link>
          </p>
        </motion.div>
      </form>
    </AuthLayout>
  )
}
