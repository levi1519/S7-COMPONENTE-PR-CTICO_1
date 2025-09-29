import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [registros, setRegistros] = useState([]);
  const [formulario, setFormulario] = useState({
    dni: '',
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    genero: '',
    ciudad: ''
  });
  const [errores, setErrores] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState(null);

  // Cargar registros desde localStorage al montar el componente
  useEffect(() => {
    const registrosGuardados = localStorage.getItem('registrosFormulario');
    if (registrosGuardados) {
      setRegistros(JSON.parse(registrosGuardados));
    }
  }, []);

  // Guardar registros en localStorage cada vez que cambien
  useEffect(() => {
    if (registros.length > 0) {
      localStorage.setItem('registrosFormulario', JSON.stringify(registros));
    }
  }, [registros]);

  // Calcular fecha máxima (hace 18 años)
  const calcularFechaMaxima = () => {
    const hoy = new Date();
    hoy.setFullYear(hoy.getFullYear() - 18);
    return hoy.toISOString().split('T')[0];
  };

  // Calcular edad
  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    return edad;
  };

  // Validar formulario
  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validar DNI
    if (!formulario.dni) {
      nuevosErrores.dni = 'El DNI es requerido';
    } else if (!/^\d{10}$/.test(formulario.dni)) {
      nuevosErrores.dni = 'El DNI debe tener exactamente 10 dígitos numéricos';
    } else {
      // Verificar DNI único (excepto en modo edición)
      const dniExiste = registros.some(reg =>
        reg.dni === formulario.dni && reg.id !== idEditando
      );
      if (dniExiste) {
        nuevosErrores.dni = 'Este DNI ya está registrado';
      }
    }

    // Validar Nombres
    if (!formulario.nombres) {
      nuevosErrores.nombres = 'Los nombres son requeridos';
    } else if (formulario.nombres.length < 2) {
      nuevosErrores.nombres = 'Los nombres deben tener al menos 2 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formulario.nombres)) {
      nuevosErrores.nombres = 'Los nombres solo pueden contener letras y espacios';
    }

    // Validar Apellidos
    if (!formulario.apellidos) {
      nuevosErrores.apellidos = 'Los apellidos son requeridos';
    } else if (formulario.apellidos.length < 2) {
      nuevosErrores.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formulario.apellidos)) {
      nuevosErrores.apellidos = 'Los apellidos solo pueden contener letras y espacios';
    }

    // Validar Fecha de Nacimiento
    if (!formulario.fechaNacimiento) {
      nuevosErrores.fechaNacimiento = 'La fecha de nacimiento es requerida';
    } else {
      const edad = calcularEdad(formulario.fechaNacimiento);
      if (edad < 18) {
        nuevosErrores.fechaNacimiento = 'Debe ser mayor de 18 años';
      }
    }

    // Validar Género
    if (!formulario.genero) {
      nuevosErrores.genero = 'Debe seleccionar un género';
    }

    // Validar Ciudad
    if (!formulario.ciudad) {
      nuevosErrores.ciudad = 'Debe seleccionar una ciudad';
    }

    return nuevosErrores;
  };

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario({
      ...formulario,
      [name]: value
    });
    // Limpiar error del campo al escribir
    if (errores[name]) {
      setErrores({
        ...errores,
        [name]: ''
      });
    }
  };

  // Limpiar formulario
  const limpiarFormulario = () => {
    setFormulario({
      dni: '',
      nombres: '',
      apellidos: '',
      fechaNacimiento: '',
      genero: '',
      ciudad: ''
    });
    setErrores({});
    setModoEdicion(false);
    setIdEditando(null);
  };

  // Agregar registro
  const agregarRegistro = (e) => {
    e.preventDefault();

    const nuevosErrores = validarFormulario();

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    const nuevoRegistro = {
      ...formulario,
      id: Date.now()
    };

    setRegistros([...registros, nuevoRegistro]);
    limpiarFormulario();
    alert('Registro agregado exitosamente');
  };

  // Actualizar registro
  const actualizarRegistro = (e) => {
    e.preventDefault();

    const nuevosErrores = validarFormulario();

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    const registrosActualizados = registros.map(reg =>
      reg.id === idEditando ? { ...formulario, id: idEditando } : reg
    );

    setRegistros(registrosActualizados);
    localStorage.setItem('registrosFormulario', JSON.stringify(registrosActualizados));
    limpiarFormulario();
    alert('Registro actualizado exitosamente');
  };

  // Editar registro
  const editarRegistro = (registro) => {
    setFormulario({
      dni: registro.dni,
      nombres: registro.nombres,
      apellidos: registro.apellidos,
      fechaNacimiento: registro.fechaNacimiento,
      genero: registro.genero,
      ciudad: registro.ciudad
    });
    setModoEdicion(true);
    setIdEditando(registro.id);
    setErrores({});
  };

  // Eliminar registro
  const eliminarRegistro = (id) => {
    if (window.confirm('¿Está seguro de eliminar este registro?')) {
      const registrosActualizados = registros.filter(reg => reg.id !== id);
      setRegistros(registrosActualizados);
      localStorage.setItem('registrosFormulario', JSON.stringify(registrosActualizados));
      alert('Registro eliminado exitosamente');
    }
  };

  return (
    <div className="container">
      <h1>Sistema de Registro CRUD</h1>

      <form onSubmit={modoEdicion ? actualizarRegistro : agregarRegistro} className="formulario">
        <h2>{modoEdicion ? 'Actualizar Registro' : 'Nuevo Registro'}</h2>

        {/* DNI */}
        <div className="campo">
          <label htmlFor="dni">DNI:</label>
          <input
            type="text"
            id="dni"
            name="dni"
            value={formulario.dni}
            onChange={handleChange}
            placeholder="Ej: 1234567890"
            maxLength="10"
          />
          {errores.dni && <span className="error">{errores.dni}</span>}
        </div>

        {/* Nombres */}
        <div className="campo">
          <label htmlFor="nombres">Nombres:</label>
          <input
            type="text"
            id="nombres"
            name="nombres"
            value={formulario.nombres}
            onChange={handleChange}
            placeholder="Ingrese nombres completos"
          />
          {errores.nombres && <span className="error">{errores.nombres}</span>}
        </div>

        {/* Apellidos */}
        <div className="campo">
          <label htmlFor="apellidos">Apellidos:</label>
          <input
            type="text"
            id="apellidos"
            name="apellidos"
            value={formulario.apellidos}
            onChange={handleChange}
            placeholder="Ingrese apellidos completos"
          />
          {errores.apellidos && <span className="error">{errores.apellidos}</span>}
        </div>

        {/* Fecha de Nacimiento */}
        <div className="campo">
          <label htmlFor="fechaNacimiento">Fecha de Nacimiento:</label>
          <input
            type="date"
            id="fechaNacimiento"
            name="fechaNacimiento"
            value={formulario.fechaNacimiento}
            onChange={handleChange}
            max={calcularFechaMaxima()}
          />
          {errores.fechaNacimiento && <span className="error">{errores.fechaNacimiento}</span>}
        </div>

        {/* Género */}
        <div className="campo">
          <label>Género:</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="genero"
                value="Masculino"
                checked={formulario.genero === 'Masculino'}
                onChange={handleChange}
              />
              Masculino
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="genero"
                value="Femenino"
                checked={formulario.genero === 'Femenino'}
                onChange={handleChange}
              />
              Femenino
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="genero"
                value="Otro"
                checked={formulario.genero === 'Otro'}
                onChange={handleChange}
              />
              Otro
            </label>
          </div>
          {errores.genero && <span className="error">{errores.genero}</span>}
        </div>

        {/* Ciudad */}
        <div className="campo">
          <label htmlFor="ciudad">Ciudad:</label>
          <select
            id="ciudad"
            name="ciudad"
            value={formulario.ciudad}
            onChange={handleChange}
          >
            <option value="" disabled>Seleccione una ciudad</option>
            <option value="Quito">Quito</option>
            <option value="Guayaquil">Guayaquil</option>
            <option value="Cuenca">Cuenca</option>
            <option value="Ambato">Ambato</option>
            <option value="Loja">Loja</option>
            <option value="Manta">Manta</option>
          </select>
          {errores.ciudad && <span className="error">{errores.ciudad}</span>}
        </div>

        {/* Botones */}
        <div className="botones">
          <button type="submit" className="btn-primario">
            {modoEdicion ? 'Actualizar Registro' : 'Agregar Registro'}
          </button>
          {modoEdicion && (
            <button type="button" onClick={limpiarFormulario} className="btn-secundario">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Tabla de registros */}
      <div className="tabla-container">
        <h2>Registros</h2>
        {registros.length === 0 ? (
          <p className="sin-registros">No hay registros</p>
        ) : (
          <table className="tabla">
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
              {registros.map(registro => (
                <tr key={registro.id}>
                  <td>{registro.dni}</td>
                  <td>{registro.nombres}</td>
                  <td>{registro.apellidos}</td>
                  <td>{registro.fechaNacimiento}</td>
                  <td>{registro.genero}</td>
                  <td>{registro.ciudad}</td>
                  <td className="acciones">
                    <button
                      onClick={() => editarRegistro(registro)}
                      className="btn-editar"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => eliminarRegistro(registro.id)}
                      className="btn-eliminar"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default App