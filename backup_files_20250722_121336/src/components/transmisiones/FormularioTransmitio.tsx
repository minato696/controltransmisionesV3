'use client';

interface FormularioTransmitioProps {
  horaReal: string;
  onChange: (hora: string) => void;
  disabled: boolean;
}

/**
 * Componente de formulario para el estado "Sí transmitió"
 * Muestra el campo para ingresar la hora real de transmisión
 */
export default function FormularioTransmitio({ 
  horaReal, 
  onChange, 
  disabled 
}: FormularioTransmitioProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Hora real de transmisión
      </label>
      <input 
        type="time" 
        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        value={horaReal}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}