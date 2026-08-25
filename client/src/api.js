// ------------------------------------------------------------------
// src/api.js
// ------------------------------------------------------------------
// A small wrapper around the browser's fetch() for talking to the
// Express backend. Keeping all network calls in one file means our
// React components stay focused on the UI, and if the API ever changes
// we only have to update it here.
//
// All requests go to "/api/notes". In development, Vite's proxy (see
// vite.config.js) forwards "/api/*" to the Express server on port 5000.
// ------------------------------------------------------------------

const BASE_URL = "/api/notes";

/**
 * Shared response handler. Parses JSON and, if the server responded with
 * an error status, throws an Error carrying the server's message so the
 * UI can display it.
 */
async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

// READ ALL — GET /api/notes
export function getNotes() {
  return fetch(BASE_URL).then(handleResponse);
}

// CREATE — POST /api/notes
export function createNote(note) {
  return fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  }).then(handleResponse);
}

// UPDATE — PUT /api/notes/:id
export function updateNote(id, note) {
  return fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  }).then(handleResponse);
}

// DELETE — DELETE /api/notes/:id
export function deleteNote(id) {
  return fetch(`${BASE_URL}/${id}`, { method: "DELETE" }).then(handleResponse);
}
