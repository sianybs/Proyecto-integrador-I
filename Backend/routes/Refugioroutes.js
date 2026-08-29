const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();

const carpetaAnimales = path.join(__dirname, '..', 'uploads', 'animales');
fs.mkdirSync(carpetaAnimales, { recursive: true });

const almacenamiento = multer.diskStorage({
  destination: (req, file, callback) => callback(null, carpetaAnimales),
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `animal-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  },
});

const subirFoto = multer({
  storage: almacenamiento,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!tiposPermitidos.includes(file.mimetype)) {
      return callback(new Error('La foto debe ser JPG, PNG o WebP'));
    }
    callback(null, true);
  },
});

function procesarFoto(req, res, next) {
  subirFoto.single('Foto')(req, res, (err) => {
    if (!err) return next();
    const mensaje = err.code === 'LIMIT_FILE_SIZE'
      ? 'La foto no puede superar los 5 MB'
      : err.message;
    return res.status(400).json({ message: mensaje });
  });
}
const {
  getAnimales,
  getAnimalesDisponibles,
  getAnimalPorId,
  crearAnimal,
  actualizarAnimal,
  eliminarAnimal,
} = require('../controller/RefugioController');

router.get('/', getAnimales);
router.get('/disponibles', getAnimalesDisponibles);
router.get('/:id', getAnimalPorId);
router.post('/', procesarFoto, crearAnimal);
router.put('/:id', procesarFoto, actualizarAnimal);
router.delete('/:id', eliminarAnimal);

module.exports = router;
