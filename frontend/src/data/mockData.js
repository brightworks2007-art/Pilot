// UI-only placeholder content that isn't backed by an API yet.
// Anything that used to be "fake API data" (tasks, results) now comes for
// real from services/api.js -- see hooks/useTaskRunner.js and pages/History.jsx.

export const mockUser = {
  name: 'Pilot User',
  email: 'user@pilot.app',
  role: 'Workspace Owner',
  avatarInitials: 'PU',
  plan: 'Free Plan',
}

// Example prompts for the "what should Pilot do?" box. These map directly
// onto the four CRUD actions the backend's /execute endpoint can take.
export const promptSuggestions = [
  'Update this document to add a closing paragraph',
  'Delete this document',
  'Create a new memo titled "Weekly Update"',
  'Read back what this document currently says',
]

export const acceptedFileTypes = ['PDF', 'DOCX', 'TXT', 'XLSX', 'CSV', 'PPTX']

// Still illustrative placeholders -- computing these for real means adding
// an aggregate endpoint (e.g. GET /stats) backed by the executions table.
export const statCards = [
  { id: 'total-docs', label: 'Documents Stored', value: '—', delta: 'Connect /documents' },
  { id: 'active-tasks', label: 'Executions Today', value: '—', delta: 'Connect /executions' },
  { id: 'time-saved', label: 'Est. Time Saved', value: '—', delta: 'Coming in a later phase' },
  { id: 'success-rate', label: 'Action Success Rate', value: '—', delta: 'Coming in a later phase' },
]

export const aiTaskTemplates = [
  {
    id: 'template-create',
    name: 'Create a Document',
    description: 'Ask Pilot to write a brand new document from scratch and save it.',
    category: 'Create',
  },
  {
    id: 'template-read',
    name: 'Read a Document',
    description: "Ask Pilot to read back a document's current content.",
    category: 'Read',
  },
  {
    id: 'template-update',
    name: 'Update a Document',
    description: 'Ask Pilot to revise or add to an existing document, in place.',
    category: 'Update',
  },
  {
    id: 'template-delete',
    name: 'Delete a Document',
    description: 'Ask Pilot to permanently remove a document.',
    category: 'Delete',
  },
]
