// Variables de estado
let modoEdicion = false;
let idEditando = null;

// Función para limpiar mensajes de error
function limpiarErrores() {
  document.querySelectorAll('.error').forEach(el => el.textContent = '');
}

// Función para validar edad mayor de 18
function validarEdad(fechaNacimiento) {
  const hoy = new Date();
  const fechaNac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  const mes = hoy.getMonth() - fechaNac.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
    edad--;
  }

  return edad >= 18;
}

// Función para validar formulario en el cliente
function validarFormulario(datos) {
  limpiarErrores();
  let valido = true;

  // Validar DNI (10 dígitos numéricos)
  if (!/^\d{10}$/.test(datos.dni)) {
    document.getElementById('error-dni').textContent = 'El DNI debe tener 10 dígitos numéricos';
    valido = false;
  }

  // Validar Nombres
  if (datos.nombres.length < 2 || !/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(datos.nombres)) {
    document.getElementById('error-nombres').textContent = 'Nombres inválidos (mínimo 2 caracteres, solo letras)';
    valido = false;
  }

  // Validar Apellidos
  if (datos.apellidos.length < 2 || !/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(datos.apellidos)) {
    document.getElementById('error-apellidos').textContent = 'Apellidos inválidos (mínimo 2 caracteres, solo letras)';
    valido = false;
  }

  // Validar Edad
  if (!validarEdad(datos.fechaNacimiento)) {
    document.getElementById('error-fechaNacimiento').textContent = 'Debes ser mayor de 18 años';
    valido = false;
  }

  // Validar Género
  if (!datos.genero) {
    document.getElementById('error-genero').textContent = 'Debes seleccionar un género';
    valido = false;
  }

  // Validar Ciudad
  if (!datos.ciudad) {
    document.getElementById('error-ciudad').textContent = 'Debes seleccionar una ciudad';
    valido = false;
  }

  return valido;
}

// Manejar envío del formulario
document.getElementById('formulario').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const datos = Object.fromEntries(formData);

  // Validar en cliente primero
  if (!validarFormulario(datos)) {
    return;
  }

  try {
    let url = '/registros';
    let method = 'POST';

    if (modoEdicion) {
      url = `/registros/${idEditando}`;
      method = 'PUT';
    }

    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message);
      location.reload(); // Recargar página para mostrar cambios
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error) {
    alert('Error al procesar la solicitud');
    console.error('Error:', error);
  }
});

// Función para editar registro
async function editarRegistro(id) {
  try {
    const response = await fetch(`/registros/${id}`);

    if (!response.ok) {
      alert('Error al cargar el registro');
      return;
    }

    const registro = await response.json();

    // Cargar datos en el formulario
    document.getElementById('dni').value = registro.dni;
    document.getElementById('nombres').value = registro.nombres;
    document.getElementById('apellidos').value = registro.apellidos;
    document.getElementById('fechaNacimiento').value = registro.fechaNacimiento;
    document.querySelector(`input[name="genero"][value="${registro.genero}"]`).checked = true;
    document.getElementById('ciudad').value = registro.ciudad;

    // Cambiar a modo edición
    modoEdicion = true;
    idEditando = id;

    // Actualizar interfaz
    document.getElementById('form-title').textContent = 'Editar Registro';
    document.getElementById('btn-submit').textContent = 'Actualizar Registro';
    document.getElementById('btn-submit').className = 'btn-actualizar';
    document.getElementById('btn-cancelar').style.display = 'block';

    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });

    limpiarErrores();
  } catch (error) {
    alert('Error al cargar el registro');
    console.error('Error:', error);
  }
}

// Función para eliminar registro
async function eliminarRegistro(id) {
  if (!confirm('¿Está seguro de eliminar este registro de la base de datos?')) {
    return;
  }

  try {
    const response = await fetch(`/registros/${id}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message);
      location.reload();
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error) {
    alert('Error al eliminar el registro');
    console.error('Error:', error);
  }
}

// Botón cancelar edición
document.getElementById('btn-cancelar').addEventListener('click', () => {
  // Limpiar formulario
  document.getElementById('formulario').reset();
  limpiarErrores();

  // Salir de modo edición
  modoEdicion = false;
  idEditando = null;

  // Restaurar interfaz
  document.getElementById('form-title').textContent = 'Nuevo Registro';
  document.getElementById('btn-submit').textContent = 'Agregar Registro';
  document.getElementById('btn-submit').className = 'btn-agregar';
  document.getElementById('btn-cancelar').style.display = 'none';
});