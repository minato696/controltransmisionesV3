'use client';

import { TransmisionEditar } from './types';

interface InformacionTransmisionProps {
  transmision: TransmisionEditar;
}

export default function InformacionTransmision({ transmision }: InformacionTransmisionProps) {
  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <div className="text-sm text-gray-700">
        <span className="font-medium">Filial:</span> {transmision.filial}
      </div>
      <div className="text-sm text-gray-700">
        <span className="font-medium">Programa:</span> {transmision.programa}
      </div>
      <div className="text-sm text-gray-700">
        <span className="font-medium">Día:</span> {transmision.dia}
      </div>
      <div className="text-sm text-gray-700">
        <span className="font-medium">Fecha:</span> {transmision.fecha}
      </div>
      <div className="text-sm text-gray-700">
        <span className="font-medium">Hora programada:</span> {transmision.hora}
      </div>
    </div>
  );
}