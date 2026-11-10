'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ExternalLink,
  Sparkles,
  Layers,
  Flame,
  ShieldCheck,
  Mountain,
  ShoppingBag,
  Watch,
  Droplets,
  Zap,
  Search,
  Filter,
  RefreshCw,
  Tag,
} from 'lucide-react';
import {
  GEAR_CATALOG,
  GearItem,
  GearType,
  GearCategory,
  loadGearCatalogFromCloud,
} from '@/lib/gearData';
import { TerrainType, formatTime } from '@/lib/calculator';

type ShoeCategoryFilter = GearCategory | 'todas' | 'hibridas';

interface GearAdvisorProps {
  fiveKmSeconds: number;
  terrainType: TerrainType;
}

export const GearAdvisor: React.FC<GearAdvisorProps> = ({ fiveKmSeconds, terrainType }) => {
  const isTrailTerrain = terrainType !== 'calle';
  const [items, setItems] = useState<GearItem[]>(GEAR_CATALOG);
  const [loadingCloud, setLoadingCloud] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);

  // Filters
  const [selectedType, setSelectedType] = useState<GearType | 'todos'>('todos');
  const [selectedShoeCategory, setSelectedShoeCategory] = useState<ShoeCategoryFilter>(
    isTrailTerrain ? 'trail' : 'todas'
  );
  const [selectedBrand, setSelectedBrand] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Auto-switch shoe category if trail terrain is selected
  useEffect(() => {
    if (isTrailTerrain && selectedType === 'zapatillas') {
      setSelectedShoeCategory('trail');
    }
  }, [isTrailTerrain, selectedType]);

  // Load from Cloud Firestore on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchCloudGear() {
      setLoadingCloud(true);
      try {
        const cloudData = await loadGearCatalogFromCloud();
        if (isMounted) {
          setItems(cloudData);
          if (cloudData.length > GEAR_CATALOG.length) {
            setCloudSynced(true);
          }
        }
      } catch (err) {
        // Fall back gracefully
      } finally {
        if (isMounted) setLoadingCloud(false);
      }
    }
    fetchCloudGear();
    return () => {
      isMounted = false;
    };
  }, []);

  // Approximate personalized pace targets
  const easyPaceSec = Math.round((fiveKmSeconds / 5) * 1.25);
  const rep1kPaceSec = Math.round((fiveKmSeconds / 5) * 0.96);
  const racePaceSec = Math.round((fiveKmSeconds / 5) * 1.05);

  // Available brands in the current items
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    items.forEach((item) => {
      if (item.brand && item.brand !== 'Nutrición Deportiva') {
        brands.add(item.brand);
      }
    });
    return Array.from(brands).sort();
  }, [items]);

  // Category counts respecting current brand filter
  const categoryCounts = useMemo(() => {
    const base = items.filter((item) => {
      if (selectedBrand !== 'todas' && item.brand !== selectedBrand) return false;
      if (item.gearType !== 'zapatillas') return false;
      return true;
    });
    return {
      todas: base.length,
      hibridas: base.filter((i) => i.isHybrid).length,
      rodaje: base.filter((i) => i.category === 'rodaje').length,
      series: base.filter((i) => i.category === 'series').length,
      carrera: base.filter((i) => i.category === 'carrera').length,
      trail: base.filter((i) => i.category === 'trail').length,
    };
  }, [items, selectedBrand]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    const hasSearch = searchQuery.trim().length > 0;

    return items.filter((item) => {
      // Type filter
      if (selectedType !== 'todos' && item.gearType !== selectedType) {
        return false;
      }

      // Brand filter
      if (selectedBrand !== 'todas' && item.brand !== selectedBrand) {
        return false;
      }

      // Shoe Category filter (active when user is not doing an explicit text search)
      if (!hasSearch && (selectedType === 'zapatillas' || selectedType === 'todos')) {
        if (selectedShoeCategory === 'hibridas') {
          if (!item.isHybrid) return false;
        } else if (selectedShoeCategory !== 'todas' && item.category !== selectedShoeCategory) {
          return false;
        }
      }

      // Text Search query (searches across model, brand, tagline, description, ideal distances)
      if (hasSearch) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchBrand = item.brand.toLowerCase().includes(q);
        const matchTagline = item.tagline.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchIdeal = item.idealDistances.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchTagline && !matchDesc && !matchIdeal) {
          return false;
        }
      }

      return true;
    });
  }, [items, selectedType, selectedShoeCategory, selectedBrand, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Top Banner / Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0c141a] border border-[#182832] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00df89]/15 border border-[#00df89]/30 flex items-center justify-center text-[#00df89] shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Equipo y Zapatillas para Running
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#00df89]/10 text-[#00df89] border border-[#00df89]/25 text-[10px] font-semibold">
                  {items.length} modelos
                </span>
                {cloudSynced && (
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/25 text-[10px] font-semibold">
                    Nube sincronizada
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7d98a8] mt-0.5">
                Recomendaciones seleccionadas para cada tipo de entrenamiento, distancia y terreno.
              </p>
            </div>
          </div>

          {/* Quick Stats or Refresh */}
          {loadingCloud && (
            <div className="flex items-center gap-1.5 text-xs text-[#00df89] animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Sincronizando catálogo...</span>
            </div>
          )}
        </div>

        {/* 1. Main Filter by Gear Type */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => {
              setSelectedType('todos');
              setSelectedShoeCategory('todas');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedType === 'todos'
                ? 'bg-[#00df89] text-[#051a11] shadow-md'
                : 'bg-[#101b22] text-[#8ca4b4] hover:text-white border border-[#192b37]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Todo el Equipo ({items.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('zapatillas')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedType === 'zapatillas'
                ? 'bg-[#00df89] text-[#051a11] shadow-md'
                : 'bg-[#101b22] text-[#8ca4b4] hover:text-white border border-[#192b37]'
            }`}
          >
            <span>👟 Zapatillas ({items.filter((i) => i.gearType === 'zapatillas').length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedType('relojes');
              setSelectedShoeCategory('todas');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedType === 'relojes'
                ? 'bg-[#00df89] text-[#051a11] shadow-md'
                : 'bg-[#101b22] text-[#8ca4b4] hover:text-white border border-[#192b37]'
            }`}
          >
            <Watch className="w-3.5 h-3.5" />
            <span>Relojes & Pulsómetros</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedType('hidratacion');
              setSelectedShoeCategory('todas');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedType === 'hidratacion'
                ? 'bg-[#00df89] text-[#051a11] shadow-md'
                : 'bg-[#101b22] text-[#8ca4b4] hover:text-white border border-[#192b37]'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Chalecos & Hidratación</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedType('nutricion');
              setSelectedShoeCategory('todas');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedType === 'nutricion'
                ? 'bg-[#00df89] text-[#051a11] shadow-md'
                : 'bg-[#101b22] text-[#8ca4b4] hover:text-white border border-[#192b37]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Nutrición & Geles</span>
          </button>
        </div>

        {/* 2. Shoe Sub-Categories (when Zapatillas or Todos is selected) */}
        {(selectedType === 'zapatillas' || selectedType === 'todos') && (
          <div className="pt-2 border-t border-[#14222b] flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#637d8e] shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Categoría:
            </span>

            <button
              type="button"
              onClick={() => setSelectedShoeCategory('todas')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedShoeCategory === 'todas'
                  ? 'bg-[#1e2f3a] text-white border border-[#00df89]/30'
                  : 'bg-[#0e161c] text-[#718a99] hover:text-white border border-[#16232c]'
              }`}
            >
              Todas las categorías ({categoryCounts.todas})
            </button>

            <button
              type="button"
              onClick={() => setSelectedShoeCategory('hibridas')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                selectedShoeCategory === 'hibridas'
                  ? 'bg-amber-400 text-[#0c141a] shadow-md shadow-amber-400/20'
                  : 'bg-[#131920] text-amber-300 hover:text-white border border-amber-400/35'
              }`}
            >
              <span>🌟 Híbridas / Todo en Uno</span>
              <span className="opacity-90 font-mono text-[10px]">({categoryCounts.hibridas})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedShoeCategory('rodaje')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                selectedShoeCategory === 'rodaje'
                  ? 'bg-[#00df89]/20 text-[#00df89] border border-[#00df89]/50 font-bold'
                  : 'bg-[#0e161c] text-[#718a99] hover:text-white border border-[#16232c]'
              }`}
            >
              <ShieldCheck className="w-3 h-3 text-[#00df89]" />
              <span>1. Rodajes y Fondo (~{formatTime(easyPaceSec)}/km)</span>
              <span className="opacity-70 font-mono text-[10px]">({categoryCounts.rodaje})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedShoeCategory('series')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                selectedShoeCategory === 'series'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 font-bold'
                  : 'bg-[#0e161c] text-[#718a99] hover:text-white border border-[#16232c]'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-400" />
              <span>2. Series y Pasadas (~{formatTime(rep1kPaceSec)}/km)</span>
              <span className="opacity-70 font-mono text-[10px]">({categoryCounts.series})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedShoeCategory('carrera')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                selectedShoeCategory === 'carrera'
                  ? 'bg-sky-400/20 text-sky-300 border border-sky-400/50 font-bold'
                  : 'bg-[#0e161c] text-[#718a99] hover:text-white border border-[#16232c]'
              }`}
            >
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>3. Competición / Placa (~{formatTime(racePaceSec)}/km)</span>
              <span className="opacity-70 font-mono text-[10px]">({categoryCounts.carrera})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedShoeCategory('trail')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                selectedShoeCategory === 'trail'
                  ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/50 font-bold'
                  : 'bg-[#0e161c] text-[#718a99] hover:text-white border border-[#16232c]'
              }`}
            >
              <Mountain className="w-3 h-3 text-emerald-400" />
              <span>4. Trail Running</span>
              <span className="opacity-70 font-mono text-[10px]">({categoryCounts.trail})</span>
            </button>
          </div>
        )}

        {/* 3. Search Bar + Brand Filter Bar */}
        <div className="pt-2 border-t border-[#14222b] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search box */}
          <div className="sm:col-span-7 relative">
            <Search className="w-4 h-4 text-[#597486] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por modelo, marca, espuma (ej. Adidas, Boston, Vaporfly, Garmin)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0e161c] border border-[#182832] text-xs text-white placeholder-[#546d7d] focus:outline-none focus:border-[#00df89]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#6e8a9c] hover:text-white px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Brand selector */}
          <div className="sm:col-span-5 flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-[#597486] shrink-0 hidden sm:inline" />
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              aria-label="Filtrar por marca"
              className="w-full px-3 py-2 rounded-xl bg-[#0e161c] border border-[#182832] text-xs text-white focus:outline-none focus:border-[#00df89] cursor-pointer"
            >
              <option value="todas">Todas las marcas ({availableBrands.length})</option>
              {availableBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-xs text-[#7390a1]">
        <span>
          Mostrando <strong className="text-white">{filteredItems.length}</strong> de{' '}
          {items.length} productos
        </span>
        {(selectedType !== 'todos' ||
          selectedShoeCategory !== 'todas' ||
          selectedBrand !== 'todas' ||
          searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setSelectedType('todos');
              setSelectedShoeCategory('todas');
              setSelectedBrand('todas');
              setSearchQuery('');
            }}
            className="text-[#00df89] hover:underline cursor-pointer"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Gear Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#0c141a] border border-[#182832] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#14232c] flex items-center justify-center text-[#7390a1] mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white">No se encontraron productos</h4>
          <p className="text-xs text-[#718b9c] max-w-sm mx-auto">
            No hay elementos que coincidan con la búsqueda &quot;{searchQuery}&quot; o los filtros seleccionados.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedType('todos');
              setSelectedShoeCategory('todas');
              setSelectedBrand('todas');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-[#00df89] text-[#051a11] text-xs font-bold hover:bg-[#00f395] transition-all cursor-pointer"
          >
            Ver todo el catálogo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-[#0c141a] border border-[#182832] hover:border-[#223949] transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                {/* Top Bar: Brand + Category Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#7390a1]">
                    {item.brand}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {item.isHybrid && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/35 flex items-center gap-1">
                        <span>🌟</span>
                        <span>Híbrida</span>
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${item.badgeColor}`}
                    >
                      {item.categoryLabel}
                    </span>
                  </div>
                </div>

                {/* Model Name & Tagline */}
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white tracking-tight">{item.name}</h4>
                  <p className="text-xs text-[#00df89] font-medium">{item.tagline}</p>
                  {item.hybridLabel && (
                    <div className="text-[11px] text-amber-300 font-medium flex items-center gap-1.5 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/25 w-fit">
                      <span>🌟</span>
                      <span>{item.hybridLabel}</span>
                    </div>
                  )}
                </div>

                {/* Technical Specs Tags (Drop, Weight, Cushion, Plate) */}
                {(item.dropMm !== undefined ||
                  item.weightGrams !== undefined ||
                  item.cushionLevel ||
                  item.plateType) && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono">
                    {item.dropMm !== undefined && (
                      <span className="px-2 py-0.5 rounded bg-[#131f28] text-[#9bb5c5] border border-white/5">
                        Drop {item.dropMm}mm
                      </span>
                    )}
                    {item.weightGrams !== undefined && (
                      <span className="px-2 py-0.5 rounded bg-[#131f28] text-[#9bb5c5] border border-white/5">
                        ~{item.weightGrams}g
                      </span>
                    )}
                    {item.cushionLevel && (
                      <span className="px-2 py-0.5 rounded bg-[#131f28] text-[#9bb5c5] border border-white/5">
                        {item.cushionLevel}
                      </span>
                    )}
                    {item.plateType && (
                      <span
                        className={`px-2 py-0.5 rounded border text-[10px] ${
                          item.plateType.includes('Carbono')
                            ? 'bg-sky-500/10 text-sky-300 border-sky-500/30 font-semibold'
                            : 'bg-white/5 text-[#8ca4b4] border-white/10'
                        }`}
                      >
                        {item.plateType}
                      </span>
                    )}
                  </div>
                )}

                {/* Description */}
                <p className="text-xs text-[#8ca4b4] leading-relaxed pt-1">
                  {item.description}
                </p>

                {/* Recommended context */}
                <div className="text-[11px] text-[#698495] pt-1 border-t border-[#15232d] space-y-0.5">
                  <div>
                    <strong className="text-[#9cb4c3]">Ideal para:</strong> {item.idealDistances}
                  </div>
                  {item.paceTarget && (
                    <div>
                      <strong className="text-[#9cb4c3]">Rango de ritmos:</strong> {item.paceTarget}
                    </div>
                  )}
                </div>
              </div>

              {/* Buy / Search Button */}
              <div className="pt-2">
                <a
                  href={item.searchUrl}
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
      )}

      {/* Educational Note about Gear & Shoe Rotation */}
      <div className="p-4 rounded-xl bg-[#091014] border border-[#172630] text-xs text-[#7390a1] space-y-2 leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-white">
          <Layers className="w-4 h-4 text-[#00df89]" />
          <span>Estrategia de rotación y zapatillas híbridas</span>
        </div>
        <p>
          Alternar entre un modelo de <strong className="text-white">rodaje amortiguado</strong> (para el 80% de trotes suaves en Z2) y uno <strong className="text-white">ligero/reactivo</strong> (para pasadas y carreras) reduce hasta un <strong className="text-[#00df89]">39% el riesgo de lesiones</strong> por sobreuso al variar el impacto articular.
        </p>
        <p className="pt-1 border-t border-white/5 text-[#8fa7b7]">
          🌟 <strong className="text-amber-300">¿Buscás tener un solo par para todo?</strong> Los modelos marcados como <strong className="text-white">🌟 Híbridas / Todo en Uno</strong> (como <em>Adizero EVO SL</em>, <em>Novablast 4</em>, <em>Boston 12</em>, <em>Endorphin Speed 4</em> o <em>Pegasus Trail 5</em>) combinan amortiguación suave para rodajes con espumas vivas o suelas mixtas para responder tanto en trotes lentos como en series, carreras y senderos.
        </p>
      </div>
    </div>
  );
};
