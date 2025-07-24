'use client';

// src/components/transmisiones/ControlTransmisiones.tsx
import { useState, useEffect } from 'react';
import { 
  DIAS_SEMANA, 
  obtenerFechasSemana,
  normalizarDiaSemana
} from './constants';
import { 
  TransmisionEditar, 
  DiaSemana, 
  Filial, 
  Programa, 
  Reporte 
} from './types';
import {
  getFilialesTransformadas,
  getProgramasTransformados,
  getReportesPorFechas,
  guardarOActualizarReporte
} from '../../services/api-client';
import { endOfWeek, startOfWeek, format } from 'date-fns';
import { es } from 'date-fns/locale';

// Importamos los componentes
import TransmisionTooltip from './TransmisionTooltip';
import ReporteForm from './ReporteForm';
import SelectorSemanasMejorado from './SelectorSemanasMejorado';
import VistaReportesDiaSemanalStyle from './VistaReportesDiaSemanalStyle';
import DashboardGeneral from '@/components/dashboard/DashboardGeneral';
import ExportComponent from '@/components/exportacion/ExportComponent';
import Sidebar from '@/components/layout/Sidebar';

export default function ControlTransmisiones() {
  // Estados principales
  const [filiales, setFiliales] = useState<Filial[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [filialSeleccionada, setFilialSeleccionada] = useState<number | null>(null);
  const [programaSeleccionado, setProgramaSeleccionado] = useState<number | null>(null);
  const [vistaActual, setVistaActual] = useState<'semana' | 'dia'>('semana');
  const [diasSemana, setDiasSemana] = useState<DiaSemana[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [transmisionEditar, setTransmisionEditar] = useState<TransmisionEditar | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reporteActual, setReporteActual] = useState<Reporte | null>(null);
  // Estados para fechas y modo de selección
  const [fechaInicio, setFechaInicio] = useState<Date>(new Date());
  const [fechaFin, setFechaFin] = useState<Date>(endOfWeek(new Date(), { weekStartsOn: 1 }));
  const [modoSeleccion, setModoSeleccion] = useState<'semana' | 'dia' | 'rango'>('semana');
  // Estado para alternar entre vista normal y resumen general
  const [mostrarResumen, setMostrarResumen] = useState<boolean>(true);
  // Estado para controlar la visibilidad de la barra lateral en móviles
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(true);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Actualizar días de la semana cuando cambien las fechas o el modo
  useEffect(() => {
    let fechasSemana: DiaSemana[] = [];
    
    if (modoSeleccion === 'semana') {
      // En modo semana, obtener los 6 días (lunes a sábado)
      fechasSemana = obtenerFechasSemana(fechaInicio);
    } else if (modoSeleccion === 'dia') {
      // En modo día, mostrar solo el día seleccionado
      const diaSeleccionado = fechaInicio;
      const nombreDia = format(diaSeleccionado, 'EEEE', { locale: es });
      
      // Capitalizar primera letra
      const nombreFormateado = nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1);
      
      fechasSemana = [{
        nombre: nombreFormateado,
        fecha: format(diaSeleccionado, 'yyyy-MM-dd')
      }];
    } else if (modoSeleccion === 'rango') {
      // En modo rango, generar todos los días entre fechaInicio y fechaFin
      const dias: DiaSemana[] = [];
      let fechaActual = new Date(fechaInicio);
      
      while (fechaActual <= fechaFin) {
        const nombreDia = format(fechaActual, 'EEEE', { locale: es });
        const nombreFormateado = nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1);
        
        dias.push({
          nombre: nombreFormateado,
          fecha: format(fechaActual, 'yyyy-MM-dd')
        });
        
        // Avanzar al siguiente día
        fechaActual.setDate(fechaActual.getDate() + 1);
      }
      
      fechasSemana = dias;
    }
    
    setDiasSemana(fechasSemana);
  }, [fechaInicio, fechaFin, modoSeleccion]);

  // Cargar reportes cuando cambie la selección
  useEffect(() => {
    // Si estamos en modo día, cargar reportes siempre que cambie la fecha
    if (modoSeleccion === 'dia') {
      cargarReportes();
    } 
    // En modo semana o rango, cargar reportes cuando haya filial seleccionada
    else if (filialSeleccionada && diasSemana.length > 0) {
      cargarReportes();
    }
  }, [filialSeleccionada, diasSemana, fechaInicio, modoSeleccion]);

  // Manejar cambios en el rango de fechas
  const handleFechasChange = (inicio: Date, fin: Date) => {
    setFechaInicio(inicio);
    setFechaFin(fin);
  };

  // Manejar cambios en el modo de selección
  const handleModoSeleccionChange = (modo: 'semana' | 'dia' | 'rango') => {
    setModoSeleccion(modo);
    
    // Si cambia a modo día, cargar reportes para ese día específico
    if (modo === 'dia') {
      // Asegurarnos de que la fecha inicial y final sean el mismo día
      const fechaDia = new Date(fechaInicio);
      setFechaFin(fechaDia);
      cargarReportes();
    }
  };

  // Cargar datos desde la API
  const cargarDatosIniciales = async () => {
    try {
      setCargando(true);
      setError(null);
      
      const [filialesData, programasData] = await Promise.all([
        getFilialesTransformadas(),
        getProgramasTransformados()
      ]);
      
      // Asegurarse de que los datos tengan el formato correcto
      const filialesConvertidas: Filial[] = filialesData.map(f => ({
        ...f,
        isActivo: f.isActivo ?? f.activa
      }));
      
      const programasConvertidos: Programa[] = programasData.map(p => ({
        ...p,
        horario: p.horario || p.horaInicio || '00:00',
        // Normalizar los diasSemana para asegurarnos de que estén en formato consistente
        diasSemana: (p.diasSemana || ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']).map(
          d => normalizarDiaSemana(d)
        ),
        isActivo: p.isActivo ?? (p.estado === 'activo')
      }));
      
      setFiliales(filialesConvertidas.filter(f => f.isActivo));
      setProgramas(programasConvertidos.filter(p => p.isActivo));
      
      // Seleccionar primera filial si existe
      if (filialesConvertidas.length > 0) {
        const primeraFilialActiva = filialesConvertidas.find(f => f.isActivo);
        if (primeraFilialActiva) {
          setFilialSeleccionada(Number(primeraFilialActiva.id));
        }
      }
      
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  // Cargar reportes
  const cargarReportes = async () => {
    try {
      if (!diasSemana.length) return;
      
      const fechaInicio = diasSemana[0].fecha;
      const fechaFin = diasSemana[diasSemana.length - 1].fecha;
      
      // Mostrar indicador de carga para los reportes
      setReportes([]); // Limpiar reportes existentes
      
      const reportesData = await getReportesPorFechas(fechaInicio, fechaFin);
      setReportes(reportesData);
    } catch (err) {
      console.error('Error al cargar reportes:', err);
    }
  };

  const getProgramasDeFilial = () => {
    if (!filialSeleccionada) return [];
    
    const filial = filiales.find(f => Number(f.id) === filialSeleccionada);
    if (!filial) return [];
    
    // Filtrar programas asociados a la filial y que tengan al menos un día configurado
    const programasFiltrados = programas.filter(p => {
      // Verificar si el programa está asociado a la filial
      let estaAsociado = false;
      
      // Primero verificar filialesIds (múltiples filiales)
      if (p.filialesIds && p.filialesIds.length > 0) {
        estaAsociado = p.filialesIds.includes(filialSeleccionada);
      }
      // Luego verificar programaIds de la filial
      else if (filial.programaIds && filial.programaIds.includes(Number(p.id))) {
        estaAsociado = true;
      }
      // Finalmente verificar filialId único (compatibilidad)
      else if (Number(p.filialId) === filialSeleccionada) {
        estaAsociado = true;
      }
      
      // Solo incluir el programa si está asociado a la filial Y tiene días de la semana configurados
      return estaAsociado && p.diasSemana && p.diasSemana.length > 0;
    });
    
    // Ordenar programas por hora (de más temprano a más tarde)
    return programasFiltrados.sort((a, b) => {
      // Primero verificar si alguno es programa de sábado (éstos van al final)
      const aEsSabado = a.nombre.includes('(SÁBADO)') || a.nombre.includes('(SABADO)');
      const bEsSabado = b.nombre.includes('(SÁBADO)') || b.nombre.includes('(SABADO)');
      
      // Si uno es de sábado y el otro no, el de sábado va después
      if (aEsSabado && !bEsSabado) return 1;
      if (!aEsSabado && bEsSabado) return -1;
      
      // Si ambos son de sábado o ninguno lo es, ordenar por hora
      // Convertir hora a minutos para comparar
      const convertirHoraAMinutos = (hora: string) => {
        if (!hora) return 24*60; // Si no hay hora, ponerlo al final
        
        const partes = hora.split(':');
        if (partes.length !== 2) return 24*60;
        
        const horas = parseInt(partes[0], 10);
        const minutos = parseInt(partes[1], 10);
        
        return horas * 60 + minutos;
      };
      
      const minutosA = convertirHoraAMinutos(a.horario || a.horaInicio || '');
      const minutosB = convertirHoraAMinutos(b.horario || b.horaInicio || '');
      
      return minutosA - minutosB;
    });
  };

  // Manejar cambio de filial
  const handleFilialClick = (filialId: number) => {
    setFilialSeleccionada(filialId);
    // Ya no necesitamos seleccionar un programa específico, ya que mostraremos todos
    setProgramaSeleccionado(null);
    setMostrarResumen(false);
    
    // En móviles, cerrar el sidebar después de seleccionar
    if (window.innerWidth < 768) {
      setSidebarVisible(false);
    }
  };

  // Obtener el reporte para una fecha específica
  const getReporte = (filialId: number, programaId: number, fecha: string): Reporte | null => {
    return reportes.find(r => 
      r.filialId === filialId && 
      r.programaId === programaId && 
      r.fecha === fecha
    ) || null;
  };

  // Cuando se carga la página, cargar reportes para el resumen general
  useEffect(() => {
    if (mostrarResumen && !cargando && filiales.length > 0 && programas.length > 0) {
      cargarReportes();
    }
  }, [mostrarResumen, cargando, filiales.length, programas.length]);

  // Abrir formulario
  const abrirFormulario = (filialId: number, programaId: number, dia: string, fecha: string) => {
    const filial = filiales.find(f => Number(f.id) === filialId);
    const programa = programas.find(p => Number(p.id) === programaId);
    const reporte = getReporte(filialId, programaId, fecha);
    
    if (!filial || !programa) return;
    
    setTransmisionEditar({
      filialId,
      programaId,
      filial: filial.nombre,
      programa: programa.nombre,
      hora: programa.horario || programa.horaInicio || '',
      dia,
      fecha,
      reporteId: reporte?.id_reporte
    });
    
    // Preprocesamiento especial para reportes con motivo personalizado
    if (reporte && reporte.motivo && !reporte.target) {
      // Si hay un motivo pero no target, establecer target como "Otros"
      reporte.target = 'Otros';
    }
    
    setReporteActual(reporte);
    setMostrarFormulario(true);
  };

  // Guardar formulario
  const guardarFormulario = async (datosForm: {
    estadoTransmision: string;
    horaReal: string;
    horaTT: string;
    target: string;
    motivoPersonalizado: string;
  }) => {
    if (!transmisionEditar) return;
    
    try {
      setGuardando(true);
      setError(null);
      
      // Preparar datos del reporte
      const datosReporte: any = {
        filialId: transmisionEditar.filialId,
        programaId: transmisionEditar.programaId,
        fecha: transmisionEditar.fecha,
        estadoTransmision: datosForm.estadoTransmision === 'si' ? 'Si' :
                          datosForm.estadoTransmision === 'no' ? 'No' :
                          datosForm.estadoTransmision === 'tarde' ? 'Tarde' : 
                          'Pendiente',
        estado: datosForm.estadoTransmision
      };
      
      // Agregar ID si es actualización
      if (reporteActual?.id_reporte) {
        datosReporte.id_reporte = reporteActual.id_reporte;
      }
      
      // Configurar datos según el estado
      if (datosForm.estadoTransmision === 'si') {
        // Transmitió a tiempo
        datosReporte.hora = datosForm.horaReal;
        datosReporte.horaReal = datosForm.horaReal;
        datosReporte.target = null;
        datosReporte.motivo = null;
        datosReporte.hora_tt = null;
      } else if (datosForm.estadoTransmision === 'no') {
        // No transmitió
        datosReporte.hora = datosForm.horaReal;
        datosReporte.horaReal = datosForm.horaReal;
        datosReporte.hora_tt = null;
        
        if (datosForm.target === 'Otros') {
          // Si seleccionó "Otros", guardar tanto el target como el motivo
          datosReporte.target = 'Otros';
          datosReporte.motivo = datosForm.motivoPersonalizado || 'Sin especificar';
        } else if (datosForm.target) {
          // Si seleccionó un target estándar, guardar solo el target
          datosReporte.target = datosForm.target;
          datosReporte.motivo = null;
        } else {
          // Si no seleccionó target, dejar valores nulos
          datosReporte.target = null;
          datosReporte.motivo = null;
        }
      } else if (datosForm.estadoTransmision === 'tarde') {
        // Transmitió tarde
        datosReporte.hora = datosForm.horaReal;
        datosReporte.horaReal = datosForm.horaReal;
        datosReporte.hora_tt = datosForm.horaTT;
        
        if (datosForm.target === 'Otros') {
          // Si seleccionó "Otros", guardar tanto el target como el motivo
          datosReporte.target = 'Otros';
          datosReporte.motivo = datosForm.motivoPersonalizado || 'Sin especificar';
        } else if (datosForm.target) {
          // Si seleccionó un target estándar, guardar solo el target
          datosReporte.target = datosForm.target;
          datosReporte.motivo = null;
        } else {
          // Si no seleccionó target, podemos mantener el motivo anterior si existe
          if (reporteActual?.motivo) {
            datosReporte.target = 'Otros';
            datosReporte.motivo = reporteActual.motivo;
          } else {
            datosReporte.target = null;
            datosReporte.motivo = null;
          }
        }
      } else {
        // Estado pendiente, limpiar todos los campos
        datosReporte.hora = null;
        datosReporte.horaReal = null;
        datosReporte.hora_tt = null;
        datosReporte.target = null;
        datosReporte.motivo = null;
      }
      
      // Guardar en la API
      await guardarOActualizarReporte(
        transmisionEditar.filialId,
        transmisionEditar.programaId,
        transmisionEditar.fecha,
        datosReporte
      );
      
      // Recargar reportes
      await cargarReportes();
      
      setMostrarFormulario(false);
    } catch (err: any) {
      console.error('Error al guardar:', err);
      
      // Mostrar mensaje de error detallado
      if (err.response && err.response.data && err.response.data.error) {
        setError(`Error: ${err.response.data.error}`);
      } else if (err.message) {
        setError(`Error al guardar: ${err.message}`);
      } else {
        setError('Error al guardar el reporte. Por favor, intente nuevamente.');
      }
    } finally {
      setGuardando(false);
    }
  };

  // Verificar si un programa se transmite en un día
  const programaTransmiteEnDia = (programa: Programa, diaNombre: string): boolean => {
    // Si el programa no tiene días definidos, considerar que no se transmite
    if (!programa.diasSemana || programa.diasSemana.length === 0) {
      return false;
    }
    
    // Caso especial para programas que contienen "(SÁBADO)" en su nombre
    if (programa.nombre.includes('(SÁBADO)') || programa.nombre.includes('(SABADO)')) {
      // Si el programa es específico para sábado, solo debe transmitir en sábado
      return diaNombre.toUpperCase() === 'SÁBADO' || diaNombre.toUpperCase() === 'SABADO';
    }
    
    // Normalizar el nombre del día para la comparación
    const diaNormalizado = normalizarDiaSemana(diaNombre);
    
    // Comprobar si el programa tiene este día en su lista de diasSemana
    return programa.diasSemana.some(d => {
      const diaProgramaNormalizado = normalizarDiaSemana(d);
      return diaProgramaNormalizado === diaNormalizado;
    });
  };

  // Renderizar estado de carga
  if (cargando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  // Obtener el nombre de la filial seleccionada
  const filialNombre = filialSeleccionada 
    ? filiales.find(f => Number(f.id) === filialSeleccionada)?.nombre 
    : '';

  // Toggle para mostrar/ocultar la barra lateral
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Contenedor principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar con el componente mejorado */}
        <Sidebar
          filiales={filiales}
          onFilialSelect={handleFilialClick}
          filialSeleccionada={filialSeleccionada}
        />

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Botón de menú para mostrar/ocultar sidebar (solo en móvil) */}
          <div className="block md:hidden p-4">
            <button 
              className="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={toggleSidebar}
              aria-label={sidebarVisible ? "Ocultar menú" : "Mostrar menú"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Mostrar el componente de Resumen General si está seleccionado */}
          {mostrarResumen ? (
            <div className="h-full overflow-auto">
              <DashboardGeneral />
            </div>
          ) : (
            <>
              {/* Sección de controles de fecha y modo cuando se muestra una filial */}
              <div className="bg-white border-b shadow-sm">
                {/* Selector de semanas mejorado y modos de visualización */}
                <div className="px-6 py-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0 md:space-x-4">
                    <SelectorSemanasMejorado 
                      fechaInicio={fechaInicio}
                      fechaFin={fechaFin}
                      onFechasChange={handleFechasChange}
                      modoSeleccion={modoSeleccion}
                      onModoSeleccionChange={handleModoSeleccionChange}
                    />
                    
                    {/* Selector de modo de visualización (más visible) */}
                    <div className="bg-white border rounded-lg shadow-sm flex items-center h-10">
                      <button
                        onClick={() => handleModoSeleccionChange('semana')}
                        className={`px-4 h-full rounded-l-lg ${modoSeleccion === 'semana' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                      >
                        Semana
                      </button>
                      <button
                        onClick={() => handleModoSeleccionChange('dia')}
                        className={`px-4 h-full ${modoSeleccion === 'dia' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                      >
                        Día
                      </button>
                      <button
                        onClick={() => handleModoSeleccionChange('rango')}
                        className={`px-4 h-full rounded-r-lg ${modoSeleccion === 'rango' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                      >
                        Rango
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Leyenda */}
                <div className="bg-white border-t border-gray-200 py-2 px-4 flex items-center space-x-6 text-sm">
                  <div className="font-medium">Leyenda:</div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-emerald-500 rounded mr-2"></div>
                    <span>Transmitió</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                    <span>No transmitió</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-amber-500 rounded mr-2"></div>
                    <span>Transmitió Tarde</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                    <span>Pendiente</span>
                  </div>
                </div>
              </div>
              
              {/* Tabla de días y estados */}
              <div className="h-full overflow-auto custom-scrollbar">
                {modoSeleccion === 'semana' ? (
                  <div className="p-6">
                    {/* Tabla de transmisiones */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Filial / Programa
                            </th>
                            {diasSemana.map((dia, idx) => {
                              // Convertir la fecha de string a objeto Date
                              const fechaDia = new Date(dia.fecha);
                              // Formatear la fecha como DD/MM
                              const fechaCorta = format(fechaDia, "dd/MM");
                              
                              return (
                                <th key={idx} scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  <div>{dia.nombre.substring(0, 3)}</div>
                                  <div>{fechaCorta}</div>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {getProgramasDeFilial().map((programa) => (
                            <tr key={programa.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{programa.nombre}</div>
                                <div className="text-sm text-gray-500">{programa.horario || programa.horaInicio}</div>
                              </td>
                              {diasSemana.map((dia, idx) => {
                                const transmiteEnDia = programaTransmiteEnDia(programa, dia.nombre);
                                
                                // Caso especial para programas de sábado
                                const esProgramaSabado = programa.nombre.includes('(SÁBADO)') || programa.nombre.includes('(SABADO)');
                                const esDiaSabado = dia.nombre.toUpperCase() === 'SÁBADO' || dia.nombre.toUpperCase() === 'SABADO';
                                
                                if (!transmiteEnDia || (esProgramaSabado && !esDiaSabado)) {
                                  return (
                                    <td key={idx} className="px-4 py-4 whitespace-nowrap text-center">
                                      <div className="inline-block w-10 h-10 border border-gray-200 rounded-md bg-white"></div>
                                    </td>
                                  );
                                }
                                
                                const reporte = getReporte(
                                  filialSeleccionada!, 
                                  Number(programa.id),
                                  dia.fecha
                                );
                                
                                return (
                                  <td key={idx} className="px-4 py-4 whitespace-nowrap text-center">
                                    <div className="inline-flex justify-center">
                                      <TransmisionTooltip 
                                        estado={reporte?.estado || null}
                                        reporte={reporte}
                                        onClick={() => abrirFormulario(
                                          filialSeleccionada!,
                                          Number(programa.id),
                                          dia.nombre,
                                          dia.fecha
                                        )}
                                      />
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : modoSeleccion === 'dia' ? (
                  // Vista de reportes por día (estilo semanal)
                  <VistaReportesDiaSemanalStyle 
                    fecha={fechaInicio}
                    reportes={reportes}
                    programas={programas}
                    filiales={filiales}
                    filialSeleccionada={filialSeleccionada}
                    programaSeleccionado={programaSeleccionado}
                    onAbrirFormulario={abrirFormulario}
                  />
                ) : modoSeleccion === 'rango' ? (
                  // Vista de reportes por rango (similar a la vista por día pero considerando todas las fechas)
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">
                      Reportes del {format(fechaInicio, "d 'de' MMMM", { locale: es })} al {format(fechaFin, "d 'de' MMMM 'de' yyyy", { locale: es })}
                    </h2>
                    
                    {reportes.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-gray-600">No hay reportes para este rango de fechas</p>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto overflow-y-visible custom-scrollbar">
                          <table className="min-w-full sticky-header sticky-first-column">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filial</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Programa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {/* Tabla de reportes por rango */}
                              {reportes.filter(r => 
                                filialSeleccionada ? r.filialId === filialSeleccionada : true
                              ).map((reporte) => {
                                const filial = filiales.find(f => Number(f.id) === reporte.filialId);
                                const programa = programas.find(p => Number(p.id) === reporte.programaId);
                                
                                // Determinar color según estado
                                let bgColor = "bg-gray-200";
                                if (reporte.estado === 'si') bgColor = "bg-emerald-500";
                                else if (reporte.estado === 'no') bgColor = "bg-red-500";
                                else if (reporte.estado === 'tarde') bgColor = "bg-amber-500";
                                
                                // Formatear fecha para mostrar
                                const fechaFormateada = new Date(reporte.fecha);
                                
                                return (
                                  <tr key={reporte.id_reporte}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">
                                        {format(fechaFormateada, "EEE d MMM", { locale: es })}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">{filial?.nombre || 'Desconocida'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">{programa?.nombre || 'Desconocido'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">
                                        {reporte.horaReal || reporte.hora || '-'}
                                        {reporte.estado === 'tarde' && reporte.hora_tt && (
                                          <span className="text-xs text-gray-500 ml-2">→ {reporte.hora_tt}</span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} text-white`}>
                                        {reporte.estado === 'si' ? 'Transmitió' : 
                                         reporte.estado === 'no' ? 'No transmitió' : 
                                         reporte.estado === 'tarde' ? 'Transmitió tarde' : 'Pendiente'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                      <button
                                        onClick={() => {
                                          const dia = format(fechaFormateada, "EEEE", { locale: es });
                                          const diaFormateado = dia.charAt(0).toUpperCase() + dia.slice(1);
                                          abrirFormulario(
                                            reporte.filialId,
                                            reporte.programaId,
                                            diaFormateado,
                                            reporte.fecha
                                          );
                                        }}
                                        className="text-indigo-600 hover:text-indigo-900"
                                      >
                                        Editar
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-lg">Selecciona una filial y un programa para ver su programación</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Formulario de Reporte (Modal) */}
      <ReporteForm 
        mostrar={mostrarFormulario}
        transmisionEditar={transmisionEditar}
        reporteActual={reporteActual}
        onClose={() => setMostrarFormulario(false)}
        onGuardar={guardarFormulario}
        guardando={guardando}
        error={error}
      />
    </div>
  );
}