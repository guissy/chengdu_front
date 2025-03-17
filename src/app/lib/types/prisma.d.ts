export interface ErrorWithName extends Error {
  name: string
  errors?: unknown
}
