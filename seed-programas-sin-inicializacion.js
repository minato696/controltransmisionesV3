// seed-programas-sin-inicializacion.js
// Versión del script que no requiere inicialización de la base de datos
// Asume que ya has inicializado la base de datos desde la interfaz de usuario

const axios = require('axios');

// URL base para la API
const API_URL = 'http://localhost:3000/api';

// Lista de programas a crear
const programas = [
  { nombre: "EXITOSA PERU", filialNombre: "AREQUIPA", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "05:00" },
  { nombre: "EXITOSA PERÚ", filialNombre: "CHICLAYO", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "05:00" },
  { nombre: "EXITOSA PERÚ", filialNombre: "HUACHO", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "05:00" },
  { nombre: "EXITOSA POLICIALES", filialNombre: "IQUITOS", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "05:00" },
  { nombre: "EXITOSA POLICIALES", filialNombre: "TACNA", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "05:00" },
  { nombre: "EXITOSA POLICIALES", filialNombre: "TRUJILLO", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "05:00" },
  { nombre: "LA VOZ DE LOS PUEBLOS", filialNombre: "HUANCAYO", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "05:00" },
  { nombre: "DESDE EL CAMPO", filialNombre: "CHIMBOTE", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "06:00" },
  { nombre: "EXITOSA NOTICIAS", filialNombre: "ICA", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "06:00" },
  { nombre: "EXITOSA NOTICIAS", filialNombre: "TRUJILLO", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "06:00" },
  { nombre: "EXITOSA PERU", filialNombre: "HUANCAYO", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "06:00" },
  { nombre: "EXITOSA PERU", filialNombre: "PUNO", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "06:00" },
  { nombre: "EXITOSA PERÚ", filialNombre: "PIURA", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "06:00" },
  { nombre: "EXITOSA POLICIALES", filialNombre: "CUSCO", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "06:00" },
  { nombre: "EXITOSA POLICIALES", filialNombre: "TARAPOTO", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "06:00" },
  { nombre: "EXITOSA NOTICIAS", filialNombre: "CUSCO", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "07:00" },
  { nombre: "EXITOSA PERU", filialNombre: "HUARAZ", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "07:00" },
  { nombre: "EXITOSA PERÚ", filialNombre: "CHINCHA", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "07:00" },
  { nombre: "EXITOSA PERÚ", filialNombre: "HUACHO", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "07:00" },
  { nombre: "EXITOSA PERÚ", filialNombre: "HUARAL", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "07:00" },
  { nombre: "EXITOSA NOTICIAS", filialNombre: "TACNA", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "11:00" },
  { nombre: "EXITOSA NOTICIAS II", filialNombre: "TRUJILLO", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "11:00" },
  { nombre: "EXITOSA TE ESCUCHA", filialNombre: "AREQUIPA", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "11:00" },
  { nombre: "EXITOSA TE ESCUCHA", filialNombre: "CHICLAYO", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "11:00" },
  { nombre: "EXITOSA TE ESCUCHA", filialNombre: "HUACHO", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "11:00" },
  { nombre: "EXITOSA TE ESCUCHA", filialNombre: "PIURA", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "11:00" },
  { nombre: "INFORMAMOS Y OPINAMOS", filialNombre: "HUANCAYO", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "11:00" },
  { nombre: "EXITOSA NOTICIAS", filialNombre: "IQUITOS", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "12:00" },
  { nombre: "EXITOSA NOTICIAS", filialNombre: "PUNO", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "12:00" },
  { nombre: "EXITOSA NOTICIAS", filialNombre: "TARAPOTO", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "12:00" },
  { nombre: "EXITOSA TE ESCUCHA", filialNombre: "CHIMBOTE", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "12:00" },
  { nombre: "EXITOSA TE ESCUCHA", filialNombre: "HUARAL", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "12:00" },
  { nombre: "INFORMAMOS Y OPINAMOS", filialNombre: "CUSCO", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "12:00" },
  { nombre: "INFORMAMOS Y OPINAMOS", filialNombre: "CUSCO", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "13:00" },
  { nombre: "EXITOSA DEPORTES", filialNombre: "AREQUIPA", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "14:00" },
  { nombre: "INFORMAMOS Y OPINAMOS", filialNombre: "CHICLAYO", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "19:00" },
  { nombre: "INFORMAMOS Y OPINAMOS", filialNombre: "HUANCAYO", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "19:00" },
  { nombre: "INFORMAMOS Y OPINAMOS", filialNombre: "HUARAZ", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "19:00" },
  { nombre: "INFORMAMOS Y OPINAMOS", filialNombre: "IQUITOS", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "19:00" },
  { nombre: "INFORMAMOS Y OPINAMOS", filialNombre: "TRUJILLO", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "19:00" },
  { nombre: "LA HORA DEL VOLANTE", filialNombre: "AREQUIPA", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "19:00" },
  { nombre: "NO AL DELITO", filialNombre: "AREQUIPA", dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], horaInicio: "20:00" },
  { nombre: "EXITOSA POLICIALES (SÁBADO)", filialNombre: "AREQUIPA", dias: ["SABADO"], horaInicio: "05:00" },
  { nombre: "EXITOSA POLICIALES (SÁBADO)", filialNombre: "TACNA", dias: ["SABADO"], horaInicio: "06:00" },
  { nombre: "EXITOSA POLICIALES (SÁBADO)", filialNombre: "TRUJILLO", dias: ["SABADO"], horaInicio: "06:00" }
];

