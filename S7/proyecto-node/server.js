// Importar dependencias
const express = require('express');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const path = require('path');

// Crear aplicación Express
const app = express();
const PORT = 3000;

// Configurar base de datos SQLite
const db = new Database('registros.db', { verbose: console.log });

// Crear tabla si no existe
db.exec(`
  CREATE TABLE IF NOT EXISTS registros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dni TEXT UNIQUE NOT NULL,
    nombres TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    fechaNacimiento TEXT NOT NULL,
    genero TEXT NOT NULL,
    ciudad TEXT NOT NULL,
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('Tabla "registros" creada o ya existe');

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ==================== RUTAS ====================

// RUTA 1: Página principal (GET /)
app.get('/', (req, res) => {
  try {
    const registros = db.prepare('SELECT * FROM registros ORDER BY fechaCreacion DESC').all();
    res.render('index', { registros });
  } catch (error) {
    console.error('Error al obtener registros:', error);
    res.status(500).render('index', { registros: [] });
  }
});

// RUTA 2: Crear registro (POST /registros)
app.post('/registros', (req, res) => {
  const { dni, nombres, apellidos, fechaNacimiento, genero, ciudad } = req.body;
  
  // Validar DNI (10 dígitos numéricos)
  if (!/^\d{10}$/.test(dni)) {
    return res.status(400).json({ error: 'El DNI debe tener 10 dígitos numéricos' });
  }
  
  // Validar Nombres
  if (!nombres || nombres.length < 2 || !/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/i.test(nombres)) {
    return res.status(400).json({ error: 'Nombres inválidos' });
  }
  
  // Validar Apellidos
  if (!apellidos || apellidos.length < 2 || !/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/i.test(apellidos)) {
    return res.status(400).json({ error: 'Apellidos inválidos' });
  }
  
  // Validar edad (mayor de 18 años)
  const fechaNac = new Date(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  const mes = hoy.getMonth() - fechaNac.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
    edad--;
  }
  if (edad < 18) {
    return res.status(400).json({ error: 'Debes ser mayor de 18 años' });
  }
  
  // Validar género y ciudad
  if (!genero || !ciudad) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  
  try {
    // Insertar usando prepared statement (previene SQL injection)
    const stmt = db.prepare(`
      INSERT INTO registros (dni, nombres, apellidos, fechaNacimiento, genero, ciudad)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(dni, nombres, apellidos, fechaNacimiento, genero, ciudad);
    console.log('Registro creado:', dni);
    res.json({ success: true, message: 'Registro creado exitosamente' });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Este DNI ya está registrado' });
    }
    console.error(' Error al crear registro:', error);
    res.status(500).json({ error: 'Error al crear el registro' });
  }
});

// RUTA 3: Obtener un registro (GET /registros/:id)
app.get('/registros/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM registros WHERE id = ?');
    const registro = stmt.get(req.params.id);
    
    if (!registro) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    
    res.json(registro);
  } catch (error) {
    console.error('Error al obtener registro:', error);
    res.status(500).json({ error: 'Error al obtener el registro' });
  }
});

// RUTA 4: Actualizar registro (PUT /registros/:id)
app.put('/registros/:id', (req, res) => {
  const { dni, nombres, apellidos, fechaNacimiento, genero, ciudad } = req.body;
  const id = req.params.id;
  
  // Validaciones (igual que en POST)
  if (!/^\d{10}$/.test(dni)) {
    return res.status(400).json({ error: 'El DNI debe tener 10 dígitos numéricos' });
  }
  
  if (!nombres || nombres.length < 2 || !/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/i.test(nombres)) {
    return res.status(400).json({ error: 'Nombres inválidos' });
  }
  
  if (!apellidos || apellidos.length < 2 || !/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/i.test(apellidos)) {
    return res.status(400).json({ error: 'Apellidos inválidos' });
  }
  
  const fechaNac = new Date(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  const mes = hoy.getMonth() - fechaNac.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
    edad--;
  }
  if (edad < 18) {
    return res.status(400).json({ error: 'Debes ser mayor de 18 años' });
  }
  
  if (!genero || !ciudad) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  
  try {
    const stmt = db.prepare(`
      UPDATE registros 
      SET dni = ?, nombres = ?, apellidos = ?, fechaNacimiento = ?, genero = ?, ciudad = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(dni, nombres, apellidos, fechaNacimiento, genero, ciudad, id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    
    console.log('Registro actualizado:', id);
    res.json({ success: true, message: 'Registro actualizado exitosamente' });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Este DNI ya está registrado' });
    }
    console.error('Error al actualizar registro:', error);
    res.status(500).json({ error: 'Error al actualizar el registro' });
  }
});

// RUTA 5: Eliminar registro (DELETE /registros/:id)
app.delete('/registros/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM registros WHERE id = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    
    console.log('Registro eliminado:', req.params.id);
    res.json({ success: true, message: 'Registro eliminado exitosamente' });
  } catch (error) {
    console.error(' Error al eliminar registro:', error);
    res.status(500).json({ error: 'Error al eliminar el registro' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n================================');
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Base de datos SQLite: registros.db`);
  console.log('================================\n');
});