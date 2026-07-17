---
description: Create a task branch, implement the requested change, validate it and commit only after successful checks
agent: build
---

You are working on the NutriTrack repository.

The user's task is:

$ARGUMENTS

Follow this workflow exactly.

## Phase 1 — Inspect

1. Run:

git status --short

2. Run:

git branch --show-current

3. Read package.json.

4. Inspect only the files likely related to the task.

5. Do not modify code yet.

6. If the working tree contains unrelated uncommitted changes, stop and ask the user what to do.

7. Briefly identify:
   - the likely root cause or implementation location;
   - the files likely to change;
   - the tests that should be run.

## Phase 2 — Create or select branch

Determine the task type:

- Bug fix: fix/
- New feature: feature/
- Tests only: test/
- Refactor: refactor/
- Documentation: docs/
- Maintenance: chore/

Generate a short English branch name.

Branch naming rules:

- lowercase only;
- use hyphens between words;
- no spaces;
- no Turkish characters;
- clearly describe the task.

Examples:

- fix/register-button-disabled-ui
- fix/registration-loading
- feature/water-tracker
- test/profile-screen
- refactor/auth-service

If the current branch is main, create and switch to the new branch using:

git switch -c <branch-name>

If already on a suitable dedicated branch, continue on that branch.

Do not create a branch from another unfinished task branch.

## Phase 3 — Implement

1. Find the real root cause.
2. Make the smallest safe change.
3. Only modify files related to the task.
4. Do not refactor unrelated code.
5. Do not change unrelated screen designs.
6. Do not update unrelated dependencies.
7. Preserve existing behavior.
8. Add or update unit or integration tests when practical.
9. Do not commit yet.

## Phase 4 — Validate

Inspect package.json and determine the available validation scripts.

Run the relevant available commands, including when present:

npm run lint

npx tsc --noEmit

npm test -- --runInBand

Also run focused tests related to the changed area when available.

If any validation fails:

1. Diagnose the failure.
2. Fix failures caused by the current task.
3. Run the checks again.
4. Do not create a commit while task-related checks are failing.

If a failure already existed before this task and is unrelated, stop before committing and report it clearly.

## Phase 5 — Review

Before committing, run:

git diff --check

git diff --stat

git diff

Confirm that:

- there are no unrelated changes;
- no secrets or credentials were added;
- no .env file was added;
- no unnecessary generated files were added;
- no build outputs were added;
- only task-related files changed.

## Phase 6 — Commit

Only if all relevant validations pass:

1. Stage only the files related to the task.
2. Create one focused Conventional Commit.
3. Use an English commit message.
4. Do not push.
5. Do not merge.
6. Do not open a Pull Request.

Allowed commit formats:

- fix(scope): description
- feat(scope): description
- test(scope): description
- refactor(scope): description
- docs(scope): description
- chore(scope): description

## Phase 7 — Report

At the end, report:

- Branch name
- Root cause
- Files changed
- Tests added or updated
- Validation commands executed
- Validation results
- Commit message
- Commit hash
- Push status: not pushed
- Recommended manual verification
- Suggested Pull Request title
- Suggested Pull Request description

Never push to GitHub unless the user explicitly asks for it.

Never merge into main.

Never force-push.
