/**
 * Real API client for the Pilot FastAPI backend. This file is the ONLY
 * place in the frontend that knows about HTTP/endpoints -- components and
 * hooks call these functions and never touch `fetch` directly, so swapping
 * backends later only means editing this file.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: options.body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      detail = body.detail || detail
    } catch {
      // response wasn't JSON — fall back to statusText
    }
    throw new Error(detail)
  }

  if (res.status === 204) return null
  return res.json()
}

/** Upload an existing file so Pilot can act on it later. */
export function uploadDocument(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request('/documents/upload', { method: 'POST', body: formData })
}

/** List every document Pilot currently knows about. */
export function listDocuments() {
  return request('/documents')
}

/** Fetch one document's metadata. */
export function getDocument(id) {
  return request(`/documents/${id}`)
}

/** Delete a document directly (bypassing the prompt/intent layer). */
export function deleteDocument(id) {
  return request(`/documents/${id}`, { method: 'DELETE' })
}

/**
 * Fetches the actual file bytes for a document (not JSON) — this is the
 * "round-trip file integrity" check: the real .docx/.xlsx/.pdf/etc. Pilot
 * created or updated, ready to open in its native app.
 */
export async function downloadDocument(id) {
  const res = await fetch(`${API_BASE_URL}/documents/${id}/download`)
  if (!res.ok) throw new Error('Download failed')

  const disposition = res.headers.get('Content-Disposition') || ''
  const match = disposition.match(/filename="?([^"]+)"?/)

  return {
    blob: await res.blob(),
    filename: match ? match[1] : `document-${id}`,
  }
}

/** Triggers a browser save-as for a blob/filename pair returned by downloadDocument. */
export function saveBlobAsFile(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * The core "Direct Execution" call: send a prompt (optionally about a
 * specific document) and get back the CRUD action Pilot actually took —
 * not a description of how to do it.
 */
export function executeTask({ prompt, documentId, fileName, fileType }) {
  return request('/execute', {
    method: 'POST',
    body: JSON.stringify({
      prompt,
      document_id: documentId ?? null,
      file_name: fileName ?? null,
      file_type: fileType ?? null,
    }),
  })
}

/** Full audit log of past /execute calls, for the History page. */
export function listExecutions(limit = 50) {
  return request(`/executions?limit=${limit}`)
}
