import CryptoJS from "crypto-js";

const CLOUDINARY_NAME: string = import.meta.env.VITE_APP_CLOUDINARY_CLOUD_NAME;
const API_KEY: string = import.meta.env.VITE_APP_CLOUDINARY_API_KEY;
const SECRET: string = import.meta.env.VITE_APP_CLOUDINARY_SECRET_KEY;

const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`;

export const UPLOAD_CLINSKIN_PRESET = "customer";
export const UPLOAD_CLINSKIN_ADMIN_PRESET = "admin";

const getPreset = (type: string): string => {
  switch (type) {
    case UPLOAD_CLINSKIN_PRESET:
      return "clinskin-upload";
    case UPLOAD_CLINSKIN_ADMIN_PRESET:
      return "clinskin-admin-upload";
    default:
      return "clinskin-upload";
  }
};

export interface UploadFileParams {
  file: File | Blob;
  type?: string;
}

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  [key: string]: any;
}

export const uploadFile = async ({
  file,
  type = "customer",
}: UploadFileParams): Promise<CloudinaryUploadResponse> => {
  const formData = new FormData();
  const preset = getPreset(type);

  formData.append("file", file);
  formData.append("upload_preset", preset);

  try {
    const response = await fetch(UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return (await response.json()) as CloudinaryUploadResponse;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    throw error;
  }
};

export interface CloudinaryDeleteResponse {
  result: string;
  [key: string]: any;
}

export const deleteFile = async (
  publicId: string
): Promise<CloudinaryDeleteResponse> => {
  const timestamp = Math.floor(Date.now() / 1000);

  const signature = CryptoJS.SHA1(
    `public_id=${publicId}&timestamp=${timestamp}${SECRET}`
  ).toString();

  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("signature", signature);
  formData.append("api_key", API_KEY);
  formData.append("timestamp", timestamp.toString());

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/destroy`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return (await response.json()) as CloudinaryDeleteResponse;
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    throw error;
  }
};
