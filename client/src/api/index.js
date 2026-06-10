const SERVER_URL = import.meta.env.VITE_API_URL || '';
// In development, if SERVER_URL is localhost, use relative '/api' to leverage the Vite proxy (preventing CORS issues).
// Otherwise, in production or for remote endpoints, prepend the server URL.
const API_BASE = (import.meta.env.DEV && SERVER_URL.includes('localhost')) ? '/api' : `${SERVER_URL}/api`;

/**
 * Base fetch utility supporting cookies and JWT tokens.
 */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is an object but not a FormData, stringify it and set JSON content-type
  if (options.body && !(options.body instanceof FormData)) {
    if (typeof options.body === 'object') {
      options.body = JSON.stringify(options.body);
      headers['Content-Type'] = 'application/json';
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Send HTTP-only cookie automatically
  });

  if (response.status === 204) {
    return null;
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error('Error connecting to the server');
  }

  if (!response.ok) {
    const errorObj = new Error(data?.error || data?.message || 'An error occurred');
    errorObj.status = response.status;
    errorObj.errors = data?.errors || null; // For express-validator arrays
    errorObj.error = data?.error || null;
    throw errorObj;
  }

  return data;
}

// -----------------------------------------------------
// AUTH ENDPOINTS
// -----------------------------------------------------

export async function register(formData) {
  // formData should contain fullName, email, password, and optionally profileImage
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: formData,
  });
  if (data?.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
}

export async function login({ email, password }) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  if (data?.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
}

export async function logout() {
  await apiFetch('/auth/logout', {
    method: 'POST',
  });
  localStorage.removeItem('token');
}

// -----------------------------------------------------
// BLOGS ENDPOINTS
// -----------------------------------------------------

export async function getBlogs(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.tag) query.set('tag', params.tag);
  if (params.status) query.set('status', params.status);
  const suffix = query.toString() ? `?${query}` : '';
  return await apiFetch(`/blogs${suffix}`);
}

export async function getBlog(id) {
  return await apiFetch(`/blogs/${id}`);
}

export async function createBlog(formData) {
  // formData should contain title, Editor.js content, and coverImage
  return await apiFetch('/blogs', {
    method: 'POST',
    body: formData,
  });
}

export async function updateBlog(id, formData) {
  // formData can contain title, Editor.js content, and coverImage
  return await apiFetch(`/blogs/${id}`, {
    method: 'PATCH',
    body: formData,
  });
}

export async function uploadEditorImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  return apiFetch('/uploads/editor-image', {
    method: 'POST',
    body: formData,
  });
}

export async function deleteBlog(id) {
  return await apiFetch(`/blogs/${id}`, {
    method: 'DELETE',
  });
}

export async function addComment(blogId, { content, parentComment }) {
  return await apiFetch(`/blogs/${blogId}/comments`, {
    method: 'POST',
    body: { content, ...(parentComment && { parentComment }) },
  });
}

export async function updateComment(blogId, commentId, content) {
  return apiFetch(`/blogs/${blogId}/comments/${commentId}`, {
    method: 'PATCH',
    body: { content },
  });
}

export async function deleteComment(blogId, commentId) {
  return apiFetch(`/blogs/${blogId}/comments/${commentId}`, {
    method: 'DELETE',
  });
}

export async function bookmarkBlog(blogId) {
  return await apiFetch(`/blogs/${blogId}/bookmark`, {
    method: 'PUT',
  });
}

export async function unbookmarkBlog(blogId) {
  return await apiFetch(`/blogs/${blogId}/bookmark`, {
    method: 'DELETE',
  });
}

export async function likeBlog(blogId) {
  return apiFetch(`/blogs/${blogId}/like`, { method: 'PUT' });
}

export async function unlikeBlog(blogId) {
  return apiFetch(`/blogs/${blogId}/like`, { method: 'DELETE' });
}

export async function incrementView(blogId) {
  return apiFetch(`/blogs/${blogId}/view`, { method: 'POST' });
}

export async function getTrendingBlogs() {
  return apiFetch('/blogs/trending');
}

// -----------------------------------------------------
// USERS ENDPOINTS
// -----------------------------------------------------

export async function getProfile() {
  return await apiFetch('/users/me');
}

export async function updateProfile(formData) {
  // formData can contain fullName, email, and profileImage
  const data = await apiFetch('/users/me', {
    method: 'PATCH',
    body: formData,
  });
  if (data?.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
}

export async function changePassword({ oldPassword, newPassword }) {
  return await apiFetch('/users/me/password', {
    method: 'PATCH',
    body: { oldPassword, newPassword },
  });
}

export async function getBookmarks() {
  return await apiFetch('/users/me/bookmarks');
}
