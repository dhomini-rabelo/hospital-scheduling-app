# Code Patterns

- Use descriptive names for variables, functions, and classes.

```typescript
// Wrong way
const list1 = []
list1.push({
  name: 'John Doe',
  testScore: 10,
})

// Correct way
const students = []
students.push({
  name: 'John Doe',
  testScore: 10,
})

// Wrong way
const invalidDays = [0, 6]

// Correct way
const weekendDays = [0, 6]

// Wrong way
function filterBody(body) {
  return Object.entries(body).reduce((acc, [key, value]) => {
    return value === undefined ? acc : { ...acc, [key]: value }
  })
}

// Correct way
function removeKeysWithUndefinedValue(object) {
  return Object.entries(object).reduce((acc, [key, value]) => {
    return value === undefined ? acc : { ...acc, [key]: value }
  })
}

```

- Use descriptive boolean variable names.

```typescript
// Wrong way
const runMigration = true
const admin = true
const validOption = true
const permission = true

// Correct way
const shouldRunMigration = true
const isAdmin = true
const isOptionValid = true
const doesUserHavePermission = true
```

- Use object.property instead of destructuring in const declarations.

```typescript
// wrong way
const { audioBuffer } = payload

// correct way
payload.audioBuffer
```

```typescript
// wrong way
const audioBuffer = payload.audioBuffer

// correct way
payload.audioBuffer
```
