/**
 * Upload an image file to the backend.
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The URL path to the uploaded image (e.g., /api/uploads/uuid.jpg)
 */
export async function uploadImage(file) {
  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `Upload failed (${response.status})`)
  }

  const data = await response.json()
  return data.url
}
