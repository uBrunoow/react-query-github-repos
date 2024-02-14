import { TRepos } from "@/interfaces/TRepos"
import { api } from "@/lib/api"

export const getRepositories = async (UserName: string): Promise<TRepos[]> => {
  const result = await api.get(`users/${UserName}/repos`)
  return result.data as unknown as Promise<TRepos[]>
}