'use client';

interface BarraSuperiorProps {
  titulo: string;
}

export default function BarraSuperior({ titulo }: BarraSuperiorProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 flex items-center shadow-md">
      <div className="flex items-center text-lg font-semibold">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{titulo}</span>
      </div>
    </div>
  );
}