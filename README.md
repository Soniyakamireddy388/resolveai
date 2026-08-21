# ResolveAI — Real-Time Exception Resolution Workbench

An AI-assisted exception resolution workbench built for the **Supervity Forward Deployed Engineer (FDE) Technical Assessment — Problem 9**.

ResolveAI helps human reviewers investigate flagged financial transactions, understand why an exception occurred, receive AI-assisted resolution recommendations, and resolve exceptions using a confidence-based human-in-command workflow.

---

## Problem Statement

### Problem 9 — Real-Time Exception Resolution Workbench

Build a lightweight web application where flagged transactions from a mock dataset appear in a queue, and a human reviewer can ask an AI Employee to:

- Explain an exception
- Suggest a resolution
- Auto-resolve high-confidence exceptions
- Escalate lower-confidence exceptions for human review
- Track all actions through an audit trail

---

# Overview

ResolveAI combines a transaction exception dashboard with an AI Employee.

The application follows a human-in-command approach:

```text
                Mock Transaction Data
                         |
                         v
                Exception Queue
                         |
                         v
                  Human Reviewer
                   /           \
                  /             \
                 v               v
        AI Explanation      Resolution Action
                 |               |
                 |       +-------+-------+
                 |       |               |
                 v       v               v
              AI Chat  Auto Resolve  Human Review
                            |
                            v
                       Audit Trail
