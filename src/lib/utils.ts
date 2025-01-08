import * as sharp from 'sharp';

export const convertToBase64 = (file: Express.Multer.File) => {
  return file.buffer.toString('base64');
};

export const compressImage = async (base64Image: string) => {
  const buffer = Buffer.from(base64Image, 'base64');
  const compressedBuffer = await sharp(buffer).jpeg({ quality: 80 }).toBuffer();
  return compressedBuffer.toString('base64');
};
