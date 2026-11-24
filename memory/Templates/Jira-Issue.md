---
id: "jira-issue"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "repository-documentation-and-user-task"
tags: ["transivium", "reference"]
---

# Jira-style issue template

Use a unique local TRN key. Frontmatter for issue notes adds issue_key, issue_type (Epic/Story/Task), summary, issue_status (To Do/In Progress/Blocked/Done/Deferred), priority (P0/P1/P2), epic, depends_on, requirements, tests and estimate_person_days (number or null). Template notes do not themselves carry issue_key.

## User story / outcome

As a specific user, I want the capability, so that a concrete outcome is possible.

## Acceptance criteria

Use observable conditions including normal, empty, invalid and bounded failure behavior as relevant. Link canonical requirement notes and source sections.

## Dependencies and tests

Record local dependency IDs, planned TC IDs and actual evidence separately. NOT RUN remains explicit until executed. Do not invent assignees, deadlines, estimates or Jira upload status.

## Delivery

Use the memory-first handoff and main commit/push workflow. Done requires acceptance evidence and documented limitations.

## Links

- [[memory/Issues/Backlog]]
- [[memory/Requirements/Index]]
- [[memory/Workflow]]
