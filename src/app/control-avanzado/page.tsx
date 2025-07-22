'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  getFilialesTransformadas,
  getProgramasTransformados,
  getReportesPorFechas,
} from '@/services/api-client';
import { 
  ESTADOS_TRANSMISION, 
  normalizarDiaSemana 
} from '@/components/transmisiones/constants';
import CalendarioTransmisiones, { 
  Programa, 
  Reporte 
} from '@/components/transmisiones/CalendarioTransmisiones';

export default function ControlTransmisionesAvanzado() {
  // Estados principales
  const [filiales, setFiliales] = useState<any[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [filialSeleccionada, setFilialSeleccionada] = useState<number | null>(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  // Inicializar fechas para el mes actual
  useEffect(() => {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    const formatearFecha = (fecha: Date) => {
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setFechaInicio(formatearFecha(inicioMes));
    setFechaFin(formatearFecha(finMes));
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Cargar reportes cuando cambie la selección
  useEffect(() => {
    if (filialSeleccionada && fechaInicio && fechaFin) {
      cargarReportes();
    }
  }, [filialSeleccionada, fechaInicio, fechaFin]);

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
      const filialesConvertidas = filialesData.map(f => ({
        ...f,
        isActivo: f.isActivo ?? f.activa
      }));
      
      const programasConvertidos = programasData.map(p => ({
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
      if (!fechaInicio || !fechaFin) return;
      
      const reportesData = await getReportesPorFechas(fechaInicio, fechaFin);
      setReportes(reportesData);
    } catch (err) {
      console.error('Error al cargar reportes:', err);
    }
  };

  // Obtener programas de la filial seleccionada
  const getProgramasDeFilial = () => {
    if (!filialSeleccionada) return [];
    
    return programas.filter(p => {
      // Verificar si el programa está asociado a la filial
      if (p.filialesIds && p.filialesIds.length > 0) {
        return p.filialesIds.includes(filialSeleccionada);
      }
      return Number(p.filialId) === filialSeleccionada;
    });
  };

  // Manejar cambio de filial
  const handleFilialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const filialId = Number(e.target.value);
    setFilialSeleccionada(filialId);
  };

  // Abrir formulario (redirección a página separada)
  const abrirFormulario = (fecha: string, programaId: number, filialId: number) => {
    // Redirigir a la página de reportes
    router.push(`/reportes/${filialId}/${programaId}/${fecha}`);
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

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* Barra superior con opciones de navegación */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 flex items-center justify-between shadow-md">
        <div className="flex items-center text-lg font-semibold">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Control de Transmisiones</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link 
            href="/" 
            className="px-4 py-1.5 bg-white text-blue-700 rounded-md font-medium hover:bg-blue-50 transition-colors shadow-sm text-sm"
          >
            Vista Simple
          </Link>
          <Link 
            href="/reportes/semanales" 
            className="px-4 py-1.5 bg-white text-blue-700 rounded-md font-medium hover:bg-blue-50 transition-colors shadow-sm text-sm"
          >
            Reportes Semanales
          </Link>
        </div>
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

      {/* Contenedor principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Menú de filiales */}
        <div className="w-64 bg-white shadow-md z-10 overflow-y-auto">
          <div className="py-4 px-6 text-lg font-bold text-gray-800 border-b border-gray-100">
            Filiales
          </div>
          <div className="py-2">
            {filiales.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                <p className="text-sm">No hay filiales disponibles</p>
              </div>
            ) : (
              filiales.map((filial) => (
                <div
                  key={filial.id}
                  className={`flex justify-between px-6 py-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                    filialSeleccionada === Number(filial.id) ? "bg-blue-50 border-l-4 border-blue-600 font-medium" : ""
                  }`}
                  onClick={() => setFilialSeleccionada(Number(filial.id))}
                >
                  <div className={filialSeleccionada === Number(filial.id) ? "text-blue-700" : "text-gray-700"}>
                    {filial.nombre}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 p-6 overflow-auto">
          {filialSeleccionada ? (
            <>
              <h1 className="text-2xl font-bold text-gray-800 mb-6">
                {filiales.find(f => Number(f.id) === filialSeleccionada)?.nombre || "Filial seleccionada"}
              </h1>
              
              <CalendarioTransmisiones 
                filialId={filialSeleccionada}
                programas={getProgramasDeFilial()}
                reportes={reportes}
                onFechaClick={abrirFormulario}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-lg">Selecciona una filial para ver su programación</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}