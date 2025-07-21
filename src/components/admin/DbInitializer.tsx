'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function DbInitializer() {
  const [status, setStatus] = useState<'loading' | 'initialized' | 'error' | 'not-initialized'>('loading');
  const [message, setMessage] = useState<string>('Comprobando estado de la base de datos...');
  const [initializing, setInitializing] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);

  // Verificar el estado de inicialización al cargar
  useEffect(() => {
    checkDbStatus();
  }, []);

  // Función para verificar el estado de la base de datos
  const checkDbStatus = async () => {
    try {
      setStatus('loading');
      setMessage('Comprobando estado de la base de datos...');
      
      // Verificar si existen los días de la semana
      const response = await axios.get('/api/debug');
      
      if (response.data.diasSemana && response.data.diasSemana.length > 0) {
        setStatus('initialized');
        setMessage('La base de datos está inicializada correctamente.');
        setData(response.data);
      } else {
        setStatus('not-initialized');
        setMessage('La base de datos no está inicializada. Se requiere ejecutar el seed.');
      }
    } catch (error) {
      console.error('Error al verificar estado:', error);
      setStatus('error');
      setMessage('Error al verificar el estado de la base de datos.');
    }
  };

  // Función para inicializar la base de datos
  const initializeDb = async () => {
    try {
      setInitializing(true);
      setMessage('Inicializando base de datos...');
      
      const response = await axios.get('/api/seed');
      
      if (response.data.success) {
        setStatus('initialized');
        setMessage('Base de datos inicializada correctamente.');
        setData(response.data.data);
      } else {
        setStatus('error');
        setMessage(`Error: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Error al inicializar:', error);
      setStatus('error');
      setMessage('Error al inicializar la base de datos.');
    } finally {
      setInitializing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Estado de la Base de Datos</h2>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          status === 'initialized' ? 'bg-green-100 text-green-800' : 
          status === 'not-initialized' ? 'bg-yellow-100 text-yellow-800' : 
          status === 'error' ? 'bg-red-100 text-red-800' : 
          'bg-gray-100 text-gray-800'
        }`}>
          {status === 'initialized' ? 'Inicializada' : 
           status === 'not-initialized' ? 'No Inicializada' : 
           status === 'error' ? 'Error' : 'Verificando'}
        </span>
      </div>
      
      <p className="text-sm text-gray-600">{message}</p>
      
      {data && status === 'initialized' && (
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded overflow-auto max-h-24">
          <div>Días de la semana: {data.diasSemana?.length || 0}</div>
          {data.estados && <div>Estados de transmisión: {data.estados.length}</div>}
          {data.targets && <div>Targets: {data.targets.length}</div>}
        </div>
      )}
      
      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={checkDbStatus}
          disabled={status === 'loading' || initializing}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Verificar Estado
        </button>
        
        {(status === 'not-initialized' || status === 'error') && (
          <button
            type="button"
            onClick={initializeDb}
            disabled={initializing}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {initializing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Inicializando...
              </>
            ) : (
              'Inicializar Base de Datos'
            )}
          </button>
        )}
      </div>
    </div>
  );
}