// Verificar si la API está disponible
async function verificarAPI() {
  try {
    console.log('Verificando si la API está disponible...');
    await axios.get(`${API_URL}/debug`);
    console.log('La API está disponible.');
    return true;
  } catch (error) {
    if (error.response) {
      console.log('La API está disponible (recibimos una respuesta).');
      return true;
    }
    console.error('No se pudo conectar a la API. Verifica que la aplicación esté en ejecución.');
    return false;
  }
}

// Función para obtener todas las filiales
async function obtenerFiliales() {
  try {
    console.log('Obteniendo filiales...');
    const response = await axios.get(`${API_URL}/filiales`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener filiales:', error.message);
    return [];
  }
}

// Función para crear una filial si no existe
async function crearFilialSiNoExiste(nombre) {
  try {
    console.log(`Verificando si existe la filial "${nombre}"...`);
    const filiales = await obtenerFiliales();
    const filialExistente = filiales.find(f => f.nombre.toUpperCase() === nombre.toUpperCase());
    
    if (filialExistente) {
      console.log(`La filial "${nombre}" ya existe con ID ${filialExistente.id}`);
      return filialExistente;
    }
    
    console.log(`Creando nueva filial "${nombre}"...`);
    const response = await axios.post(`${API_URL}/filiales`, {
      nombre: nombre,
      activa: true
    });
    
    console.log(`Filial "${nombre}" creada con ID ${response.data.id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al crear filial "${nombre}":`, error.message);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
    }
    throw error;
  }
}

// Función para crear un programa
async function crearPrograma(programa, filialId) {
  try {
    console.log(`Creando programa "${programa.nombre}" en filial ID ${filialId}...`);
    
    // Convertir horario al formato HH:MM
    let horaInicio = programa.horaInicio;
    if (horaInicio.length === 4) {
      horaInicio = `0${horaInicio}`;
    }
    
    // Primer intento: usar el endpoint específico por días
    try {
      const response = await axios.post(`${API_URL}/programas/por-dias`, {
        nombre: programa.nombre,
        diasSemana: programa.dias,
        horaInicio: horaInicio,
        isActivo: true,
        filialIds: [filialId]
      });
      
      console.log(`Programa "${programa.nombre}" creado con ID ${response.data.id}`);
      return response.data;
    } catch (error) {
      console.warn(`Error al usar endpoint por días, intentando endpoint estándar...`);
      
      // Segundo intento: usar el endpoint estándar de programas
      const response = await axios.post(`${API_URL}/programas`, {
        nombre: programa.nombre,
        descripcion: `Programa ${programa.nombre} para ${programa.dias.join(', ')}`,
        estado: "activo",
        diasSemana: programa.dias,
        horaInicio: horaInicio,
        filialIds: [filialId]
      });
      
      console.log(`Programa "${programa.nombre}" creado con endpoint estándar, ID ${response.data.id}`);
      return response.data;
    }
  } catch (error) {
    console.error(`Error al crear programa "${programa.nombre}":`, error.message);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
    }
    throw error;
  }
}

// Función principal para ejecutar el script
async function main() {
  try {
    console.log('Iniciando script de creación de programas...');
    
    // Verificar que la API esté disponible
    const apiDisponible = await verificarAPI();
    if (!apiDisponible) {
      console.error('No se puede continuar sin acceso a la API.');
      return;
    }
    
    // Obtener o crear filiales
    const filialesMap = new Map();
    
    // Procesar programas uno por uno
    let programasCreados = 0;
    let errores = 0;
    
    // Preguntar si procesar todos los programas o solo algunos
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    console.log(`\nSe van a crear ${programas.length} programas. ¿Deseas crear todos o especificar una cantidad?`);
    console.log('1. Crear todos los programas');
    console.log('2. Especificar cantidad');
    
    readline.question('Selecciona una opción (1 o 2): ', (answer) => {
      let cantidadProgramas = programas.length;
      
      if (answer === '2') {
        readline.question('¿Cuántos programas deseas crear? ', (cantidad) => {
          cantidadProgramas = parseInt(cantidad);
          if (isNaN(cantidadProgramas) || cantidadProgramas <= 0) {
            console.log('Cantidad inválida. Se usará el total de programas.');
            cantidadProgramas = programas.length;
          }
          
          readline.close();
          procesarProgramas(cantidadProgramas);
        });
      } else {
        readline.close();
        procesarProgramas(cantidadProgramas);
      }
    });
    
    async function procesarProgramas(cantidad) {
      console.log(`\nCreando ${cantidad} programas...`);
      
      for (let i = 0; i < Math.min(cantidad, programas.length); i++) {
        const programa = programas[i];
        try {
          // Obtener o crear filial
          let filial;
          if (filialesMap.has(programa.filialNombre)) {
            filial = filialesMap.get(programa.filialNombre);
          } else {
            filial = await crearFilialSiNoExiste(programa.filialNombre);
            filialesMap.set(programa.filialNombre, filial);
          }
          
          // Crear programa
          await crearPrograma(programa, filial.id);
          programasCreados++;
          
          // Esperar un poco entre cada creación para no sobrecargar la API
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error al procesar programa "${programa.nombre}" en filial "${programa.filialNombre}":`, error.message);
          errores++;
        }
      }
      
      console.log('\n--- RESUMEN ---');
      console.log(`Total de programas procesados: ${Math.min(cantidad, programas.length)}`);
      console.log(`Programas creados exitosamente: ${programasCreados}`);
      console.log(`Errores: ${errores}`);
      console.log('Script finalizado.');
    }
  } catch (error) {
    console.error('Error general en la ejecución del script:', error);
  }
}

// Ejecutar el script
main();