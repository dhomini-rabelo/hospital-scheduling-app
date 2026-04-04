# Page Structure

## File layout

Each page lives in its own folder under `src/pages/` and follows this structure:

```
{PageName}/
├── page.tsx
├── components/
│   ├── {UniqueComponent}.tsx
│   └── {MediumBigComponent}/
│       ├── {ComponentName}.tsx
│       ├── {SubComponentName}.tsx
│       └── {MediumBigSubComponent}/
│           └── {SubSubComponentName}.tsx
├── hooks/
└── states/
```

## page.tsx

The `page.tsx` file is the entry point of the page. It composes layout elements and page-level components.

```tsx
import { EmployeeActiveEvents } from "./components/EmployeeActiveEvents/EmployeeActiveEvents";
import { EmployeeTaskList } from "./components/EmployeeTaskList/EmployeeTaskList";

export function EmployeeEvents() {
  return (
    <main>
      <EmployeeActiveEvents />
      <EmployeeTaskList />
    </main>
  );
}
```

## components/

Contains components scoped to the page. There are two patterns:

- **Small unique component** — a single file: `components/{UniqueComponent}.tsx`
- **Medium/big component** — a folder: `components/{ComponentName}/{ComponentName}.tsx`
  - Can have sub-components: `components/{ComponentName}/{SubComponentName}.tsx`
  - Can have nested folders for medium/big sub-components: `components/{ComponentName}/{SubComponentName}/{SubSubComponentName}.tsx`

Example from `EmployeeEvents`:

```
components/
├── EmployeeActiveEvents/
│   ├── EmployeeActiveEvents.tsx
│   └── EventSelection.tsx
└── EmployeeTaskList/
    ├── EmployeeTaskList.tsx
    └── Task.tsx
```

## hooks/

Contains custom hooks scoped to the page, used to extract reusable logic from `page.tsx` or its components.

## states/

Contains shared state definitions scoped to the page.
