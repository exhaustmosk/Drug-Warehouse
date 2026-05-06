import { createContext, useContext } from 'react'

export const ProfileContext = createContext(null)

export function useProfile() {
  const ctx = useContext(ProfileContext)
  return ctx
}
