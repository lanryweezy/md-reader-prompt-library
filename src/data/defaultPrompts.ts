import { MDFile, MDFolder } from '../types';

export const INITIAL_FOLDERS: MDFolder[] = [
  { id: 'f-prompts', name: 'Prompt Library', icon: 'sparkles' },
  { id: 'f-coding', name: 'Coding & Architecture', parentId: 'f-prompts', icon: 'code' },
  { id: 'f-writing', name: 'Writing & Copywriting', parentId: 'f-prompts', icon: 'pen' },
  { id: 'f-productivity', name: 'Productivity & PRDs', parentId: 'f-prompts', icon: 'briefcase' },
  { id: 'f-creative', name: 'Creative & AI Vision', parentId: 'f-prompts', icon: 'wand' },
  { id: 'f-docs', name: 'Markdown Guides', icon: 'book-open' },
];

export const INITIAL_FILES: MDFile[] = [
  // --- CODING & ARCHITECTURE ---
  {
    id: 'p-1',
    name: 'senior-code-reviewer.md',
    path: '/Prompt Library/Coding & Architecture/senior-code-reviewer.md',
    folderId: 'f-coding',
    tags: ['code-review', 'typescript', 'security', 'architecture'],
    isPrompt: true,
    isFavorite: true,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 3600000 * 2,
    content: `# 🛡️ Senior Code Reviewer & Security Auditor Prompt

> [!TIP]
> Use this prompt when asking an AI model to perform a thorough security, performance, and clean code review.

## Role & Mission
You are a World-Class **Staff Software Engineer & Security Auditor**. Your mission is to perform a rigorous, constructive, and actionable review of target code.

---

## Input Variables
- **Language / Framework**: {{language}}
- **Primary Objective**: {{primary_goal}}
- **Strictness Level**: {{strictness_level}}

---

## Code to Review
\`\`\`{{language}}
// Paste target code or pull request diff here
\`\`\`

---

## Evaluation Checklist
Review across these key dimensions:

1. **Bug Prevention & Edge Cases**: Null dereferences, unhandled async promises, boundary conditions.
2. **Security Vulnerabilities**: OWASP Top 10, injection vectors, data exposure, unvalidated input.
3. **Performance & Complexity**: Algorithmic complexity ($O(N)$ bottlenecks), memory leaks, re-renders.
4. **Maintainability & Idiomatic Quality**: Naming consistency, single-responsibility principle, DRY code.

---

## Expected Output Format
Format your review into 3 structured sections:

- [ ] 🚨 **Critical Issues & Vulnerabilities** (Blocker issues that must be fixed before merge)
- [ ] ⚡ **Performance & Architectural Refinements** (Recommended non-blocking enhancements)
- [ ] ✨ **Refactored Code Version** (Complete, idiomatic, copy-pasteable implementation)

> [!NOTE]
> Explain *why* each suggested change improves safety or performance with standard engineering references.
`,
  },
  {
    id: 'p-2',
    name: 'system-design-architect.md',
    path: '/Prompt Library/Coding & Architecture/system-design-architect.md',
    folderId: 'f-coding',
    tags: ['system-design', 'backend', 'cloud', 'architecture'],
    isPrompt: true,
    isFavorite: true,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 3600000 * 5,
    content: `# 🏗️ Distributed System Design Architect

## Context
You are a Principal Cloud Architect designing high-concurrency, fault-tolerant distributed infrastructure.

---

## System Requirements
- **System Name**: {{system_name}}
- **Expected Scale**: {{target_scale}}
- **Latency SLA**: {{latency_sla}}
- **Primary Data Model**: {{data_model_type}}

---

## Architecture Blueprint

### 1. Requirements & Constraints
- **Availability SLA**: $99.99\\%$ uptime
- **Scalability Strategy**: Horizontal partition auto-scaling & edge caching
- **Consistency Trade-offs**: Eventual vs Strong Consistency boundaries

### 2. Topology Diagram
\`\`\`text
[ Client Applications ]
          │
          ▼
[ Global CDN / Edge WAF ]
          │
          ▼
[ API Gateway & Auth Service ] ───► [ Distributed Redis Cache ]
          │
          ├───► [ Core Microservice ] ───► [ PostgreSQL Primary / Replica Cluster ]
          │
          └───► [ Event Stream (Kafka) ] ───► [ Async Workers ] ───► [ Search Index ]
\`\`\`

### 3. Database Partition & Schema Strategy
| Table Name | Primary Key | Partition Key | Index Strategy |
| :--- | :--- | :--- | :--- |
| \`users\` | \`uuid\` | Range Hash | GSI on \`email\` |
| \`transactions\` | \`tx_id\` | Composite (\`user_id\`, \`timestamp\`) | LSI on \`status\` |
| \`audit_logs\` | \`log_id\` | Time-series partition | TTL eviction (90 days) |

---

## Execution Instructions
Provide a comprehensive document covering API contracts, caching invalidation strategy, disaster recovery strategy, and cost optimization recommendations.
`,
  },
  {
    id: 'p-3',
    name: 'sql-query-optimizer.md',
    path: '/Prompt Library/Coding & Architecture/sql-query-optimizer.md',
    folderId: 'f-coding',
    tags: ['sql', 'database', 'performance', 'postgres'],
    isPrompt: true,
    isFavorite: false,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 3600000 * 8,
    content: `# 🗄️ SQL & Relational Database Query Optimizer

## Role
You are a Lead Database Administrator (DBA) specializing in PostgreSQL and MySQL index tuning.

---

## Environment & Input
- **Database Engine**: {{db_engine}}
- **Table Size / Row Count**: {{table_size}}
- **Slow Query**:
\`\`\`sql
{{slow_query}}
\`\`\`

---

## Optimization Protocol
1. **EXPLAIN ANALYZE Breakdown**: Identify Sequential Scans, Temp File spills, and high-cost Nested Loops.
2. **Indexing Strategy**: Propose Composite Indexes, Covering Indexes, or Partial Indexes.
3. **Query Rewrite**: Rewrite the query using CTEs, Window Functions, or optimized JOINs.
4. **Benchmarking**: Compare execution plan estimates before and after optimization.
`,
  },
  {
    id: 'p-4',
    name: 'api-spec-generator.md',
    path: '/Prompt Library/Coding & Architecture/api-spec-generator.md',
    folderId: 'f-coding',
    tags: ['api', 'rest', 'openapi', 'swagger', 'backend'],
    isPrompt: true,
    isFavorite: false,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000 * 10,
    content: `# 🔌 OpenAPI 3.1 & REST Endpoint Specification Generator

## Goal
Generate a production-ready OpenAPI 3.1 JSON/YAML specification for a target backend resource.

---

## Resource Parameters
- **Resource Name**: {{resource_name}}
- **Authentication Method**: {{auth_method}}
- **Supported Operations**: {{crud_operations}}

---

## Specifications Required
- Complete REST paths (\`GET\`, \`POST\`, \`PUT\`, \`PATCH\`, \`DELETE\`).
- Request body schemas with field validations, regex patterns, and examples.
- Response payloads for \`200 OK\`, \`201 Created\`, \`400 Bad Request\`, \`401 Unauthorized\`, \`404 Not Found\`, and \`500 Internal Error\`.
- TypeScript interface definitions for client-side API SDK consuming this endpoint.
`,
  },

  // --- WRITING & COPYWRITING ---
  {
    id: 'p-5',
    name: 'master-copywriter-prompt.md',
    path: '/Prompt Library/Writing & Copywriting/master-copywriter-prompt.md',
    folderId: 'f-writing',
    tags: ['copywriting', 'marketing', 'conversion', 'pas-framework'],
    isPrompt: true,
    isFavorite: true,
    createdAt: Date.now() - 86400000 * 6,
    updatedAt: Date.now() - 3600000 * 12,
    content: `# ✒️ High-Converting PAS & AIDA Copywriter

## Target Campaign Info
- **Product / Service**: {{product_name}}
- **Target Audience Persona**: {{target_audience}}
- **Core Pain Point**: {{main_pain_point}}
- **Desired Brand Tone**: {{brand_tone}}

---

## Copywriting Blueprint

### 1. Headline Hooks (Generate 3 Options)
- **Option A (Outcome-Driven)**: Direct benefit focused.
- **Option B (Curiosity-Driven)**: Counter-intuitive insight.
- **Option C (Social Proof / High Urgency)**: Authority backed.

---

### 2. PAS Framework Execution
- **Pain**: Address the core frustration directly without fluff.
- **Agitate**: Highlight the hidden financial or emotional cost of inaction.
- **Solution**: Position {{product_name}} as the effortless, permanent fix.

---

### 3. Value Proposition Bullet Points
- [ ] Benefit 1: Action-oriented verb + tangible metric.
- [ ] Benefit 2: Immediate relief from pain point.
- [ ] Benefit 3: Long-term competitive advantage.

> [!WARNING]
> Avoid corporate buzzwords ("synergy", "revolutionary", "game-changer"). Use punchy, conversational, and active-voice prose!
`,
  },
  {
    id: 'p-6',
    name: 'tech-doc-writer.md',
    path: '/Prompt Library/Writing & Copywriting/tech-doc-writer.md',
    folderId: 'f-writing',
    tags: ['documentation', 'developer-docs', 'technical-writing'],
    isPrompt: true,
    isFavorite: false,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 3600000 * 15,
    content: `# 📘 Developer Documentation & API Guide Writer

## Context
You are a Principal Technical Writer creating developer-grade documentation for a library, API, or SDK.

---

## Subject Matter Inputs
- **Feature / Library Name**: {{library_name}}
- **Target Audience**: {{developer_experience_level}}
- **Primary Use Case**: {{use_case}}

---

## Document Structure
1. **Quick Start Guide**: Prerequisites, installation command (\`npm install\` or \`pip install\`), and minimal working snippet.
2. **Key Concepts**: Clear explanation of core abstractions and data flow.
3. **Interactive Code Examples**: Copy-pasteable TypeScript/Python code blocks with error handling.
4. **Troubleshooting & FAQ**: Common edge cases, error codes, and solutions table.
`,
  },
  {
    id: 'p-7',
    name: 'seo-article-generator.md',
    path: '/Prompt Library/Writing & Copywriting/seo-article-generator.md',
    folderId: 'f-writing',
    tags: ['seo', 'content-marketing', 'blogging', 'outline'],
    isPrompt: true,
    isFavorite: false,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 3600000 * 18,
    content: `# 🔍 High-Ranking SEO Article Generator

## Target Keywords & Audience
- **Primary Focus Keyword**: {{primary_keyword}}
- **Secondary Keywords**: {{secondary_keywords}}
- **Target Search Intent**: {{search_intent}}
- **Target Word Count**: {{target_word_count}}

---

## Outline Blueprint
1. **Title Tag & Meta Description**: Optimized for high CTR (under 60 & 155 chars).
2. **Engaging Intro**: Hook reader within 3 seconds; state key takeaway up front.
3. **Comprehensive H2/H3 Sections**: Answer search intent thoroughly with structured lists and markdown tables.
4. **FAQ Section**: 3 schema-friendly Question/Answer blocks targeting Google People Also Ask.
`,
  },

  // --- PRODUCTIVITY & PRDS ---
  {
    id: 'p-8',
    name: 'prd-generator.md',
    path: '/Prompt Library/Productivity & PRDs/prd-generator.md',
    folderId: 'f-productivity',
    tags: ['prd', 'product-management', 'spec', 'agile'],
    isPrompt: true,
    isFavorite: true,
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 3600000 * 4,
    content: `# 📋 Product Requirements Document (PRD) Specialist

## Feature Overview
- **Feature Name**: {{feature_name}}
- **Product Area**: {{product_area}}
- **Primary Stakeholder**: {{primary_stakeholder}}
- **Target Launch Date**: {{launch_target}}

---

## Executive Summary
Describe the core user problem, business justification, and success metrics.

---

## PRD Specifications

### 1. User Stories & Acceptance Criteria
| Story ID | User Persona | Wants to... | So that... | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- |
| \`US-101\` | End User | {{user_story_action}} | {{user_story_benefit}} | Given-When-Then test pass |
| \`US-102\` | Admin | Manage permissions | Ensure security compliance | Audit log event emitted |

---

### 2. Functional Requirements
- [ ] **FR-1**: Input validation & rate limiting
- [ ] **FR-2**: Real-time state synchronization
- [ ] **FR-3**: Analytics telemetry event emission

---

### 3. Out of Scope (Explicit Boundaries)
List features deferred to future quarters to prevent scope creep.
`,
  },
  {
    id: 'p-9',
    name: 'sprint-retrospective-spec.md',
    path: '/Prompt Library/Productivity & PRDs/sprint-retrospective-spec.md',
    folderId: 'f-productivity',
    tags: ['agile', 'scrum', 'retrospective', 'productivity'],
    isPrompt: true,
    isFavorite: false,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 7200000,
    content: `# 🔄 Agile Sprint Retrospective Summarizer

## Sprint Meta Info
- **Sprint Name / Number**: {{sprint_number}}
- **Team Name**: {{team_name}}
- **Sprint Goal**: {{sprint_goal}}

---

## Raw Feedback Notes Input
\`\`\`text
// Paste sticky notes or raw chat notes here
- What went well:
- What could be improved:
- Proposed action items:
\`\`\`

---

## Structured Output Report
1. **Goal Completion Score**: Percentage of planned story points delivered.
2. **Top 3 Systemic Blockers**: Process bottlenecks impacting velocity.
3. **Action Item Assignments**: Item description, DRI (Directly Responsible Individual), Due Date, and Priority.
`,
  },

  // --- CREATIVE & AI VISION ---
  {
    id: 'p-10',
    name: 'image-prompt-engineer.md',
    path: '/Prompt Library/Creative & AI Vision/image-prompt-engineer.md',
    folderId: 'f-creative',
    tags: ['midjourney', 'stable-diffusion', 'flux', 'image-gen'],
    isPrompt: true,
    isFavorite: true,
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 1800000,
    content: `# 🎨 Midjourney & FLUX Image Prompt Master

## Creative Direction Input
- **Subject**: {{subject}}
- **Artistic Style / Medium**: {{art_style}}
- **Lighting & Atmosphere**: {{lighting}}
- **Aspect Ratio**: {{aspect_ratio}}

---

## Generated Prompt Variations

### Variation 1: Ultra-Realistic Cinematic
\`\`\`text
Cinematic shot of {{subject}}, {{art_style}} style, dramatic {{lighting}} lighting, highly detailed 8k, volumetric shadows, shot on 35mm lens, f/1.8 aperture, photo-realistic rendering --ar {{aspect_ratio}} --v 6.0
\`\`\`

### Variation 2: Stylized Concept Art
\`\`\`text
Concept artwork illustrating {{subject}}, dynamic composition, vibrant color palette, {{art_style}} aesthetics, soft ambient lighting, octane render, trending on ArtStation --ar {{aspect_ratio}}
\`\`\`

### Negative Prompt Parameters
\`\`\`text
blurry, low resolution, extra limbs, distorted features, watermark, signature, clipped edges
\`\`\`
`,
  },
  {
    id: 'p-11',
    name: 'user-persona-mapper.md',
    path: '/Prompt Library/Creative & AI Vision/user-persona-mapper.md',
    folderId: 'f-creative',
    tags: ['ux', 'design', 'user-research', 'persona'],
    isPrompt: true,
    isFavorite: false,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000 * 20,
    content: `# 👤 UX User Persona & Journey Mapper

## Persona Profile
- **Target Role / Demographic**: {{target_role}}
- **Industry / Domain**: {{industry}}
- **Primary Tooling Used**: {{primary_tooling}}

---

## Empathy Map Framework
1. **Says & Thinks**: Core aspirations, anxieties, and inner motivations.
2. **Does & Sees**: Daily workflow, workplace environment, software friction points.
3. **Pains (Frustrations)**: Technical barriers preventing target efficiency.
4. **Gains (Triumphs)**: Metrics or accomplishments that lead to a promotion or delight.
`,
  },

  // --- MARKDOWN GUIDES ---
  {
    id: 'p-12',
    name: 'markdown-feature-showcase.md',
    path: '/Markdown Guides/markdown-feature-showcase.md',
    folderId: 'f-docs',
    tags: ['guide', 'markdown', 'cheatsheet', 'formatting'],
    isPrompt: false,
    isFavorite: true,
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 3600000,
    content: `# 🚀 Comprehensive Markdown Reader & Prompt Studio Guide

Welcome to your **Markdown Reader & AI Prompt Studio**! This app is designed for viewing, editing, and organizing Markdown files, prompt collections, and technical specifications with real-time previewing.

---

## Key Features

### 1. Typography & Hierarchy
Write headings from H1 to H6 cleanly:

# Heading Level 1
## Heading Level 2
### Heading Level 3

---

### 2. Formatted Text & Highlights
- **Bold text** using double asterisks
- *Italic text* using single asterisks
- ~~Strikethrough text~~ using tildes
- \`Inline code blocks\` for commands or variables
- Combined **_bold and italic text_**

---

### 3. Custom Callout Banners
> [!NOTE]
> This is a helpful note block highlighting background context.

> [!TIP]
> Pro-tip: You can use \`{{variable_name}}\` placeholders in Markdown prompts to generate dynamic fill forms!

> [!WARNING]
> Critical warnings appear in high-visibility amber containers.

> [!IMPORTANT]
> Key highlights stand out clearly for documentation readers.

---

### 4. Interactive Task Checklists
- [x] Create a split-screen Markdown editor
- [x] Support GFM tables and syntax highlighting
- [x] Support dynamic Prompt Variable Filling (\`{{var}}\`)
- [x] Build 1000% upgraded Prompt Library with quick action hubs
- [x] Build Electron desktop app exporter

---

### 5. Syntax Highlighted Code Blocks

\`\`\`typescript
interface PromptTemplate {
  title: string;
  category: 'coding' | 'writing' | 'productivity' | 'creative';
  tags: string[];
  content: string;
}

export function renderPrompt(template: string, vars: Record<string, string>): string {
  return template.replace(/\\{\\{(\\w+)\\}\\}/g, (_, key) => vars[key] || \`{{\${key}}}\`);
}
\`\`\`

---

### 6. Rich Data Tables

| Feature | Web Browser Mode | Electron Desktop Mode |
| :--- | :---: | :---: |
| Real-time Preview | ✅ Yes | ✅ Yes |
| Open Local Files | ✅ (File API / Drag & Drop) | ✅ Native OS Dialogs |
| Prompt Variable Filling | ✅ 1-Click Modal | ✅ 1-Click Modal |
| Offline Operation | ✅ PWA / Cache | ✅ Standalone Executable |
`,
  },
];
