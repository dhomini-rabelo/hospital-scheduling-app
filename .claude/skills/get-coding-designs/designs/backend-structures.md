# Backend Structure Patterns — Clean Architecture

Path alias: `@/*` maps to `backend/src/*`

---

## 1. Entities

**Location:** `backend/src/domain/entities/`

Extend the base `Entity<Props>` class from `@/modules/domain/entity.ts`. Each entity must expose `create` and `reference` static factory methods.

```ts
// backend/src/domain/entities/user.ts
import { Entity } from '@/modules/domain/entity'

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  SUPERVISOR = 'SUPERVISOR',
}

export interface UserProps {
  name: string
  email: string
  password: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export class User extends Entity<UserProps> {
  static create(props: UserProps) {
    return new User(props)
  }

  static reference(id: string, props: UserProps) {
    return new User(props, id)
  }
}
```

- `create` — builds a new entity (auto-generates ID)
- `reference` — rebuilds an existing entity from persistence (uses known ID)

---

## 2. Repository Abstractions

**Location:** `backend/src/adapters/repositories/`

Define abstract classes with the operations the domain needs. These do **not** depend on any infrastructure.

```ts
// backend/src/adapters/repositories/user-repository.ts
import { User } from '@/domain/entities/user'

export abstract class UserRepository {
  abstract getById(id: string): Promise<User>
}
```

---

## 3. Repository Implementations (Prisma)

**Location:** `backend/src/infra/adapters/repository/`

Implement repository abstractions using the Prisma client. Name the class with the `Prisma` prefix.

```ts
// backend/src/infra/adapters/repository/prisma-user-repository.ts
import { UserRepository } from '@/adapters/repositories/user-repository'
import { User } from '@/domain/entities/user'

export class PrismaUserRepository implements UserRepository {
  async getById(id: string): Promise<User> {
    // use prisma client to fetch and return User.reference(...)
  }
}
```

---

## 4. Adapter Abstractions

**Location:** `backend/src/adapters/`

Define abstract classes for external services (AI clients, email providers, etc.). Keep them infrastructure-agnostic.

```ts
// backend/src/adapters/ai-client.ts
export type AIAskPayload = {
  prompt: string
}

export type AITextResponse = {
  answer: string
  aiCreditsConsumed: number
}

export abstract class AIClient {
  abstract askWithSchema(payload: AIAskPayload): Promise<AITextResponse>
}
```

---

## 5. Adapter Implementations

**Location:** `backend/src/infra/adapters/`

Implement adapter abstractions using a concrete library. Name the class with the **library name** as prefix.

```ts
// backend/src/infra/adapters/openai-ai-client.ts
import { AIClient, AIAskPayload, AITextResponse } from '@/adapters/ai-client'

export class OpenaiAiClient implements AIClient {
  async askWithSchema(payload: AIAskPayload): Promise<AITextResponse> {
    // use openai sdk
  }
}
```

---

## 6. Use Cases

**Location:** `backend/src/domain/use-cases/`

Implement the `UseCase` interface from `@/modules/domain/use-case.ts`. Receive dependencies (repositories, adapters) via constructor injection.

```ts
// backend/src/domain/use-cases/user/create.ts
import { UseCase } from '@/modules/domain/use-case'
import { UserRepository } from '@/adapters/repositories/user-repository'
import { HashService } from '@/adapters/hash-service'
import { User } from '@/domain/entities/user'

interface Payload {
  name: string
  email: string
}

interface Response {
  user: User
}

export class CreateUserUseCase implements UseCase {
  constructor(
    private userRepository: UserRepository,
    private hashService: HashService,
  ) {}

  async execute(payload: Payload): Promise<Response> {
    // orchestrate domain logic using injected abstractions
  }
}
```

---

## 7. Routes

**Location:** `backend/src/infra/http/routes/`

Each route file exports a function that receives the request and returns a response. Use a **Zod schema** to validate the request payload.

```ts
// backend/src/infra/http/routes/create-user.ts
import { Request, Response } from 'express'
import { z } from 'zod'

const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
})

export async function createUser(req: Request, res: Response) {
  const payload = createUserSchema.parse(req.body)
  // instantiate use case with concrete implementations, call execute, return response
}
```

---

## 8. Route Registration

**Location:** `backend/src/infra/http/app.ts`

Register routes in the Express app.

```ts
// backend/src/infra/http/app.ts
import { createUser } from '@/infra/http/routes/create-user'

app.post('/users', createUser)
```

---

## 9. Error Handling in Use Cases

**Location:** `backend/src/domain/use-cases/**`

For business rule failures and domain constraints, throw typed errors from `@/modules/domain/errors.ts`.

- Use `ValidationError` when the failure is tied to a specific input field.
- Use `DomainError` for domain-level failures that are not tied to one field.
- Always set a stable `code` string (used by API layer for i18n/messages).
- Fill `variables` with dynamic values used to format the final message.
- Use `DangerErrors` in `DomainError.errorType` to classify severity/category.

```ts
import { DangerErrors, DomainError, ValidationError } from '@/modules/domain/errors'

// Invalid or conflicting value for one specific input field
throw new ValidationError({
  errorField: params.field as string,
  code: 'UNIQUE_FIELD_ERROR',
  variables: [params.field.toString()],
})

// Auth/permission domain error
throw new DomainError({
  errorType: DangerErrors.UNAUTHORIZED,
  code: 'JWT_TOKEN_EXPIRED',
})

// Field-level relation validation (multiple invalid ids)
throw new ValidationError({
  errorField: 'sectorCategoryIds',
  code: 'MANY_TO_ONE_RELATION_INVALID',
  variables: notFoundCategories,
})

// Domain integrity constraint violation
throw new DomainError({
  errorType: DangerErrors.DATA_INTEGRITY,
  code: 'EMAIL_SHOULD_START_WITH_COMPANY',
  variables: [payload.email],
})
```

---

## Layer Dependency Rule

```
Routes (infra/http) -> Use Cases (domain) -> Abstractions (adapters)
                                                    ^
                                                    |
                                    Implementations (infra/adapters)
```

- **domain/** depends only on **adapters/** (abstractions)
- **infra/** implements **adapters/** and wires everything together
- **adapters/** has no dependencies on infra or domain entities beyond what it defines
