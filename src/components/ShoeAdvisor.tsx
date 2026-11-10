'use client';

import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  Flame,
  ShieldCheck,
  Mountain,
  ShoppingBag,
} from 'lucide-react';
import { SHOES_CATALOG, ShoeCategory, ShoeModel } from '@/lib/shoeData';
import { TerrainType, formatTime } from '@/lib/calculator';

interface ShoeAdvisorProps {
  fiveKmSeconds: number;
  terrainType: TerrainType;
}

export const ShoeAdvisor: React.FC<ShoeAdvisorProps> = ({ fiveKmSeconds, terrainType }) => {
  const isTrailTerrain = terrainType !== 'calle';
  const [selectedCategory, setSelectedCategory] = useState<ShoeCategory | 'todos'>(
    isTrailTerrain ? 'trail' : 'rodaje'
  );
  const [isOpen, setIsOpen] = useState(true);

  // Auto-switch to trail if user selects a trail terrain
  useEffect(() => {
    if (isTrailTerrain) {
      setSelectedCategory('trail');
    }
  }, [isTrailTerrain]);

  const easyPaceSec = Math.round((fiveKmSeconds / 5) * 1.25);
  const rep1kPaceSec = Math.round((fiveKmSeconds / 5) * 0.96);
  const racePaceSec = Math.round((fiveKmSeconds / 5) * 1.05);

  const filteredShoes =
    selectedCategory === 'todos'
      ? SHOES_CATALOG
      : SHOES_CATALOG.filter((s) => s.category === selectedCategory);

  return (
    <div className="rounded-2xl bg-[#0c141a] border border-[#182832] overflow-hidden text-white transition-all">
      {/* Header Bar with Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left hover:bg-[#101b23] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#00df89]/10 border border-[#00df89]/25 flex items-center justify-center text-[#00df89]">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">
                Zapatillas recomendadas para tus ritmos
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-[#00df89]/10 text-[#00df89] border border-[#00df89]/25 text-[10px] font-semibold">
                Guía de compra y rotación
              </span>
            </div>
            <p className="text-xs text-[#7390a1] mt-0.5">
              Modelos optimizados según el impacto y la velocidad de cada sesión
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#6e8a9c]">
          <span className="hidden sm:inline">{isOpen ? 'Plegar' : 'Ver zapatillas'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 sm:p-5 pt-1 space-y-4 border-t border-[#14222b]">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedCategory('rodaje')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'rodaje'
                  ? 'bg-[#00df89] text-[#051a11] shadow-md'
                  : 'bg-[#101b22] text-[#8ca4b4] hover:text-white border border-[#192b37]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>1. Rodajes y Fondo (~{formatTime(easyPaceSec)}/km)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('series')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'series'
                  ? 'bg-amber-400 text-[#171409] shadow-md'
                  : 'bg-[#101b22] text-[#8ca4b4] hover:text-white border border-[#192b37]'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>2. Series y Pasadas (~{formatTime(rep1kPaceSec)}/km)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('carrera')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'carrera'
                  ? 'bg-sky-400 text-[#071724] shadow-md'
                  : 'bg-[#101b22] text-[#8ca4b4] hover:text-white border border-[#192b37]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3. Competición / Placa (~{formatTime(racePaceSec)}/km)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('trail')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'trail'
                  ? 'bg-emerald-400 text-[#061c14] shadow-md'
                  : 'bg-[#101b22] text-[#8ca4b4] hover:text-white border border-[#192b37]'
              }`}
            >
              <Mountain className="w-3.5 h-3.5" />
              <span>4. Trail Running</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'todos'
                  ? 'bg-[#1f323f] text-white border border-[#00df89]/40'
                  : 'bg-[#101b22] text-[#718b9c] hover:text-white border border-[#192b37]'
              }`}
            >
              Ver todas ({SHOES_CATALOG.length})
            </button>
          </div>

          {/* Shoe Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredShoes.map((shoe) => (
              <div
                key={shoe.id}
                className="p-4 rounded-xl bg-[#0f1920] border border-[#192b37] hover:border-[#223949] transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  {/* Top Bar: Brand + Category Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#7390a1]">
                      {shoe.brand}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${shoe.badgeColor}`}
                    >
                      {shoe.categoryLabel}
                    </span>
                  </div>

                  {/* Model Name & Tagline */}
                  <div>
                    <h4 className="text-base font-bold text-white tracking-tight">{shoe.name}</h4>
                    <p className="text-xs text-[#00df89] font-medium mt-0.5">{shoe.tagline}</p>
                  </div>

                  {/* Technical Specs Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-[#15232d] text-[#9bb5c5] border border-white/5">
                      Drop {shoe.dropMm}mm
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#15232d] text-[#9bb5c5] border border-white/5">
                      ~{shoe.weightGrams}g
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#15232d] text-[#9bb5c5] border border-white/5">
                      {shoe.cushionLevel}
                    </span>
                    {shoe.plateType && (
                      <span
                        className={`px-2 py-0.5 rounded border text-[10px] ${
                          shoe.plateType.includes('Carbono')
                            ? 'bg-sky-500/10 text-sky-300 border-sky-500/30 font-semibold'
                            : 'bg-white/5 text-[#8ca4b4] border-white/10'
                        }`}
                      >
                        {shoe.plateType}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#8ca4b4] leading-relaxed pt-1">
                    {shoe.description}
                  </p>

                  {/* Recommended context */}
                  <div className="text-[11px] text-[#698495] pt-1 border-t border-[#15232d] space-y-0.5">
                    <div>
                      <strong className="text-[#9cb4c3]">Ideal para:</strong> {shoe.idealDistances}
                    </div>
                    <div>
                      <strong className="text-[#9cb4c3]">Rango de ritmos:</strong> {shoe.paceTarget}
                    </div>
                  </div>
                </div>

                {/* Buy / Search Button */}
                <div className="pt-2">
                  <a
                    href={shoe.searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#14232c] hover:bg-[#1a2e3a] active:scale-[0.98] text-[#00df89] hover:text-[#00f395] border border-[#00df89]/30 text-xs font-bold transition-all shadow-sm group"
                  >
                    <span>Ver precios y disponibilidad</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Educational Note about Shoe Rotation */}
          <div className="p-3.5 rounded-xl bg-[#091014] border border-[#172630] text-xs text-[#7390a1] space-y-1 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Layers className="w-4 h-4 text-[#00df89]" />
              <span>Por qué conviene tener al menos 2 pares (Rotación de zapatillas)</span>
            </div>
            <p>
              Estudios biomecánicos demuestran que alternar entre un modelo de <strong className="text-white">rodaje amortiguado</strong> (para el 80% de trotes suaves) y uno <strong className="text-white">ligero/reactivo</strong> (para pasadas y carreras) reduce hasta un <strong className="text-[#00df89]">39% el riesgo de lesiones</strong> por sobreuso muscular y alarga la vida útil de las espumas al dejarlas descomprimir 24-48h entre salidas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
