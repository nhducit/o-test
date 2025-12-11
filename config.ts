import { env } from './env'

export const localDomain = {
  hqAdmin: 'http://hqadmin.localhost:8087',
}

export const app = {
  hqAdmin: `${localDomain.hqAdmin}/hq-admin`,
}

export const authFile = {
  hqAdmin: 'playwright/.auth/hq-admin-user.json',
}

export function getAppConfig() {
  return app
}
