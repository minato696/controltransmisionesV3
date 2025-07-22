'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ReporteForm from '@/components/transmisiones/ReporteForm';
import { 
  getFilial, 
  getPrograma, 
  getReportesPorFechas 
} from '@/services/api-client';
import { TransmisionEditar, Reporte } from '@/components/transmisiones/types';

export default function ReportePage() {
  const params = useParams();
  const router = useRouter();
  
  const filialId = params.filialId as string;
  const programaId = params.programaId as string;
  const fecha = params.fecha as string;
  
  const [transmisionData, setTransmisionData] = useState<TransmisionEditar | null>(null);
  const [reporteActual, setReporteActual] = useState<Reporte | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos necesarios
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Obtener datos de filial, programa y reporte
        const [filialData, programaData] = await Promise.all([
          getFilial(filialId),
          getPrograma(programaId)
        ]);
        
        // Obtener el reporte existente (si existe)
        const reportesData = await getReportesPorFechas(fecha, fecha);
        const reporteExistente = reportesData.find(
          r => r.filialId === Number(filialId) && r.programaId === Number(programaId) && r.fecha === fecha
        ) || null;
        
        // Obtener el día de la semana
        const diaSemana = new Date(fecha).toLocaleDateString('es-ES', { weekday: 'long' });
        const diaNombre = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
        
        // Preparar datos para el formulario
        setTransmisionData({
          filialId: Number(filialId),
          programaId: Number(programaId),
          filial: filialData.nombre,
          programa: programaData.nombre,
          hora: programaData.horario || programaData.horaInicio || '',
          dia: diaNombre,
          fecha,
          reporteId: reporteExistente?.id_reporte
        });
        
        setReporteActual(reporteExistente);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('No se pudieron cargar los datos necesarios. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };
    
    loadData();
  }, [filialId, programaId, fecha]);

  const handleSuccess = () => {
    // Redirigir a la página principal después de guardar
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error || !transmisionData) {
    return (
      <div className="max-w-lg mx-auto py-8 px-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || 'No se encontraron los datos necesarios'}</p>
              <div className="mt-2">
                <button 
                  onClick={() => router.push('/')}
                  className="text-sm text-red-700 hover:underline"
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <ReporteForm 
    transmisionData={transmisionData} 
    reporteActual={reporteActual} 
    onSuccess={handleSuccess}
  />;
}