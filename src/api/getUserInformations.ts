import { TUser } from "@/interfaces/TUser"
import { api } from "@/lib/api"

export const getUserInformation = async (UserName: string): Promise<TUser> => {
  const result = await api.get(`users/${UserName}`)
  return result.data as unknown as Promise<TUser>
}