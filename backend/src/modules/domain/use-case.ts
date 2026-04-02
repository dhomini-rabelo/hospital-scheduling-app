export interface UseCase<Response = unknown> {
  execute(payload: unknown): Promise<Response>
}
