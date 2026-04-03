# Use Case Class Coding Patterns

## Prioritize focused repository queries for use case preconditions

```ts
// Correct way
const taskWithEvent = await this.taskRepository.getWithEvent(
  createID(payload.eventId),
  {
    id: createID(payload.taskId),
  },
)

validateEventIsActive(taskWithEvent.event)
validateTaskType(taskWithEvent.task, TaskExecutionType.EXECUTION_ONLY)

// Avoid in this flow because it can lead to unnecessary data fetching and less efficient code
const eventWithAggregateData = await this.eventRepository.getWithAggregateData(
  createID(payload.eventId),
)

const task = eventWithAggregateData.tasks.find(
  (item) => item.id.toValue() === payload.taskId,
)
```

## Extract repeated validations into application/utils/{entity-name}.ts

```ts
// Correct way
import { validateEventIsActive } from '../../utils/event'
import {
  validateEmployeeCanExecuteTask,
  validatePhotoURLsWereProvided,
  validateTaskType,
} from '../../utils/task-execution'

validateEventIsActive(taskWithEvent.event)
validateTaskType(taskWithEvent.task, TaskExecutionType.RECEIPT_AND_EXECUTION)
validateEmployeeCanExecuteTask(taskWithEvent.task, employeeWithAggregateData)
validatePhotoURLsWereProvided(
  payload.executionPhotoURLs,
  'EXECUTION_EVIDENCE_REQUIRED',
)

// Avoid in use case classes when it repeats across multiple use cases
if (!taskWithEvent.event.props.isActive) {
  throw new DomainError({
    code: 'EVENT_NOT_ACTIVE',
    errorType: DangerErrors.DATA_INTEGRITY,
  })
}

if (taskWithEvent.task.props.executionType !== TaskExecutionType.RECEIPT_AND_EXECUTION) {
  throw new DomainError({
    code: 'TASK_EXECUTION_TYPE_INVALID',
    errorType: DangerErrors.DATA_INTEGRITY,
  })
}
```

## Use descriptive validation function names for explicit business intent

```ts
// Correct way
await this.validateNoIncompatibleExecutionExists(payload)
this.validateExecutionBelongsToPayloadContext(taskExecution, payload)
this.validateExecutionCanBeCompleted(taskExecution)

// Avoid generic or unclear names
await this.validate(payload)
this.check(taskExecution, payload)
this.ensureStatus(taskExecution)
```
