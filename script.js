// Esperar a que el DOM esté completamente cargado antes de ejecutar el script
document.addEventListener("DOMContentLoaded", () => {
  // Referencias a los elementos del formulario y tabla
  const reservaForm = document.getElementById("reservaForm");
  const tablaReservas = document.getElementById("tablaReservas");
  const matriculaInput = document.getElementById("matricula");
  const validacionMatricula = document.getElementById("validacionMatricula");
  const matriculaCorrecta = document.getElementById("matriculaCorrecta");
  const btnImprimir = document.getElementById("btnImprimir");

  // Variables para almacenar las reservas y el estado de edición
  let reservas = [];
  let editando = null;

  // Restringir el campo de matrícula para que solo permita números
  matriculaInput.addEventListener("keypress", (e) => {
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault(); // Bloquear caracteres no numéricos
    }
  });

  // Validar el formato de matrícula en tiempo real
  matriculaInput.addEventListener("input", () => {
    const matriculaValida = /^[0-9]{8}$/.test(matriculaInput.value); // Verificar si tiene 8 dígitos numéricos
    if (matriculaValida) {
      validacionMatricula.classList.add("d-none"); // Ocultar advertencia de error
      matriculaCorrecta.classList.remove("d-none"); // Mostrar indicador de validación correcta
    } else {
      validacionMatricula.classList.remove("d-none"); // Mostrar advertencia de error
      matriculaCorrecta.classList.add("d-none"); // Ocultar indicador de validación correcta
    }
  });

  // Manejar el envío del formulario
  reservaForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevenir recarga de la página

    // Obtener valores de los campos del formulario
    const nombre = document.getElementById("nombre").value.trim();
    const matricula = matriculaInput.value.trim();
    const actividad = document.getElementById("actividad").value;
    const fecha = document.getElementById("fecha").value;

    // Validar los datos del formulario
    if (!validarFormulario(nombre, matricula, actividad, fecha)) return;

    if (editando) {
      // Actualizar una reserva existente si estamos en modo edición
      actualizarReserva(editando, { nombre, matricula, actividad, fecha });
      editando = null; // Resetear estado de edición
    } else {
      // Verificar si ya existe una reserva con la misma matrícula
      const esDuplicadoMatricula = reservas.some((r) => r.matricula === matricula);
      if (esDuplicadoMatricula) {
        alert("Ya existe una reserva con esta matrícula.");
        return;
      }

      // Verificar si ya existe una reserva con la misma actividad
      const esDuplicadoActividad = reservas.some((r) => r.actividad === actividad);
      if (esDuplicadoActividad) {
        alert("Ya existe una reserva con esta actividad.");
        return;
      }

      // Agregar nueva reserva al arreglo
      reservas.push({ id: Date.now(), nombre, matricula, actividad, fecha });
    }

    // Actualizar la tabla con las reservas y resetear el formulario
    mostrarReservas();
    reservaForm.reset();
    validacionMatricula.classList.add("d-none");
    matriculaCorrecta.classList.add("d-none");
  });

  // Función para validar los datos del formulario
  const validarFormulario = (nombre, matricula, actividad, fecha) => {
    if (!nombre || !matricula || !actividad || !fecha) {
      alert("Todos los campos son obligatorios.");
      return false;
    }
    if (!/^[0-9]{8}$/.test(matricula)) {
      alert("El código de matrícula debe tener 8 dígitos numéricos.");
      return false;
    }
    const fechaActual = new Date().toISOString().split("T")[0]; // Fecha actual en formato YYYY-MM-DD
    if (fecha < fechaActual) {
      alert("La fecha debe ser actual o futura.");
      return false;
    }
    return true;
  };

  // Mostrar reservas en la tabla
  const mostrarReservas = () => {
    tablaReservas.innerHTML = ""; // Limpiar contenido actual de la tabla
    reservas.forEach((reserva) => {
      const fila = document.createElement("tr"); // Crear fila para cada reserva
      fila.innerHTML = `
        <td>${reserva.nombre}</td>
        <td>${reserva.matricula}</td>
        <td>${reserva.actividad}</td>
        <td>${reserva.fecha}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editarReserva(${reserva.id})">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="eliminarReserva(${reserva.id})">Eliminar</button>
        </td>
      `;
      tablaReservas.appendChild(fila); // Agregar fila a la tabla
    });
  };

  // Función para editar una reserva
  window.editarReserva = (id) => {
    const reserva = reservas.find((r) => r.id === id); // Buscar reserva por ID
    if (!reserva) return;
    document.getElementById("nombre").value = reserva.nombre;
    matriculaInput.value = reserva.matricula;
    document.getElementById("actividad").value = reserva.actividad;
    document.getElementById("fecha").value = reserva.fecha;

    editando = id; // Establecer ID de edición
  };

  // Función para eliminar una reserva
  window.eliminarReserva = (id) => {
    if (confirm("¿Estás seguro de eliminar esta reserva?")) {
      reservas = reservas.filter((r) => r.id !== id); // Filtrar reservas, eliminando la seleccionada
      mostrarReservas(); // Actualizar tabla
    }
  };

  // Función para actualizar los datos de una reserva
  const actualizarReserva = (id, datos) => {
    const index = reservas.findIndex((r) => r.id === id); // Obtener índice de la reserva
    reservas[index] = { ...reservas[index], ...datos }; // Actualizar datos de la reserva
  };

  // Imprimir la lista de reservas
  btnImprimir.addEventListener("click", () => {
    const ventana = window.open("", "_blank");
    ventana.document.write("<html><head><title>Reservas</title></head><body>");
    ventana.document.write("<h1>Lista de Reservas</h1>");
    ventana.document.write(tablaReservas.outerHTML); // Incluir tabla de reservas
    ventana.document.write("</body></html>");
    ventana.document.close();
    ventana.print(); // Abrir diálogo de impresión
  });
});