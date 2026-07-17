# Task Workflow

You are executing the `/task` command for the NutriTrack project.

**Task description:** $ARGUMENTS

Follow every step below precisely. Do not skip steps. Do not deviate from this workflow.

---

## Step 1: Read the Task

Parse the task description from `$ARGUMENTS`. Understand what the user is asking you to do. If the description is empty or unclear, ask the user to clarify before proceeding.

---

## Step 2: Inspect the Repository

Gather context before making any changes. Read and summarize the following:

- `AGENTS.md` — project conventions and rules
- `package.json` — dependencies, scripts, and project metadata
- `git status` — current working tree state
- `git branch` — current branch
- Any files directly relevant to the task

Summarize your understanding of the project state before proceeding.

---

## Step 3: Create a Safe Branch

Before writing any code:

1. Run `git status` and inspect for **unrelated uncommitted changes**.
2. If unrelated changes exist, **stop immediately**. Do not stash, discard, overwrite, or commit them. Warn the user clearly and ask them to resolve the working tree first.
3. Check the current branch with `git branch --show-current`.
4. **Never perform development directly on `main`.**
5. If the current branch is `main`, create and switch to a dedicated task branch:
   - Choose a concise branch name based on the task:
     - `fix/...` for bug fixes
     - `feature/...` for new features
     - `test/...` for test work
     - `refactor/...` for refactors
     - `docs/...` for documentation
     - `chore/...` for tooling or maintenance
   - Use `git checkout -b <branch-name>` to create and switch to the new branch.

---

## Step 4: Report the Plan

Before editing any files, briefly report to the user:

- **Planned branch name**
- **Likely files** that will be modified
- **Implementation plan** — a short summary of what you will do

Wait for no approval. Proceed immediately after reporting.

---

## Step 5: Implement the Task

Implement only the requested task. Follow these rules:

- Avoid unrelated refactors or "improvements" outside the task scope.
- Preserve existing behavior unless the task explicitly requires changing it.
- Do not expose secrets, API keys, passwords, or tokens.
- Do not commit or generate: APK files, `.env` files, credentials, caches, screenshots, or local tooling artifacts.
- Follow the conventions found in `AGENTS.md` and the existing codebase.

---

## Step 6: Validate

Inspect `package.json` to discover available validation scripts. Run all that are relevant and applicable:

- **Linting** (e.g. `npm run lint`)
- **TypeScript typecheck** (e.g. `npm run typecheck` or `npx tsc --noEmit`)
- **Unit tests** (e.g. `npm test`)
- **Task-specific tests** if the task involves testable logic
- **Build check** (e.g. `npm run build`)

Run each command and capture the output.

---

## Step 7: Handle Validation Failures

If any validation command fails:

1. Attempt to fix the failures **only if they were caused by your changes**.
2. Re-run the failed command after fixing.
3. If failures remain after your fix attempts:
   - **Do not create a commit.**
   - **Do not push.**
   - **Do not create a Pull Request.**
   - Report the failed command and the relevant error output to the user.
   - Stop here.

---

## Step 8: Create a Local Commit

If all validation passes:

1. Run `git status` and `git diff` to review all changes.
2. Ensure **only task-related files** are staged. Do not include unrelated files.
3. Stage the relevant files with `git add`.
4. Create a single commit using **Conventional Commits** format:
   - Use an appropriate type: `feat`, `fix`, `test`, `refactor`, `docs`, `chore`, etc.
   - Include a scope derived from the task or affected module.
   - Write a clear, concise commit message.
   - Example: `feat(nutrition): add daily calorie summary widget`
5. **Do not push.**

---

## Step 9: Show Completion Report

After the commit is created, display a completion report containing:

- **Branch name**
- **Root cause or task summary**
- **Modified files** (list them)
- **Validation commands and results** (each command and pass/fail)
- **Commit message**
- **Commit hash**
- **Suggested Pull Request title**
- **Suggested Pull Request description**

---

## Step 10: Ask for Approval

After showing the report, ask the user **exactly**:

```
The task is committed locally and all validations passed. Would you like me to push the branch and create a Pull Request now?
```

Wait for the user's response. Do not proceed without explicit approval.

---

## Step 11: Push and Create Pull Request (Only After Explicit Approval)

When the user explicitly approves:

1. Confirm the current branch is **not** `main`.
2. Confirm the working tree is **clean** with `git status`.
3. Confirm `gh` is installed and authenticated by running `gh auth status`.
4. Push the current branch:
   ```
   git push -u origin <current-branch>
   ```
5. Create a Pull Request against `main` using GitHub CLI:
   ```
   gh pr create --base main --head <current-branch> --title "<PR title>" --body "<PR description>"
   ```
6. **Do not merge** the Pull Request.
7. **Do not delete** local or remote branches.
8. Report the created Pull Request URL to the user.

---

## Step 12: Handle `gh` Unavailability

If `gh` is unavailable or not authenticated:

- If the push succeeded, keep the branch pushed.
- Do **not** pretend the PR was created.
- Provide the user with the exact command they need to authenticate or create the PR manually, for example:
  ```
  gh auth login
  gh pr create --base main --head <branch> --title "..." --body "..."
  ```

---

## Rules — Never Do the Following

- Never push directly to `main`.
- Never force-push.
- Never merge a Pull Request.
- Never delete local or remote branches.
- Never bypass failed tests.
- Never commit unrelated files.
- Never expose secrets, keys, or credentials.
