<template>
  <div class="container">
    <h1>Sistema de Registro CRUD - Vue</h1>

    <div class="card">
      <h2>{{ modoEdicion ? 'Editar Registro' : 'Nuevo Registro' }}</h2>

      <!-- DNI -->
      <div class="form-group">
        <label for="dni">DNI *</label>
        <input
          type="text"
          id="dni"
          v-model="formulario.dni"
          placeholder="Ej: 1234567890"
          maxlength="10"
        />
        <span v-if="errores.dni" class="error">{{ errores.dni }}</span>
      </div>

      <!-- Nombres -->
      <div class="form-group">
        <label for="nombres">Nombres *</label>
        <input
          type="text"
          id="nombres"
          v-model="formulario.nombres"
          placeholder="Ingrese nombres completos"
        />
        <span v-if="errores.nombres" class="error">{{ errores.nombres }}</span>
      </div>

      <!-- Apellidos -->
      <div class="form-group">
        <label for="apellidos">Apellidos *</label>
        <input
          type="text"
          id="apellidos"
          v-model="formulario.apellidos"
          placeholder="Ingrese apellidos completos"
        />
        <span v-if="errores.apellidos" class="error">{{ errores.apellidos }}</span>
      </div>

      <!-- Fecha de Nacimiento -->
      <div class="form-group">
        <label for="fechaNacimiento">Fecha de Nacimiento *</label>
        <input
          type="date"
          id="fechaNacimiento"
          v-model="formulario.fechaNacimiento"
        />
        <span v-if="errores.fechaNacimiento" class="error">{{ errores.fechaNacimiento }}</span>
      </div>

      <!-- Género -->
      <div class="form-group">
        <label>Género *</label>
        <div class="radio-group">
          <div class="radio-option">
            <input type="radio" id="masculino" value="Masculino" v-model="formulario.genero">
            <label for="masculino">Masculino</label>
          </div>
          <div class="radio-option">
            <input type="radio" id="femenino" value="Femenino" v-model="formulario.genero">
            <label for="femenino">Femenino</label>
          </div>
          <div class="radio-option">
            <input type="radio" id="otro" value="Otro" v-model="formulario.genero">
            <label for="otro">Otro</label>
          </div>
        </div>
        <span v-if="errores.genero" class="error">{{ errores.genero }}</span>
      </div>

      <!-- Ciudad -->
      <div class="form-group">
        <label for="ciudad">Ciudad *</label>
        <select id="ciudad" v-model="formulario.ciudad">
          <option value="" disabled selected>Seleccione una ciudad</option>
          <option value="Quito">Quito</option>
          <option value="Guayaquil">Guayaquil</option>
          <option value="Cuenca">Cuenca</option>
          <option value="Ambato">Ambato</option>
          <option value="Loja">Loja</option>
          <option value="Manta">Manta</option>
        </select>
        <span v-if="errores.ciudad" class="error">{{ errores.ciudad }}</span>
      </div>

      <!-- Botones -->
      <div class="button-group">
        <button
          v-if="!modoEdicion"
          @click="agregarRegistro"
          class="btn-agregar"
        >
          Agregar Registro
        </button>
        <button
          v-if="modoEdicion"
          @click="actualizarRegistro"
          class="btn-actualizar"
        >
          Actualizar Registro
        </button>
        <button
          v-if="modoEdicion"
          @click="cancelarEdicion"
          class="btn-cancelar"
        >
          Cancelar
        </button>
      </div>
    </div>

    <div class="card">
      <h2>Registros Guardados</h2>

      <div v-if="registros.length === 0" class="no-registros">
        No hay registros guardados
      </div>

      <table v-else>
        <thead>
          <tr>
            <th>DNI</th>
            <th>Nombres</th>
            <th>Apellidos</th>
            <th>Fecha Nac.</th>
            <th>Género</th>
            <th>Ciudad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(registro, index) in registros" :key="registro.id">
            <td>{{ registro.dni }}</td>
            <td>{{ registro.nombres }}</td>
            <td>{{ registro.apellidos }}</td>
            <td>{{ registro.fechaNacimiento }}</td>
            <td>{{ registro.genero }}</td>
            <td>{{ registro.ciudad }}</td>
            <td>
              <div class="acciones">
                <button @click="editarRegistro(registro)" class="btn-editar">
                  Editar
                </button>
                <button @click="eliminarRegistro(index)" class="btn-eliminar">
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const registros = ref([])
const formulario = ref({
  dni: '',
  nombres: '',
  apellidos: '',
  fechaNacimiento: '',
  genero: '',
  ciudad: ''
})
const errores = ref({})
const modoEdicion = ref(false)
const idEditando = ref(null)

