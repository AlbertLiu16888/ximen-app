// Cloudinary unsigned upload
// Configure your Cloudinary cloud name and unsigned upload preset below
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'ximen-quest';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ximen_unsigned';
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * Upload an image (base64 data URL or Blob) to Cloudinary
 * @param {string|Blob} imageData - base64 data URL string or Blob
 * @param {object} options - optional metadata
 * @returns {Promise<{url: string, publicId: string}>}
 */
export async function uploadPhoto(imageData, options = {}) {
  const formData = new FormData();

  if (typeof imageData === 'string' && imageData.startsWith('data:')) {
    formData.append('file', imageData);
  } else if (imageData instanceof Blob) {
    formData.append('file', imageData, 'photo.jpg');
  } else {
    throw new Error('Invalid image data');
  }

  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'ximen-quest');

  if (options.playerName) {
    formData.append('context', `player=${options.playerName}|mission=${options.missionId || ''}`);
  }

  const res = await fetch(UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Upload failed (${res.status})`);
  }

  const data = await res.json();
  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
  };
}
