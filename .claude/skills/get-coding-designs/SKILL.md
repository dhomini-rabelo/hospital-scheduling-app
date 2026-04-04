---
name: get-coding-designs
description: Use when you need to create/edit a feature that requires writing code in multiple files and you are not sure about the design or architecture of the code to write. This skill will help you get the necessary context about the design structure patterns to keep the code consistent with the existing codebase.
---

# Coding Structures Overview

- **Backend Structure Patterns**:
  - Purpose: Define the clean architecture layering for backend code across domain entities, repository abstractions and implementations, adapters, use cases, HTTP routes, and error handling.
  - When to Use: Use when creating or changing backend features that need clear dependency boundaries between domain, adapters, and infrastructure.
  - Coding structures: `${PROJECT_ROOT}/.claude/skills/get-coding-designs/designs/backend-structures.md` (use the `read/readFile` tool to understand more of this structure if needed)

- **Page Structure Patterns**:
  - Purpose: Define the page-level file organization and composition pattern for frontend pages, including `page.tsx`, scoped components, hooks, and states.
  - When to Use: Use when creating or refactoring frontend pages to keep folder hierarchy and component boundaries consistent.
  - Coding structures: `${PROJECT_ROOT}/.claude/skills/get-coding-designs/designs/page-structure.md` (use the `read/readFile` tool to understand more of this structure if needed)
