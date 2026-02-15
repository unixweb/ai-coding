# Product Requirements Document

## Vision
A simple, fast project management tool designed for small software development teams (5-15 people). We're building a lightweight alternative to Jira and Asana that eliminates complexity and reduces clicks. Teams can create projects, manage tasks, collaborate with team members, and track progress without the overhead of enterprise tools.

## Target Users
**Primary Users:** Small to mid-size software development teams (5-15 people)

**Needs:**
- Quick project and task creation without navigating through complex menus
- Clear visibility into what everyone is working on
- Simple collaboration without enterprise-level permissions complexity
- Fast onboarding for new team members

**Pain Points:**
- Jira is too complex with too many features they don't need
- Trello is too basic and lacks proper team collaboration
- Asana is expensive and has a steep learning curve
- Most tools require 30+ minutes of setup before creating the first task

## Core Features (Roadmap)

| Priority | Feature | Status | Spec |
|----------|---------|--------|------|
| P0 (MVP) | Benutzer-Authentifizierung | Planned | [PROJ-1](../features/PROJ-1-user-authentication.md) |
| P0 (MVP) | Projekt-Verwaltung | Planned | [PROJ-2](../features/PROJ-2-project-management.md) |
| P0 (MVP) | Task-Verwaltung | Planned | [PROJ-3](../features/PROJ-3-task-management.md) |
| P0 (MVP) | Team-Zusammenarbeit | Planned | [PROJ-4](../features/PROJ-4-team-collaboration.md) |
| P0 (MVP) | Fortschritts-Dashboard | Planned | [PROJ-5](../features/PROJ-5-progress-dashboard.md) |

## Success Metrics
- **User Signups:** 50+ teams in first 3 months
- **Activation Rate:** 70% of signups create at least one project and 3 tasks within first session
- **Daily Active Users:** 40% of registered users active weekly
- **Task Completion Rate:** Average 60% of created tasks marked as complete
- **Time to First Task:** < 5 minutes from signup to first task created

## Constraints
- **Timeline:** MVP must launch in 2-4 weeks
- **Budget:** Bootstrap mode - use only free tiers (Vercel, Supabase)
- **Team Size:** Solo developer building and launching
- **Technology:** Locked to Next.js, Supabase, Vercel stack (already configured)

## Non-Goals
- **Time tracking** - No timers, hour logs, or time entry features
- **Advanced reporting** - No custom chart builders, pivot tables, or CSV exports
- **Third-party integrations** - No Slack, GitHub, Jira, or API connections
- **Mobile apps** - Web-responsive only, no native iOS/Android apps
- **Custom workflows** - No workflow builders or automation rules (first version uses fixed Kanban-style statuses)

---

Use `/requirements` to create detailed feature specifications for each item in the roadmap above.
