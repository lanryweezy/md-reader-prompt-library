import { MDFile, MDFolder } from '../types';

export const LEGACY_MOCK_FILE_IDS = new Set([
  'p-1',
  'p-2',
  'p-3',
  'p-4',
  'p-5',
  'p-6',
  'p-7',
  'p-8',
  'p-9',
  'p-10',
  'p-11',
  'p-12',
]);

export const INITIAL_FOLDERS: MDFolder[] = [
  { id: 'f-prompts', name: 'Prompts', icon: 'sparkles' },
];

export const INITIAL_FILES: MDFile[] = [
  {
    id: 'starter-code-review',
    name: 'code-review.md',
    path: '/Prompts/code-review.md',
    folderId: 'f-prompts',
    tags: ['coding', 'review'],
    isPrompt: true,
    isFavorite: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    content: `# Code Review Prompt

Review the following {{language}} code with focus on {{focus_area}}.

## Code
\`\`\`{{language}}
// Paste code here
\`\`\`

## Instructions
1. Identify potential bugs, edge cases, or security risks.
2. Suggest clearer naming or simpler structure where helpful.
3. Provide a concise refactored version with brief explanations.
`,
  },
  {
    id: 'starter-writing-editor',
    name: 'writing-editor.md',
    path: '/Prompts/writing-editor.md',
    folderId: 'f-prompts',
    tags: ['writing', 'editing'],
    isPrompt: true,
    isFavorite: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    content: `# Writing & Editing Prompt

Edit the draft below for {{audience}} in a {{tone}} tone.

## Draft
> Paste your draft here.

## Goals
- Tighten wordy sentences without changing the core meaning.
- Improve clarity, flow, and transitions between paragraphs.
- Highlight any unclear claims or missing context.
`,
  },
  {
    id: 'starter-project-brief',
    name: 'project-brief.md',
    path: '/Prompts/project-brief.md',
    folderId: 'f-prompts',
    tags: ['planning', 'spec'],
    isPrompt: true,
    isFavorite: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    content: `# Project Brief Prompt

Create a structured brief for **{{project_name}}**.

## Primary Goal
{{goal}}

## Sections to Include
- Problem statement and target users
- Key deliverables and milestones
- Open questions and risks
`,
  },
];
