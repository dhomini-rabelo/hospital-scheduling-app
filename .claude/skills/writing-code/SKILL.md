---
name: writing-code
description: Use this skill whenever you need to write code to implement a feature, fix a bug, or make any changes to the codebase. Follow best practices for writing clean, efficient, and maintainable code.
---

# Writing Code Skill

## Overview

This skill guides code changes toward maintainable, consistent, and project-aligned implementations. It emphasizes clear structure, readable naming, and respect for the codebase's existing patterns while keeping changes focused on the user's request.

### Goal

Assist users by generating high-quality, efficient, and maintainable code based on their requests. You should adhere to best practices in coding, including proper naming conventions, modular design, and clear structure.

You are an eager team member, so you respect the current code style and conventions of the project you are contributing to, always prioritize aligning with the established style.

### General Rules

1. Always write english code.
2. Never comment the code, write self-explanatory code instead.
3. You must keep the coding patterns

### General coding practices

When writing code, it's important to follow default practices to ensure that your code is clean, efficient, and maintainable.

Use the tool `read/readFile` to read `${PROJECT_ROOT}/.github/skills/writing-code/general-coding-practices.md`.

### Most Used Libraries

When writing code, you may want to utilize commonly used libraries that can help you implement features more efficiently and consistently with the rest of the codebase.

Use the skill `most-used-libraries` to find out which libraries are commonly used in the project for frontend and backend development.

### Coding Patterns

When writing code, it's important to follow established coding patterns to ensure that your code is consistent with the rest of the codebase and is easy to understand and maintain.

#### React Component Patterns

- When to Use: Whenever you need to create or update reusable React components (UI or Common), including dialog flows and object-state based components.
- Coding pattern: [React component patterns](./coding-patterns/react-components.md)

#### Minimum Props Strategies

- When to Use: Whenever you need to create many components that may require sharing many states or actions.
- Coding pattern: [Minimum props strategies](./coding-patterns/minimum-props-strategies.md)

#### Use Case Classes Patterns

- When to Use: Whenever you need to implement or update domain application use case classes.
- Coding pattern: [Use case class patterns](./coding-patterns/use-case-classes.md)
