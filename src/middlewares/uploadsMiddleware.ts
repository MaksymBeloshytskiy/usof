import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

// Шлях до папки для збереження аватарів
const avatarUploadPath = path.join(__dirname, '..', 'uploads', 'avatars');

// Переконайтеся, що папка існує, або створіть її
if (!fs.existsSync(avatarUploadPath)) {
  fs.mkdirSync(avatarUploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarUploadPath);
  },
  filename: (req, file, cb) => {
    // Генеруємо унікальне ім'я файлу
    const uniqueSuffix = crypto.randomBytes(6).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
  },
});

// Фільтрація файлів за типом (дозволяємо тільки зображення)
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif'];

  const mimeType = allowedMimeTypes.includes(file.mimetype);
  const extName = allowedExtensions.includes(path.extname(file.originalname).toLowerCase());

  if (mimeType && extName) {
    cb(null, true);
  } else {
    cb(new Error('Тільки зображення у форматах jpeg, jpg, png, gif дозволені'));
  }
};

// Обмеження розміру файлу (наприклад, 5 МБ)
const limits = {
  fileSize: 5 * 1024 * 1024, // 5 MB
};

// Створюємо middleware для завантаження одного файлу з іменем 'avatar'
export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits,
}).single('avatar');
