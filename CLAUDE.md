## Rules

## When editing or planning code

- Always use the `get-coding-designs` skill
- Always use the `writing-code` skill

## When using coding skills

- Make sure to read the sub files referenced into the main SKILLS.md file. They contain important information about the coding skills and how to use them effectively.

### After finishing a task

- Run the linting command in the right project. The lint command is always `npm run lint:fix`.

```bash
cd /path/to/project && npm run lint:fix
```

- Run the typescript compiler in the right project. The command is always `tsc --noEmit`.

```bash
cd /path/to/project && npx tsc --noEmit
```