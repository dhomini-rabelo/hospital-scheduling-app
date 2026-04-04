# Minimum Props Strategies

Strategies used in this project to keep component interfaces lean, avoid prop drilling, and improve local component ownership.

## 1 Zustand stores with selectors

Components read only the state slices and actions they need directly from Zustand stores.
This avoids passing domain data and callbacks through intermediary components.

```tsx
const deleteSubtask = useTasksState((store) => store.actions.deleteSubtask);
const saveEditingSubtask = useTasksState((store) => store.actions.saveEditingSubtask);

const user = useAuthStore((s) => s.state.user);
const { login, logout } = useAuthStore((s) => s.actions);
```

Typical stores:
- `states/tasks/index.ts`
- `states/workflows/index.ts`
- auth store modules

## 2 Jotai atoms for shared UI state

Use Jotai for ephemeral, feature-scoped, cross-component UI state (editing, expanded item, active dialog, selected sector).
This removes the need to lift transient UI state into parents.

```tsx
export const indexTasksPageStateAtom = atom<IndexTasksPageState>({
  editingTaskId: null,
  inExecutionTaskId: null,
  nonActiveExpandedTaskId: null,
});

export const activeSectorAtom = atom<{
  sectorId: string | null;
  categories: SelectMultipleCheckOptionData[];
}>({
  sectorId: null,
  categories: [],
});
```

Use colocated atom files (for example, feature-level state.ts or shared-state.ts) to signal feature scope instead of global state.

## 3 Dialog state hooks

Encapsulate modal lifecycle in hooks so parents pass only intent (a dialog key), not multiple open/close flags and handlers.

```tsx
const { currentActiveDialog, activateDialog, disableDialog } =
  useDialogs<"create-event">();

<Button onClick={() => activateDialog("create-event")}>New Event</Button>
{currentActiveDialog === "create-event" && (
  <CreateEventDialog onClose={disableDialog} />
)}
```

For nested trees and sibling coordination, use the atom-backed variant:

```tsx
export const sectorFormDialogAtom = atom<SectorFormDialogs | null>(null);

const { disableDialog } = useDialogsAtom<SectorFormDialogs>(sectorFormDialogAtom);
```

## 4 Form context instead of form props

Wrap forms with FormProvider and let children consume form APIs via useFormContext.
This eliminates passing control, formState, setValue, watch, and related props through layers.

```tsx
export function TaskForm({ initialFormData, onSubmit }: TaskFormProps) {
  const form = useForm<TaskSchemaType>({ /* ... */ });

  return (
    <FormProvider {...form}>
      <form>
        <SectorSelect />
        <PrioritySelect />
        <SectorCategoryMultipleSelect />
      </form>
    </FormProvider>
  );
}

export function PrioritySelect() {
  const { control, formState } = useFormContext<TaskSchemaType>();
  // ...
}
```

## 5 Custom hooks for derived state and local logic

Encapsulate filtering, derivation, and local orchestration in hooks so parents do not compute and pass derived lists.

```tsx
export function useListingTasks({ inExecutionTaskId }) {
  const tasks = useTasksState((props) => props.state.tasks);
  const selectedWorkflowId = useWorkflowsState((props) => props.state.selectedWorkflowId);
  // ...derive listingTasks, activeTasks, completedTasks
  return { tasks, listingTasks, activeTasks, completedTasks };
}
```

Similarly, hooks like useMultipleSelect and useSelect package state/actions into a coherent local API.

## 6 Granular component decomposition

Split large components into focused sub-components that pull their own data from hooks/context/atoms.
Parents should pass only minimal identity or rendering props.

Examples:
- IndexAddInput: listingMode, taskId
- IndexTaskItem: task, isActive, dragHandleProps
- IndexTaskAccordionSubtaskItem: taskId, subtask, className
- IndexErrorMessage: no props (reads atom internally)

## 7 Composition with children

Prefer composition over configuration-heavy props when defining layout/content structures.

```tsx
export function ListingCardRoot({ className, children }: ListingCardRootProps) {
  return <div className={twMerge("...", className)}>{children}</div>;
}

<ListingCard.Root>
  <ListingCard.Icon icon={User} />
  <ListingCard.Title>{item.supervisor.name}</ListingCard.Title>
  <ListingCard.Subtitle>Setor: {item.sector.title}</ListingCard.Subtitle>
</ListingCard.Root>
```

## Quick mapping: pattern to props eliminated

| Pattern | Props avoided |
|---|---|
| Zustand selectors | action callbacks, domain data threading |
| Jotai atoms | ephemeral UI flags and sibling coordination props |
| Dialog hooks | open/close booleans and handler chains |
| FormProvider + useFormContext | form API props (control, setValue, formState, etc.) |
| Custom hooks | derived lists and orchestration props |
| Granular components | intermediary forwarding props |
| Composition with children | configuration-style content props |

## Practical rule of thumb

Before adding a new prop, check this order:
1. Is this global/domain state? Use a store selector.
2. Is this feature-local shared UI state? Use a colocated atom.
3. Is this form state? Use FormProvider + useFormContext.
4. Is this derivation/logic? Move it to a custom hook.
5. Is this layout/content customization? Use children composition.
6. If none apply, pass the prop directly and keep it minimal.
