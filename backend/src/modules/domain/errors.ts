export enum DangerErrors {
  DATA_INTEGRITY = 'DATA_INTEGRITY',
  NOT_FOUND = 'NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export class DomainError extends Error {
  constructor(
    public readonly response: {
      code: string
      errorType?: DangerErrors
      variables?: string[]
    },
  ) {
    super(
      `DomainError[${response.errorType}] ${response.code} ${response.variables?.join(', ') || ''}`,
    )
  }
}

export class ValidationError extends Error {
  constructor(
    public readonly response: {
      errorField: string
      code: string
      variables?: string[]
    },
  ) {
    super(
      `ValidationError[${response.errorField}] ${response.code} ${response.variables?.join(', ') || ''}`,
    )
  }
}
