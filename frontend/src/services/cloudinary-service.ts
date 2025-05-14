// Cloudinary image upload service using fetch

const cloudinaryConfig = {
  cloudName: "dkidy104q", // Thay bằng cloud_name của bạn
  uploadPreset: "sagiri", // Thay bằng upload_preset của bạn
  apiUrl: `https://api.cloudinary.com/v1_1/dkidy104q/auto/upload`, // URL tải lên
};

/**
 * Hàm upload hình ảnh lên Cloudinary sử dụng fetch
 * @param {File} file - File hình ảnh cần upload
 * @returns {Promise} - Kết quả upload từ Cloudinary
 */
export const uploadImageToCloudinary = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinaryConfig.uploadPreset); // Chỉ cần upload preset cho unsigned upload
  formData.append("cloud_name", cloudinaryConfig.cloudName); // Cung cấp cloud name

  try {
    const response = await fetch(cloudinaryConfig.apiUrl, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Failed to upload image to Cloudinary");
    }
    return await response.json();
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
}; 