// Validar formulario
const validarFormulario = () => {
  const nuevosErrores = {}

  // Validar DNI
  const dniRegex = /^\d{10}$/
  if (!formulario.value.dni) {
    nuevosErrores.dni = 'El DNI es requerido'
  } else if (!dniRegex.test(formulario.value.dni)) {
    nuevosErrores.dni = 'El DNI debe tener exactamente 10 dígitos numéricos'
  }

  // Validar Nombres
  if (!formulario.value.nombres) {
    nuevosErrores.nombres = 'Los nombres son requeridos'
  } else if (formulario.value.nombres.length < 2) {
    nuevosErrores.nombres = 'Los nombres deben tener al menos 2 caracteres'
  } else if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(formulario.value.nombres)) {
    nuevosErrores.nombres = 'Los nombres solo pueden contener letras y espacios'
  }

  // Validar Apellidos
  if (!formulario.value.apellidos) {
    nuevosErrores.apellidos = 'Los apellidos son requeridos'
  } else if (formulario.value.apellidos.length < 2) {
    nuevosErrores.apellidos = 'Los apellidos deben tener al menos 2 caracteres'
  } else if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(formulario.value.apellidos)) {
    nuevosErrores.apellidos = 'Los apellidos solo pueden contener letras y espacios'
  }

  // Validar Fecha de Nacimiento
  if (!formulario.value.fechaNacimiento) {
    nuevosErrores.fechaNacimiento = 'La fecha de nacimiento es requerida'
  } else {
    const fechaNac = new Date(formulario.value.fechaNacimiento)
    const hoy = new Date()
    let edad = hoy.getFullYear() - fechaNac.getFullYear()
    const mes = hoy.getMonth() - fechaNac.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--
    }
    if (edad < 18) {
      nuevosErrores.fechaNacimiento = 'Debes ser mayor de 18 años'
    }
  }

  // Validar Género
  if (!formulario.value.genero) {
    nuevosErrores.genero = 'Debes seleccionar un género'
  }

  // Validar Ciudad
  if (!formulario.value.ciudad) {
    nuevosErrores.ciudad = 'Debes seleccionar una ciudad'
  }

  errores.value = nuevosErrores
  return Object.keys(nuevosErrores).length === 0
}

// Agregar registro
const agregarRegistro = () => {
  if (!validarFormulario()) return

  // Verificar DNI duplicado
  const dniExiste = registros.value.some(r => r.dni === formulario.value.dni)
  if (dniExiste) {
    errores.value.dni = 'Este DNI ya está registrado'
    return
  }

  const nuevoRegistro = {
    id: Date.now(),
    ...formulario.value
  }

  registros.value.push(nuevoRegistro)
  guardarEnLocalStorage()
  limpiarFormulario()
  alert('Registro agregado exitosamente')
}

// Editar registro
const editarRegistro = (registro) => {
  formulario.value = { ...registro }
  modoEdicion.value = true
  idEditando.value = registro.id
  errores.value = {}
}

// Actualizar registro
const actualizarRegistro = () => {
  if (!validarFormulario()) return

  // Verificar DNI duplicado (excepto el mismo registro)
  const dniExiste = registros.value.some(r => r.dni === formulario.value.dni && r.id !== idEditando.value)
  if (dniExiste) {
    errores.value.dni = 'Este DNI ya está registrado'
    return
  }

  const index = registros.value.findIndex(r => r.id === idEditando.value)
  if (index !== -1) {
    registros.value[index] = {
      id: idEditando.value,
      ...formulario.value
    }
    guardarEnLocalStorage()
    limpiarFormulario()
    modoEdicion.value = false
    idEditando.value = null
    alert('Registro actualizado exitosamente')
  }
}

// Eliminar registro
const eliminarRegistro = (index) => {
  if (confirm('¿Está seguro de eliminar este registro?')) {
    registros.value.splice(index, 1)
    guardarEnLocalStorage()
    alert('Registro eliminado exitosamente')
  }
}

// Cancelar edición
const cancelarEdicion = () => {
  limpiarFormulario()
  modoEdicion.value = false
  idEditando.value = null
}

// Limpiar formulario
const limpiarFormulario = () => {
  formulario.value = {
    dni: '',
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    genero: '',
    ciudad: ''
  }
  errores.value = {}
}

