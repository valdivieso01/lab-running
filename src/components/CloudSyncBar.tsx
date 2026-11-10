'use client';

import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CloudUpload,
  CloudDownload,
  LogOut,
  CheckCircle2,
  TrendingUp,
  Plus,
  Trash2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  signInWithGoogle,
  signOutUser,
  subscribeToAuthChanges,
  saveUserProfileToCloud,
  loadUserProfileFromCloud,
  saveProgressSnapshotToCloud,
  loadProgressSnapshotsFromCloud,
  deleteProgressSnapshotFromCloud,
  ProgressSnapshot,
} from '@/lib/firebase';
import { TerrainType, formatTime, calculateVDOT } from '@/lib/calculator';
import { StravaAnalysisSummary } from '@/lib/strava';

const STRAVA_STORAGE_KEY = 'running_calc_strava_v3';

interface CloudSyncBarProps {
  timeSeconds: number;
  terrain: TerrainType;
  inputMethod: 'manual' | 'strava';
  onCloudProfileLoaded: (data: {
    timeSeconds: number;
    terrain: TerrainType;
    inputMethod: 'manual' | 'strava';
    stravaSummary?: StravaAnalysisSummary | null;
  }) => void;
}

export const CloudSyncBar: React.FC<CloudSyncBarProps> = ({
  timeSeconds,
  terrain,
  inputMethod,
  onCloudProfileLoaded,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [snapshots, setSnapshots] = useState<ProgressSnapshot[]>([]);
  const [snapshotNote, setSnapshotNote] = useState('');

  useEffect(() => {
    const unsub = subscribeToAuthChanges(async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        try {
          const [cloudProfile, userSnapshots] = await Promise.all([
            loadUserProfileFromCloud(currentUser.uid),
            loadProgressSnapshotsFromCloud(currentUser.uid),
          ]);
          setSnapshots(userSnapshots);

          const localStravaRaw = localStorage.getItem(STRAVA_STORAGE_KEY);
          const localStrava: StravaAnalysisSummary | null = localStravaRaw
            ? JSON.parse(localStravaRaw)
            : null;

          // If this device (e.g. mobile phone) has no Garmin/Strava history loaded, pull from Cloud automatically
          if (cloudProfile && (!localStrava || !localStrava.runsCount) && cloudProfile.stravaSummary) {
            localStorage.setItem(STRAVA_STORAGE_KEY, JSON.stringify(cloudProfile.stravaSummary));
            onCloudProfileLoaded({
              timeSeconds: cloudProfile.timeSeconds,
              terrain: cloudProfile.terrain,
              inputMethod: cloudProfile.inputMethod,
              stravaSummary: cloudProfile.stravaSummary,
            });
            showTemporaryStatus('✓ Historial descargado de tu cuenta en la nube');
          } else if (localStrava && (!cloudProfile || !cloudProfile.stravaSummary)) {
            // If this PC has Garmin/Strava history and Cloud is empty, upload automatically
            await saveUserProfileToCloud(currentUser, {
              timeSeconds,
              terrain,
              inputMethod,
              stravaSummary: localStrava,
            });
            showTemporaryStatus('✓ Tu historial de PC se guardó en tu cuenta');
          }
        } catch (err: any) {
          console.error('Error al sincronizar con Firebase:', err);
        }
      } else {
        setSnapshots([]);
      }
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showTemporaryStatus = (msg: string) => {
    setStatusMsg(msg);
    setErrorMsg(null);
    setTimeout(() => setStatusMsg(null), 4500);
  };

  const handleLogin = async () => {
    setErrorMsg(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err?.code === 'auth/unauthorized-domain') {
        setErrorMsg(
          'Falta autorizar este dominio en Firebase Console > Authentication > Settings > Authorized domains.'
        );
      } else if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(err?.message || 'No se pudo iniciar sesión con Google.');
      }
    }
  };

  const handleSaveToCloud = async () => {
    if (!user) return;
    setSyncing(true);
    setErrorMsg(null);
    try {
      const localStravaRaw = localStorage.getItem(STRAVA_STORAGE_KEY);
      const localStrava: StravaAnalysisSummary | null = localStravaRaw
        ? JSON.parse(localStravaRaw)
        : null;

      await saveUserProfileToCloud(user, {
        timeSeconds,
        terrain,
        inputMethod,
        stravaSummary: localStrava,
      });
      showTemporaryStatus('✓ Guardado en la nube (listo para abrir en tu celular)');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al guardar en Firebase.');
    } finally {
      setSyncing(false);
    }
  };

  const handlePullFromCloud = async () => {
    if (!user) return;
    setSyncing(true);
    setErrorMsg(null);
    try {
      const cloudProfile = await loadUserProfileFromCloud(user.uid);
      if (!cloudProfile) {
        setErrorMsg('Todavía no hay datos guardados en tu nube. Tocá "Subir a la nube" desde tu PC.');
        return;
      }
      if (cloudProfile.stravaSummary) {
        localStorage.setItem(STRAVA_STORAGE_KEY, JSON.stringify(cloudProfile.stravaSummary));
      } else {
        localStorage.removeItem(STRAVA_STORAGE_KEY);
      }
      onCloudProfileLoaded({
        timeSeconds: cloudProfile.timeSeconds,
        terrain: cloudProfile.terrain,
        inputMethod: cloudProfile.inputMethod,
        stravaSummary: cloudProfile.stravaSummary || null,
      });
      showTemporaryStatus(
        `✓ Datos sincronizados (${cloudProfile.stravaSummary?.runsCount || 0} carreras cargadas)`
      );
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al descargar de Firebase.');
    } finally {
      setSyncing(false);
    }
  };

  const handleAddSnapshot = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      const localStravaRaw = localStorage.getItem(STRAVA_STORAGE_KEY);
      const localStrava: StravaAnalysisSummary | null = localStravaRaw
        ? JSON.parse(localStravaRaw)
        : null;

      const created = await saveProgressSnapshotToCloud(user, {
        timeSeconds,
        label: snapshotNote.trim() || `Base 5K (${formatTime(timeSeconds)})`,
        stravaSummary: localStrava,
      });
      setSnapshots((prev) => [created, ...prev]);
      setSnapshotNote('');
      showTemporaryStatus('✓ Hito de progreso guardado en tu historial');
    } catch (err: any) {
      setErrorMsg(err?.message || 'No se pudo guardar el hito.');
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteSnapshot = async (id: string) => {
    if (!user) return;
    try {
      await deleteProgressSnapshotFromCloud(user.uid, id);
      setSnapshots((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // ignore
    }
  };

  if (authLoading) {
    return null;
  }

  return (
    <div className="relative flex flex-col lg:items-end gap-2">
      <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0c141a] border border-[#192934] text-xs shadow-md">
        {!user ? (
          <div className="flex items-center gap-2.5">
            <span className="text-[#8ca4b4] hidden sm:inline text-[11px]">
              Sincronizar PC y celular:
            </span>
            <button
              type="button"
              onClick={handleLogin}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#00df89] hover:bg-[#00f395] active:scale-95 text-[#051a11] font-bold transition-all cursor-pointer shadow-sm"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Conectar con Google</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 pr-1.5 border-r border-[#1a2b36]">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Usuario'}
                  className="w-5 h-5 rounded-full border border-[#00df89]/50"
                />
              ) : (
                <Cloud className="w-4 h-4 text-[#00df89]" />
              )}
              <span className="text-white font-semibold max-w-[140px] truncate">
                {user.displayName || user.email}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={handleSaveToCloud}
                disabled={syncing}
                title="Guardar tu historial y ritmos actuales en Firebase para verlos en otro dispositivo"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#00df89]/15 hover:bg-[#00df89]/25 text-[#00df89] border border-[#00df89]/30 font-semibold transition-colors cursor-pointer"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span>{syncing ? 'Sincronizando...' : 'Guardar'}</span>
              </button>

              <button
                type="button"
                onClick={handlePullFromCloud}
                disabled={syncing}
                title="Traer el historial que subiste en tu otro dispositivo"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#13222b] hover:bg-[#1a2e3a] text-[#9cb4c3] border border-[#1e313d] font-semibold transition-colors cursor-pointer"
              >
                <CloudDownload className="w-3.5 h-3.5" />
                <span>Traer</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSnapshots(!showSnapshots)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#13222b] hover:bg-[#1a2e3a] text-white border border-[#1e313d] font-semibold transition-colors cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5 text-[#00df89]" />
                <span>Evolución ({snapshots.length})</span>
                {showSnapshots ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>

              <button
                type="button"
                onClick={signOutUser}
                title="Cerrar sesión"
                className="p-1 rounded-lg text-[#698495] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {statusMsg && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#00df89]/10 border border-[#00df89]/30 text-[11px] text-[#00df89]">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Historical Evolution Panel (Dropdown right below top-right bar) */}
      {user && showSnapshots && (
        <div className="lg:absolute lg:right-0 lg:top-full lg:mt-2 lg:w-[560px] z-30 p-3.5 rounded-xl bg-[#0b1318] border border-[#1f3442] shadow-2xl space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#00df89]" />
                <span>Historial de Evolución de tu Estado Físico (VDOT)</span>
              </div>
              <p className="text-[11px] text-[#7390a1]">
                Guardá una foto de tu marca actual para comparar cómo evolucionan tu VDOT y tus ritmos mes a mes.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={snapshotNote}
                onChange={(e) => setSnapshotNote(e.target.value)}
                placeholder="Ej: Post ciclo Maratón..."
                className="px-2.5 py-1.5 rounded-lg bg-[#091014] border border-[#1e2f3a] text-white placeholder-[#567080] text-xs focus:border-[#00df89] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSnapshot}
                disabled={syncing}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#00df89] hover:bg-[#00f395] text-[#051a11] font-bold shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Guardar hoy ({formatTime(timeSeconds)} · VDOT {calculateVDOT(timeSeconds).toFixed(1)})</span>
              </button>
            </div>
          </div>

          {snapshots.length === 0 ? (
            <div className="text-center py-3 text-[#698495]">
              Todavía no guardaste hitos de progreso. Tocá el botón verde de arriba para registrar tu estado actual.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="p-2.5 rounded-lg bg-[#0f1920] border border-[#192934] flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate">{snap.label}</div>
                    <div className="text-[11px] text-[#698495]">{snap.date}</div>
                    <div className="text-[11px] font-mono text-[#00df89] mt-0.5">
                      5K {formatTime(snap.timeSeconds)} · VDOT {snap.vdot}
                      {snap.weeklyKmAvg > 0 ? ` · ${snap.weeklyKmAvg} km/sem` : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSnapshot(snap.id)}
                    title="Borrar este hito"
                    className="p-1 text-[#5a7280] hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
