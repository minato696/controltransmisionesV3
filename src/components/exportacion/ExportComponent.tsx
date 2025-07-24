import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Reporte, Filial, Programa } from '@/components/transmisiones/types';

// Interfaz para las propiedades del componente
interface ExportComponentProps {
  reportes: Reporte[];
  filiales: Filial[];
  programas: Programa[];
  fechaInicio: Date;
  fechaFin: Date;
  filialSeleccionada: number | null;
  modoDetallado?: boolean;
}

// Interfaz para las estadísticas
interface StatsType {
  total: number;
  exitosas: number;
  noTransmitidas: number;
  tardias: number;
  pendientes: number;
  efectividad: number;
}

// Interfaz para el día del calendario
interface DiaCalendario {
  fecha: string;
  diaSemana: string;
  diaCorto: string;
}

// Programa con hora formateada para ordenamiento
interface ProgramaConHora extends Programa {
  horaFormateada: number;
}

// Componente para exportar reportes de transmisiones
export default function ExportComponent({ 
  reportes, 
  filiales, 
  programas, 
  fechaInicio, 
  fechaFin,
  filialSeleccionada,
  modoDetallado = false
}: ExportComponentProps) {
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [exportType, setExportType] = useState<'resumen' | 'filial' | 'detallado'>('resumen');
  const [selectedFilial, setSelectedFilial] = useState<string>(filialSeleccionada?.toString() || '');
  const [stats, setStats] = useState<StatsType>({
    total: 0,
    exitosas: 0,
    noTransmitidas: 0,
    tardias: 0,
    pendientes: 0,
    efectividad: 0
  });

  // Calcular estadísticas cuando cambian los reportes
  useEffect(() => {
    if (reportes && reportes.length > 0) {
      const filialesActivas = filialSeleccionada ? [filialSeleccionada] : 
        (selectedFilial ? [parseInt(selectedFilial)] : filiales.map((f: Filial) => Number(f.id)));
      
      // Filtrar reportes por filial seleccionada
      const reportesFiltrados = reportes.filter((r: Reporte) => 
        filialesActivas.includes(r.filialId)
      );
      
      // Calcular estadísticas
      const total = reportesFiltrados.length;
      const exitosas = reportesFiltrados.filter((r: Reporte) => r.estado === 'si').length;
      const noTransmitidas = reportesFiltrados.filter((r: Reporte) => r.estado === 'no').length;
      const tardias = reportesFiltrados.filter((r: Reporte) => r.estado === 'tarde').length;
      const pendientes = reportesFiltrados.filter((r: Reporte) => !r.estado || r.estado === 'pendiente').length;
      const efectividad = total > 0 ? Math.round((exitosas / total) * 100) : 0;
      
      setStats({
        total,
        exitosas,
        noTransmitidas,
        tardias,
        pendientes,
        efectividad
      });
    }
  }, [reportes, filiales, filialSeleccionada, selectedFilial]);

  // Función para convertir una hora en formato HH:MM a un número para ordenar
  const convertirHoraANumero = (hora: string): number => {
    if (!hora) return 24*60; // Si no hay hora, ponerlo al final
    
    const partes = hora.split(':');
    if (partes.length !== 2) return 24*60;
    
    const horas = parseInt(partes[0], 10);
    const minutos = parseInt(partes[1], 10);
    
    return horas * 60 + minutos;
  };

  // Función para generar HTML para imprimir - con mejoras para incluir todos los programas
  const generatePrintHTML = (): string => {
    // Generar días entre fechaInicio y fechaFin
    const dias: DiaCalendario[] = [];
    let currentDate = new Date(fechaInicio);
    
    while (currentDate <= fechaFin) {
      dias.push({
        fecha: format(currentDate, 'yyyy-MM-dd'),
        diaSemana: format(currentDate, 'EEEE', { locale: es }).toUpperCase(),
        diaCorto: format(currentDate, 'dd/MM')
      });
      currentDate = addDays(currentDate, 1);
    }
    
    // Filtrar reportes por filial si es necesario
    const filteredReportes = selectedFilial && exportType === 'filial' ? 
      reportes.filter((r: Reporte) => r.filialId === parseInt(selectedFilial)) : reportes;
    
    // Obtener filiales para mostrar
    const filialesToShow = selectedFilial && exportType === 'filial' ? 
      filiales.filter((f: Filial) => Number(f.id) === parseInt(selectedFilial)) : filiales;
    
    // Generar la tabla de ciudades y días
    let tableContent = '';
    
    // Modo detallado - muestra todas las filiales y sus programas
    if (exportType === 'detallado' || modoDetallado) {
      filialesToShow.forEach((filial: Filial) => {
        // Obtener programas para esta filial
        let programasFilial = programas.filter((p: Programa) => {
          // Verificar si el programa está asociado a la filial
          return p.filialesIds?.includes(Number(filial.id)) || 
                Number(p.filialId) === Number(filial.id);
        });
        
        // Agregar la hora formateada para ordenar
        const programasConHora: ProgramaConHora[] = programasFilial.map(programa => {
          const horaStr = programa.horario || programa.horaInicio || '23:59';
          return {
            ...programa,
            horaFormateada: convertirHoraANumero(horaStr)
          };
        });
        
        // Ordenar programas por hora (de menor a mayor)
        programasConHora.sort((a, b) => a.horaFormateada - b.horaFormateada);
        
        if (programasConHora.length > 0) {
          // Encabezado de la filial
          tableContent += `
            <tr class="filial-header">
              <td colspan="${dias.length + 1}" class="filial-name">${filial.nombre}</td>
            </tr>
          `;
          
          // Programas de la filial (ya ordenados por hora)
          programasConHora.forEach((programa: ProgramaConHora) => {
            tableContent += `
              <tr>
                <td class="programa-name">
                  <div class="programa-info">
                    <div class="programa-title">${programa.nombre}</div>
                    <div class="programa-hour">${programa.horario || programa.horaInicio || ''}</div>
                  </div>
                </td>
            `;
            
            // Para cada día, verificar si hay reporte
            dias.forEach((dia: DiaCalendario) => {
              // Verificar si el programa transmite ese día
              const transmiteEnDia = programa.diasSemana?.some((d: string) => {
                const diaNormalizado = d.toUpperCase().replace('É', 'E').replace('Á', 'A');
                const diaSemanaNormalizado = dia.diaSemana.replace('É', 'E').replace('Á', 'A');
                return diaNormalizado === diaSemanaNormalizado;
              });
              
              if (!transmiteEnDia) {
                tableContent += `<td class="no-programado">-</td>`;
              } else {
                // Buscar reporte para esta combinación
                const reporte = filteredReportes.find((r: Reporte) => 
                  r.filialId === Number(filial.id) && 
                  r.programaId === Number(programa.id) && 
                  r.fecha === dia.fecha
                );
                
                if (!reporte || !reporte.estado) {
                  tableContent += `<td class="pendiente">-</td>`;
                } else if (reporte.estado === 'si') {
                  tableContent += `<td class="transmitio">✓</td>`;
                } else if (reporte.estado === 'no') {
                  const target = reporte.target || 'Fta';
                  tableContent += `<td class="no-transmitio">✕<br>${target}</td>`;
                } else if (reporte.estado === 'tarde') {
                  const target = reporte.target || 'Tde';
                  tableContent += `<td class="tarde">⏰<br>${target}</td>`;
                }
              }
            });
            
            tableContent += `</tr>`;
          });
        }
      });
    } else {
      // Modo resumen - solo muestra las filiales
      filialesToShow.forEach((filial: Filial) => {
        tableContent += `
          <tr>
            <td>${filial.nombre}</td>
            ${dias.map((dia: DiaCalendario) => {
              // Buscar reportes para esta filial y día
              const reportesDia = filteredReportes.filter((r: Reporte) => 
                r.filialId === Number(filial.id) && r.fecha === dia.fecha
              );
              
              if (reportesDia.length === 0) {
                return '<td>-</td>';
              }
              
              // Consolidar el estado de todos los reportes
              let symbol = '';
              let additionalClass = '';
              let additionalText = '';
              
              // Priorizar: si hay al menos uno "no transmitió", mostrar ✗
              // Si todos son "si transmitió", mostrar ✓
              // Si hay alguno "tarde", mostrar ⏰
              if (reportesDia.some((r: Reporte) => r.estado === 'no')) {
                symbol = '✗';
                additionalClass = 'no-transmitio';
                const motivo = reportesDia.find((r: Reporte) => r.estado === 'no')?.target || 'Fta';
                additionalText = motivo;
              } else if (reportesDia.every((r: Reporte) => r.estado === 'si')) {
                symbol = '✓';
                additionalClass = 'transmitio';
                additionalText = '';
              } else if (reportesDia.some((r: Reporte) => r.estado === 'tarde')) {
                symbol = '⏰';
                additionalClass = 'tarde';
                additionalText = 'Tde';
              }
              
              return `<td class="${additionalClass}">${symbol}${additionalText ? '<br>' + additionalText : ''}</td>`;
            }).join('')}
          </tr>
        `;
      });
    }
    
    // Generar tabla de motivos
    let motivosRows = '';
    
    // Filtrar reportes con motivos
    const reportesConMotivos = filteredReportes.filter((r: Reporte) => 
      (r.estado === 'no' || r.estado === 'tarde') && (r.motivo || r.target)
    );
    
    reportesConMotivos.forEach((reporte: Reporte) => {
      const filial = filiales.find((f: Filial) => Number(f.id) === reporte.filialId);
      const programa = programas.find((p: Programa) => Number(p.id) === reporte.programaId);
      const fechaFormateada = format(new Date(reporte.fecha), 'dd/MM/yyyy');
      const diaSemana = format(new Date(reporte.fecha), 'EEEE', { locale: es });
      const estado = reporte.estado === 'no' ? 'No transmitió' : 'Transmitió Tarde';
      const motivo = reporte.motivo || reporte.target || 'No especificado';
      
      motivosRows += `
        <tr>
          <td>${filial?.nombre || 'Desconocida'}</td>
          <td>${fechaFormateada} (${diaSemana})</td>
          <td>${programa?.nombre || 'Desconocido'}</td>
          <td>${estado}</td>
          <td>${motivo}</td>
        </tr>
      `;
    });
    
    // Construir el HTML completo
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Control de Transmisiones - ${format(fechaInicio, 'dd/MM/yyyy')} al ${format(fechaFin, 'dd/MM/yyyy')}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
            background-color: #fff;
          }
          h1 {
            text-align: center;
            color: #003366;
            margin-bottom: 5px;
            font-size: 24px;
          }
          h2 {
            text-align: center;
            color: #003366;
            margin-top: 0;
            font-size: 16px;
          }
          .periodo {
            text-align: center;
            margin-bottom: 20px;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
            vertical-align: middle;
          }
          th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          .filial-header td {
            background-color: #e9f0f8;
            font-weight: bold;
            text-align: left;
            padding: 10px;
            font-size: 16px;
            color: #003366;
          }
          .programa-name {
            text-align: left;
            padding-left: 20px;
            min-width: 200px;
          }
          .programa-info {
            display: flex;
            flex-direction: column;
          }
          .programa-title {
            font-weight: bold;
          }
          .programa-hour {
            font-size: 12px;
            color: #666;
          }
          .stats {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
            flex-wrap: wrap;
          }
          .stat-box {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: center;
            margin: 5px;
            flex: 1;
            min-width: 120px;
            background-color: #f9f9f9;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #003366;
          }
          .stat-label {
            font-size: 12px;
            color: #666;
          }
          .transmitio {
            background-color: #d4edda;
            color: #155724;
          }
          .no-transmitio {
            background-color: #f8d7da;
            color: #721c24;
          }
          .tarde {
            background-color: #fff3cd;
            color: #856404;
          }
          .pendiente {
            background-color: #e2e3e5;
            color: #383d41;
          }
          .no-programado {
            background-color: #ffffff;
            color: #999;
          }
          .motivos-title {
            margin-top: 30px;
            font-size: 18px;
            color: #003366;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #777;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
          .btn-print {
            padding: 8px 15px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            margin-right: 10px;
          }
          .btn-close {
            padding: 8px 15px;
            background-color: #6c757d;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          }
          .btn-container {
            text-align: center;
            margin-bottom: 20px;
          }
          @media print {
            body {
              margin: 0;
              padding: 10px;
            }
            .no-print {
              display: none;
            }
            table {
              page-break-inside: avoid;
            }
            .stat-box {
              background-color: #f9f9f9 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .transmitio {
              background-color: #d4edda !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-transmitio {
              background-color: #f8d7da !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .tarde {
              background-color: #fff3cd !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .pendiente {
              background-color: #e2e3e5 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .filial-header td {
              background-color: #e9f0f8 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print btn-container">
          <button class="btn-print" onclick="window.print()">Imprimir Reporte</button>
          <button class="btn-close" onclick="window.close()">Cerrar</button>
        </div>
        
        <h1>CONTROL DE TRANSMISIONES EXITOSA - PERÚ</h1>
        <h2>${exportType === 'filial' ? filiales.find((f: Filial) => Number(f.id) === parseInt(selectedFilial))?.nombre : 'Todas las filiales'}</h2>
        <div class="periodo">
          Período: ${format(fechaInicio, 'dd/MM/yyyy')} al ${format(fechaFin, 'dd/MM/yyyy')}
          <br>
          Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}
        </div>
        
        <table>
          <thead>
            <tr>
              <th>${exportType === 'detallado' || modoDetallado ? 'Filial / Programa' : 'Ciudad'}</th>
              ${dias.map((dia: DiaCalendario) => `<th>${dia.diaSemana.slice(0, 3)}<br>${dia.diaCorto}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${tableContent}
          </tbody>
        </table>
        
        <h3>Estadísticas del Período ${exportType === 'filial' ? '(Filial Seleccionada)' : '(Todas las Filiales)'}</h3>
        <div class="stats">
          <div class="stat-box">
            <div class="stat-value">${stats.total}</div>
            <div class="stat-label">Total Programadas</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${stats.exitosas}</div>
            <div class="stat-label">Exitosas</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${stats.noTransmitidas}</div>
            <div class="stat-label">No Transmitidas</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${stats.tardias}</div>
            <div class="stat-label">Tardías</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${stats.pendientes}</div>
            <div class="stat-label">Pendientes</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${stats.efectividad}%</div>
            <div class="stat-label">Efectividad</div>
          </div>
        </div>
        
        <h3 class="motivos-title">Motivos</h3>
        <table>
          <thead>
            <tr>
              <th>Ciudad</th>
              <th>Fecha</th>
              <th>Programa</th>
              <th>Estado</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            ${motivosRows || '<tr><td colspan="5">No hay motivos registrados en este período</td></tr>'}
          </tbody>
        </table>
        
        <div class="footer">
          Sistema de Control de Transmisiones EXITOSA - Generado automáticamente
          ${exportType === 'detallado' || modoDetallado ? '<br>Reporte Detallado con todos los programas' : ''}
        </div>
      </body>
      </html>
    `;
    
    return html;
  };

  // Función para exportar a PDF
  const handleExport = () => {
    setExportStatus('loading');
    
    try {
      // Si estamos en modo modoDetallado, forzar el tipo a 'detallado'
      if (modoDetallado) {
        setExportType('detallado');
      }
      
      // Generar HTML
      const html = generatePrintHTML();
      
      // Abrir una nueva ventana con el HTML
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        
        // Imprimir automáticamente (opcional)
        // printWindow.print();
        
        setExportStatus('success');
      } else {
        throw new Error('No se pudo abrir la ventana de impresión.');
      }
    } catch (error) {
      console.error('Error al exportar:', error);
      setExportStatus('error');
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Exportar
      </button>

      {/* Modal de exportación */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-full mx-4 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Exportar Reporte</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Reporte
              </label>
              <div className="flex space-x-2">
                <button
                  className={`flex-1 py-2 px-3 rounded-md ${
                    exportType === 'resumen'
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                  onClick={() => setExportType('resumen')}
                >
                  Resumen General
                </button>
                <button
                  className={`flex-1 py-2 px-3 rounded-md ${
                    exportType === 'filial'
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                  onClick={() => setExportType('filial')}
                >
                  Por Filial
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nivel de Detalle
              </label>
              <div className="flex space-x-2">
                <button
                  className={`flex-1 py-2 px-3 rounded-md ${
                    exportType === 'detallado' || modoDetallado
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                  onClick={() => setExportType('detallado')}
                >
                  Con todos los programas
                </button>
              </div>
            </div>

            {exportType === 'filial' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seleccionar Filial
                </label>
                <select
                  value={selectedFilial}
                  onChange={(e) => setSelectedFilial(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecciona una filial</option>
                  {filiales.map((filial: Filial) => (
                    <option key={filial.id} value={filial.id}>
                      {filial.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="bg-gray-50 border rounded-md p-3 mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Información del reporte:</h4>
              <p className="text-sm text-gray-600">
                Período: {format(fechaInicio, 'dd/MM/yyyy')} al {format(fechaFin, 'dd/MM/yyyy')}
              </p>
              <p className="text-sm text-gray-600">
                {exportType === 'filial' 
                  ? `Filial: ${selectedFilial ? filiales.find((f: Filial) => Number(f.id) === parseInt(selectedFilial))?.nombre : 'No seleccionada'}`
                  : 'Todas las filiales'}
              </p>
              <p className="text-sm text-gray-600">
                Nivel de detalle: {exportType === 'detallado' || modoDetallado ? 'Con todos los programas' : 'Resumen por filial'}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleExport}
                disabled={exportStatus === 'loading' || (exportType === 'filial' && !selectedFilial)}
                className={`py-2 px-4 rounded-md text-white ${
                  exportStatus === 'loading' || (exportType === 'filial' && !selectedFilial)
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } flex items-center`}
              >
                {exportStatus === 'loading' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generando...
                  </>
                ) : (
                  'Exportar Reporte'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}