'use client';

import React from 'react';

interface HeaderProps {
  vdot: number;
  fiveKmFormatted: string;
  rightSlot?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ rightSlot }) => {
  return (
    <header className="pb-3 border-b border-[#16232c]">
      {/* Top Bar: Title on Left + User Account Bar on Top-Right */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Calculadora de Ritmos de Running
          </h1>
          <p className="text-xs sm:text-sm text-[#8ca4b4] max-w-2xl leading-relaxed">
            Descubrí a qué ritmo exacto correr tus trotes suaves, fondos, series de velocidad y carreras según tu estado físico actual.
          </p>
        </div>

        {rightSlot && <div className="shrink-0 lg:pt-0">{rightSlot}</div>}
      </div>
    </header>
  );
};
