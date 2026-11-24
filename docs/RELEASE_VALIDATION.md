---
id: doc-release-validation
type: reference
status: active
created: 2026-11-24
updated: 2026-11-24
confidence: high
source: test-plan-and-release-requirements
tags: [transivium, release]
---

# External validation for v1.0.0

The automated release checks and reviews are recorded in [[docs/QUALITY_REVIEW]] and [[docs/TEST_EVIDENCE]]. This page provides the remaining human and partner procedures. All three remain **NOT RUN** pending an external environment or participants.

## TC-35 partner simulator exchange

1. Start a copy of the release and run `python3 scripts/demo.py`. Use its `verifiedRegex` from D01, or download the verified artifact in the editor.
2. Record the partner simulator name and version. Import the expression with the whole separately declared alphabet `["0","1"]` using the operator conventions in [[docs/05_ALGORITHMS]].
3. Complete and minimize the partner's reconstruction. Expect three states, rejection of empty input and `10`, and acceptance of `101`. Preserve full transitions and start/final marks in the reconstructed model.
4. Load or recreate that DFA in Transivium's comparison workspace and compare with D01. Record the actual exported text, declared alphabet, result, any shortest witness and the partner's parser settings. Example strings help explain differences. Exact product search decides language equality.
5. Record PASS only after the partner simulator produces the equivalent complete minimal model. If it cannot import the syntax or capture the declared alphabet, record the limitation.

## TC-39 learner study

Use five willing participants and a fresh local session for each. Give each person the D01 state and transition table in [[docs/USER_GUIDE]]. Ask them to build the DFA, validate it, run `101` and `10`, then download its verified regex. Let learners use the in-app guide. Record completion, assistance needed, time, and any step where they got stuck. Use participant numbers and omit personal details. The acceptance target is four of five completing all steps without assistance.

| Participant | Build and validate | Run both strings | Download verified JSON | Time | Assistance or blocker |
|---|---|---|---|---|---|
| 1 | Pending | Pending | Pending | Pending | Pending |
| 2 | Pending | Pending | Pending | Pending | Pending |
| 3 | Pending | Pending | Pending | Pending | Pending |
| 4 | Pending | Pending | Pending | Pending | Pending |
| 5 | Pending | Pending | Pending | Pending | Pending |

## Independent formal review

Record the reviewed release commit and reviewer role. Check one worked example of subset construction, minimality, a shortest witness, a Moore initial output and an independently reconstructed regex. Confirm that each successful conversion uses exact verification and that a verification failure never returns a certified artifact. Record findings and the reviewer's conclusion alongside [[docs/TEST_EVIDENCE]].

- [[memory/Issues/TRN-28]]
- [[memory/Decisions/Open-Decisions]]
