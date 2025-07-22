'use client';

export default function LeyendaEstados() {
  return (
    <div className="bg-white border-b border-gray-200 py-2 px-4 flex items-center space-x-6 text-sm">
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
  );
}