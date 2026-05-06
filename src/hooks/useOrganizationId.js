import { useProfile } from '../context/ProfileContext'

/** Returns signed-in user's organization UUID or null — required for multitenant queries. */
export function useOrganizationId() {
  const profile = useProfile()
  return profile?.organization_id ?? null
}
