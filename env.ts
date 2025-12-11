import { z } from 'zod'
import { config } from 'dotenv'

// Load env files before validation (suppress dotenv logs)
if (process.env.NODE_ENV !== 'production') {
  const originalLog = console.log
  console.log = () => {}
  config({ path: '.env.local', override: true })
  config({ path: '.env' })
  console.log = originalLog
}

const envSchema = z.object({
  APP_ENV: z.string().default('local').describe('Application environment'),
  NODE_ENV: z.string().optional().describe('Node environment'),

  HQ_ADMIN_AUTH_EMAIL: z
    .string()
    .email('HQ_ADMIN_AUTH_EMAIL must be a valid email address')
    .describe('HQ Admin authentication email'),

  HQ_ADMIN_AUTH_PASSWORD: z
    .string()
    .min(1, 'HQ_ADMIN_AUTH_PASSWORD is required')
    .describe('HQ Admin authentication password'),
})

const parseEnv = () => {
  const result = envSchema.safeParse({
    APP_ENV: process.env.APP_ENV,
    NODE_ENV: process.env.NODE_ENV,
    HQ_ADMIN_AUTH_EMAIL: process.env.HQ_ADMIN_AUTH_EMAIL,
    HQ_ADMIN_AUTH_PASSWORD: process.env.HQ_ADMIN_AUTH_PASSWORD,
  })

  if (result.success === false) {
    const errorMessages = result.error.issues
      .map((issue) => {
        return `${issue.path.join('.')}: ${issue.message}`
      })
      .join('\n  - ')

    console.error(`\n❌ Environment validation failed\n  - ${errorMessages}`)
    console.error(
      '\n💡 Tip: Copy internal-test/.env.example to internal-test/.env.local and fill in the required values\n'
    )

    throw new Error('Environment validation failed')
  }

  return result.data
}

export const env = parseEnv()

export type Env = z.infer<typeof envSchema>