// LocalStorage
const guardarEnLocalStorage = () => {
  localStorage.setItem('registrosFormularioVue', JSON.stringify(registros.value))
}

const cargarDesdeLocalStorage = () => {
  const datos = localStorage.getItem('registrosFormularioVue')
  if (datos) {
    registros.value = JSON.parse(datos)
  }
}

// Cargar datos al montar
onMounted(() => {
  cargarDesdeLocalStorage()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #000000;
  min-height: 100vh;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: #ffffff;
  margin-bottom: 30px;
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.1);
}

.card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  margin-bottom: 30px;
}

h2 {
  color: #667eea;
  margin-bottom: 25px;
  font-size: 1.8rem;
  border-bottom: 3px solid #667eea;
  padding-bottom: 10px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  font-size: 0.95rem;
}

input[type="text"],
input[type="date"],
select {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: inherit;
}

input[type="text"]:focus,
input[type="date"]:focus,
select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.radio-group {
  display: flex;
  gap: 20px;
  align-items: center;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #667eea;
}

.radio-option label {
  margin-bottom: 0;
  font-weight: 500;
  cursor: pointer;
}

.error {
  display: block;
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 5px;
  font-weight: 500;
}

.button-group {
  display: flex;
  gap: 15px;
  margin-top: 25px;
}

button {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-agregar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex: 1;
}

.btn-agregar:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-actualizar {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  flex: 1;
}

.btn-actualizar:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(245, 87, 108, 0.4);
}

.btn-cancelar {
  background: #95a5a6;
  color: white;
}

.btn-cancelar:hover {
  background: #7f8c8d;
  transform: translateY(-2px);
}

.btn-editar {
  background: #3498db;
  color: white;
  padding: 8px 16px;
  font-size: 0.9rem;
}

.btn-editar:hover {
  background: #2980b9;
}

.btn-eliminar {
  background: #e74c3c;
  color: white;
  padding: 8px 16px;
  font-size: 0.9rem;
}

.btn-eliminar:hover {
  background: #c0392b;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
}

td {
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
}

tbody tr:hover {
  background-color: #f8f9ff;
}

tbody tr:last-child td {
  border-bottom: none;
}

.acciones {
  display: flex;
  gap: 10px;
}

.no-registros {
  text-align: center;
  padding: 40px;
  color: #95a5a6;
  font-size: 1.1rem;
  font-style: italic;
}

/* Tablets y dispositivos medianos */
@media (max-width: 992px) {
  .container {
    max-width: 95%;
    padding: 15px;
  }

  .card {
    padding: 25px;
  }

  table {
    font-size: 0.9rem;
  }

  th, td {
    padding: 10px;
  }
}

/* Móviles y dispositivos pequeños */
@media (max-width: 768px) {
  body {
    padding: 10px;
  }

  .container {
    padding: 10px;
  }

  .card {
    padding: 20px 15px;
    border-radius: 10px;
  }

  h2 {
    font-size: clamp(1.3rem, 4vw, 1.8rem);
  }

  .button-group {
    flex-direction: column;
  }

  button {
    width: 100%;
    padding: 14px 20px;
  }

  .radio-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  /* Hacer la tabla responsive con scroll horizontal */
  table {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    font-size: 0.8rem;
  }

  thead, tbody, tr {
    display: table;
    width: 100%;
    table-layout: fixed;
  }

  th, td {
    padding: 10px 5px;
    font-size: 0.8rem;
  }

  th {
    font-size: 0.75rem;
  }

  .acciones {
    flex-direction: column;
    gap: 5px;
  }

  .btn-editar,
  .btn-eliminar {
    width: 100%;
    padding: 6px 10px;
    font-size: 0.8rem;
  }
}

/* Móviles muy pequeños */
@media (max-width: 480px) {
  body {
    padding: 5px;
  }

  .container {
    padding: 5px;
  }

  .card {
    padding: 15px 10px;
  }

  input[type="text"],
  input[type="date"],
  select {
    padding: 10px 12px;
    font-size: 0.95rem;
  }

  label {
    font-size: 0.9rem;
  }

  .form-group {
    margin-bottom: 15px;
  }

  button {
    padding: 12px 15px;
    font-size: 0.9rem;
  }

  table {
    font-size: 0.7rem;
  }

  th, td {
    padding: 8px 4px;
  }

  .no-registros {
    font-size: 0.95rem;
    padding: 30px 15px;
  }
}
</style>