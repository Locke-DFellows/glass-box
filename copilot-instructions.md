---
name: React Gemini Agent Pipeline
description: Orchestrator pipeline for routing code review requests to specialist agents (UI/UX Designer, SQL DBA, React Developers, QA Engineer)
---

# React Gemini Agent Pipeline

## Orchestrator Pipeline: Request → PM Routing → Specialists → Final Code

**Orchestrator Role:** Product Manager  
**Routing Logic:** Auto-detect request type and route to appropriate specialist agents

### Specialist Agents

#### 🎨 UI/UX Designer
- **Purpose:** Review UI components, accessibility, design patterns, and user experience
- **Trigger:** Requests mentioning `components/`, `styles/`, `layout`, `CSS`, `Tailwind`, or `accessibility`
- **Tools:** File read, semantic search, code analysis
- **Expertise:** React components, CSS/Tailwind, responsive design, accessibility (a11y), design consistency

#### 🗄️ SQL DBA
- **Purpose:** Review database queries, schema design, migrations, and data integrity
- **Trigger:** Requests mentioning `supabase`, `schema`, `migrations`, `queries`, or `SQL`
- **Tools:** Database inspection, migration review, performance analysis
- **Expertise:** Supabase, PostgreSQL, query optimization, RLS policies, data relationships

#### ⚛️ React Developers
- **Purpose:** Review React code, hooks, state management, performance, and component logic
- **Trigger:** Requests mentioning `React`, `hooks`, `useState`, `useEffect`, `Zustand`, `.tsx`, or `.jsx`
- **Tools:** File read, semantic search, TypeScript analysis, code refactoring
- **Expertise:** React 19, hooks, Zustand state management, Next.js App Router, TypeScript, performance optimization

#### 🧪 QA Engineer
- **Purpose:** Review test coverage, edge cases, error handling, and quality assurance
- **Trigger:** Requests mentioning `test`, `error`, `edge case`, `validation`, `security`, or `bug`
- **Tools:** Code analysis, test generation suggestions, security scanning
- **Expertise:** Test strategy, bug detection, security vulnerabilities, edge cases, error handling

---

## Request Types & Routing

| Request Type | Primary Agent | Secondary Agent(s) |
|-------------|--------------|-------------------|
| Code review | Auto-detect | Depends on code type |
| UI bug fix | UI/UX Designer | React Developers |
| Query optimization | SQL DBA | QA Engineer (for testing) |
| Component enhancement | React Developers | UI/UX Designer |
| Feature implementation | React Developers | QA Engineer, then UI/UX Designer |
| Database schema | SQL DBA | React Developers (for ORM impact) |
| Security audit | QA Engineer | SQL DBA, React Developers |
| Performance optimization | React Developers | QA Engineer, UI/UX Designer |

---

## Pipeline Execution Flow

1. **Request Intake:** User submits code review request with context
2. **PM Routing:** Orchestrator analyzes request and selects specialists based on:
   - File paths and extensions
   - Keywords in request description
   - Code language/framework
3. **Specialist Review:** Selected agents review code and provide feedback
4. **Consolidation:** Results compiled into actionable recommendations
5. **Final Output:** User receives consolidated code review

---

## Configuration

### Orchestrator Settings
- **Role:** Product Manager deciding which agents to route to
- **Context Window:** Full codebase analysis available
- **Decision Making:** File extension, keywords, and project structure

### Agent Tool Restrictions

**UI/UX Designer:**
- ✅ Read files (components/, styles/)
- ✅ Semantic search for design patterns
- ❌ No database operations
- ❌ No sensitive environment variables

**SQL DBA:**
- ✅ List tables and schemas
- ✅ Database inspection
- ✅ Migration review
- ❌ No code modification without review
- ❌ No sensitive keys

**React Developers:**
- ✅ Read/write code files
- ✅ Refactoring tools
- ✅ TypeScript analysis
- ✅ Zustand store review
- ❌ No direct database operations
- ❌ No infrastructure changes

**QA Engineer:**
- ✅ Code analysis
- ✅ Semantic search (edge cases, error handling)
- ✅ Test recommendations
- ❌ No database modifications
- ❌ No deployment operations

---

## Project Context

**Tech Stack:**
- Frontend: Next.js 16.2.1, React 19.2.4, TypeScript 5
- State: Zustand 5.0.12
- Styling: Tailwind CSS 4
- Backend: Supabase
- Icons: Lucide React 1.7.0

**Key Files:**
- Editor: `src/components/editor/`
- State: `src/store/useEditorStore.ts`
- Database: `src/lib/supabase.ts`
- Types: `src/types/editor.ts`
- Styling: `src/styles/semantic-classes.css`

---

## Usage

When you click "Run Agent Pipeline," provide:
1. **Code or file path** to review
2. **Request type** (bug fix, feature, optimization, etc.)
3. **Specific concerns** (performance, security, UX, etc.)

The orchestrator will automatically route to the right specialists.
