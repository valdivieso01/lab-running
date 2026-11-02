'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Check } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('SW registrado con éxito:', reg.scope);
          })
          .catch((err) => {
            console.warn('SW fallo al registrarse:', err);
          });
      });
    }

    // 2. Check if already installed (standalone mode)
    if (typeof window !== 'undefined') {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);

      // Check iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIosDevice);

      // 3. Listen to beforeinstallprompt event (Android / Chromium)
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSHint(true);
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  // If already installed or dismissed, don't show prompt
  if (isStandalone || dismissed) {
    return null;
  }

  // If not installable and not iOS, don't display
  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="p-3.5 rounded-2xl bg-[#0f171d] border border-[#00df89]/40 shadow-2xl shadow-[#000]/80 flex items-center justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00df89]/15 border border-[#00df89]/30 flex items-center justify-center text-[#00df89] shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                <span>INSTALAR EN TU CELULAR</span>
              </div>
              <div className="text-[11px] text-[#7190a2] leading-tight">
                Usala 100% offline en la pista o montaña
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isInstallable && (
              <button
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-xl bg-[#00df89] hover:bg-[#00f395] active:scale-95 text-[#051a11] text-xs font-mono font-bold uppercase transition-all shadow-md flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                Instalar
              </button>
            )}

            {isIOS && !isInstallable && (
              <button
                onClick={() => setShowIOSHint(!showIOSHint)}
                className="px-3 py-1.5 rounded-xl bg-[#00df89] hover:bg-[#00f395] text-[#051a11] text-xs font-mono font-bold uppercase transition-all shadow-md"
              >
                Instalar
              </button>
            )}

            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg text-[#617e90] hover:text-white transition-colors"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* iOS installation instructions balloon */}
        {showIOSHint && isIOS && (
          <div className="mt-2 p-3 rounded-xl bg-[#0c1419] border border-[#1e2f3a] text-xs text-[#8ba3b2] space-y-1.5 font-mono shadow-xl">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>Instrucciones para iPhone / iPad:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#7190a2]">
              <li>Toca el botón <span className="text-white font-bold">Compartir</span> (ícono del cuadrado con flecha hacia arriba).</li>
              <li>Desliza y selecciona <span className="text-[#00df89] font-bold">Agregar a pantalla de inicio</span>.</li>
              <li>¡Listo! Ya tienes la app con ícono y modo sin conexión.</li>
            </ol>
          </div>
        )}
      </div>
    </>
  );
};

