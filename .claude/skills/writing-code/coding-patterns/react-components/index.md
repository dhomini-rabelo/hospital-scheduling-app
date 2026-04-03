# React Component Coding Patterns

## Organize reusable components by scope

- UI components are small and foundational components such as buttons, labels, inputs, and so on.
- Common components compose UI components to build larger parts of the interface such as ListingCard, SupervisorNavigation, LoadingSpinner, and so on.
- In supervisor web, keep this split under `packages/infra/web/supervisor-app/src/layout/components/ui` and `packages/infra/web/supervisor-app/src/layout/components/common`.

```tsx
// Correct way
import { Button } from "../ui/Button";

export function AppHeader() {
  return <Button>Save</Button>;
}

// Avoid mixing foundational and composed components in a single shared folder
export function SharedButtonHeader() {
  return <button>Save</button>;
}
```

## Follow component declaration and import conventions, and use destructuring for props

```tsx
// Correct way
import { useEffect, useRef, useState } from "react";

export function MyComponent({ title }: MyComponentProps) {
  return <h1>{title}</h1>;
}

// Avoid
import React from "react";

export default function MyComponent(props: MyComponentProps) {
  return <h1>{props.title}</h1>;
}
```

## Use Tailwind v4 with global theme colors

- Prefer Tailwind utility classes using project theme tokens from `packages/infra/web/supervisor-app/src/layout/styles/global.css`.
- Add missing colors to global theme tokens when needed instead of hardcoding new colors in components.

```tsx
// Correct way
<button className="bg-primary-500 text-neutral-0 hover:bg-primary-600" />

// Avoid hardcoded colors that bypass theme tokens
<button className="bg-[#3b82f6] text-[#ffffff]" />
```

## Use lucide-react for icons

```tsx
// Correct way
import { CalendarCheck } from "lucide-react";

export function HeaderIcon() {
  return <CalendarCheck size={20} className="text-primary-400" />;
}
```

## Prefer explicit handlers and function declarations

- Use function declarations for components and event handlers.
- Prefix event handlers with `handle`.
- Keep helper functions without `handle` prefix.
- Avoid inline functions in JSX when no arguments are needed.
- Inline arrow functions are acceptable when parameters must be passed.

```tsx
// Correct way
function handleIncrementCounter() {
  setState((previousState) => ({
    ...previousState,
    counter: previousState.counter + 1,
  }));
}

<button onClick={handleIncrementCounter}>Increment</button>

// Exception for parameter passing
<button onClick={() => editTask(taskId)}>Edit</button>

// Exception for parameter passing
<button onClick={() => activateDialog("create-event")}>Edit</button>

// Avoid
<button onClick={() => setState((previousState) => ({
  ...previousState,
  counter: previousState.counter + 1,
}))}>Increment</button>
```

## Keep utility functions outside the component when they do not depend on component scope

- Place helper functions at module level when they do not use component state, refs, props, or hooks.
- Keep functions inside the component only when they depend on component-specific values.

```tsx
// Correct way
function getCounterValueGoal(counter: number) {
  return counter * 2;
}

export function MyComponent({ counter }: MyComponentProps) {
  return <p>Counter value goal: {getCounterValueGoal(counter)}</p>;
}

// Avoid when the function is pure and reusable
export function MyComponent({ counter }: MyComponentProps) {
  function getCounterValueGoal(value: number) {
    return value * 2;
  }

  return <p>Counter value goal: {getCounterValueGoal(counter)}</p>;
}
```

## Use object state for related values

- If the component has multiple related state values, use a single state object and an interface for its shape.
- For short components, naming the pair as `state` and `setState` is acceptable.
- For longer components, use specific names such as `deletionState` and `setDeletionState`.

```tsx
interface DeleteItemDialogState {
  isDeleting: boolean;
  formError: string | null;
}

export function DeleteItemDialog() {
  const [state, setState] = useState<DeleteItemDialogState>({
    isDeleting: false,
    formError: null,
  });

  async function handleDelete() {
    try {
      setState({ isDeleting: true, formError: null });
      await authClient.delete(deleteURL);
      onDeleteSuccess();
      close();
    } catch {
      setState({ isDeleting: false, formError: "Failed to delete item." });
    } finally {
      setState({ isDeleting: false, formError: null });
    }
  }

  return (
    <>
      <Button disabled={state.isDeleting}>Cancel</Button>
      <Button isLoading={state.isDeleting}>Delete</Button>
    </>
  );
}
```

## Use useDialogs for opening, closing, and rendering dialogs by key

```tsx
export function EventsPage() {
  const { currentActiveDialog, activateDialog, disableDialog } =
    useDialogs<"create-event">();

  return (
    <>
      <Button onClick={() => activateDialog("create-event")}>New Event</Button>
      {currentActiveDialog === "create-event" && (
        <CreateEventDialog onClose={disableDialog} />
      )}
    </>
  );
}
```
