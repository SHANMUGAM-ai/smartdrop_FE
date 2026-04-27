import api from '../api/axios';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

export const readPartnerPhoto = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Please choose an image.'));
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      reject(new Error('Only JPG, JPEG, and PNG images are allowed.'));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      reject(new Error('Image size must be under 2MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.readAsDataURL(file);
  });

/**
 * Upload image to Cloudinary via backend
 * @param {File} file - The image file
 * @returns {Promise<string>} - The Cloudinary URL
 */
export const uploadToCloudinary = async (file) => {
  if (!file) {
    throw new Error('Please choose an image.');
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Only JPG, JPEG, and PNG images are allowed.');
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('Image size must be under 2MB.');
  }

  const formData = new FormData();
  formData.append('photo', file);

  try {
    const { data } = await api.post('/users/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.url;
  } catch (err) {
    // Fallback: return base64 for dev if backend upload fails
    console.warn('Cloudinary upload failed, falling back to base64:', err.message);
    return readPartnerPhoto(file);
  }
};

