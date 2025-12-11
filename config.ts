import { env, AppEnv } from './env'

type DomainConfig = {
  hqAdmin: string
}

const domainsByEnv: Record<AppEnv, DomainConfig> = {
  local: {
    hqAdmin: 'http://hqadmin.localhost:8087',
  },
  dev: {
    hqAdmin: 'https://dev.personalisationhub.com',
  },
  staging: {
    hqAdmin: 'https://staging.personalisationhub.com',
  },
}

export const domain = domainsByEnv[env.APP_ENV]

export const app = {
  hqAdmin: `${domain.hqAdmin}/hq-admin`,
}

export const authFile = {
  hqAdmin: `playwright/.auth/hq-admin-user-${env.APP_ENV}.json`,
}

export function getAppConfig() {
  return app
}

export function getCurrentEnv(): AppEnv {
  return env.APP_ENV
}
