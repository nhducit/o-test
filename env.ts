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

const appEnvEnum = z.enum(['local', 'dev', 'staging'])

const envSchema = z.object({
  APP_ENV: appEnvEnum.default('local').describe('Application environment (local, dev, staging)'),
  NODE_ENV: z.string().optional().describe('Node environment'),

  HQ_ADMIN_AUTH_EMAIL: z
    .string()
    .email('HQ_ADMIN_AUTH_EMAIL must be a valid email address')
    .describe('HQ Admin authentication email'),

  HQ_ADMIN_AUTH_PASSWORD: z
    .string()
    .min(1, 'HQ_ADMIN_AUTH_PASSWORD is required')
    .describe('HQ Admin authentication password'),

  // Optional: Campaign ID for running tests against a specific campaign
  TEST_CAMPAIGN_ID: z
    .string()
    .optional()
    .describe('Campaign ID for running storyboard & copy tests against a specific campaign'),
})

const parseEnv = () => {
  const result = envSchema.safeParse({
    APP_ENV: process.env.APP_ENV,
    NODE_ENV: process.env.NODE_ENV,
    HQ_ADMIN_AUTH_EMAIL: process.env.HQ_ADMIN_AUTH_EMAIL,
    HQ_ADMIN_AUTH_PASSWORD: process.env.HQ_ADMIN_AUTH_PASSWORD,
    TEST_CAMPAIGN_ID: process.env.TEST_CAMPAIGN_ID,
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
export type AppEnv = z.infer<typeof appEnvEnum>
