import * as sharp from 'sharp';

export const convertToBase64 = (file: Express.Multer.File) => {
  return file.buffer.toString('base64');
};

export const compressImage = async (base64Image: string) => {
  const buffer = Buffer.from(base64Image, 'base64');
  const compressedBuffer = await sharp(buffer).jpeg({ quality: 75 }).toBuffer();
  return compressedBuffer.toString('base64');
};

export function formatURL(url: string): string {
  return url.replace(/\s+/g, '-').replace(/,/g, '').toLowerCase();
}
