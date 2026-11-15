'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { User } from 'firebase/auth';
import {
  ShieldCheck,
  Users,
  FileSpreadsheet,
  Search,
  LogIn,
  LogOut,
  ArrowLeft,
  RefreshCw,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import {
  ADMIN_EMAIL,
  AdminUserSummary,
  isFirebaseConfigured,
  subscribeToAuthChanges,
  signInWithGoogle,
  signOutUser,
  loadAllUsersForAdmin,
} from '@/lib/firebase';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [usersList, setUsersList] = useState<AdminUserSummary[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = Boolean(
    user &&
      user.emailVerified &&
      user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setErrorMsg(null);
    try {
      const data = await loadAllUsersForAdmin();
      setUsersList(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar los usuarios. Verificá las reglas de Firestore.';
      setErrorMsg(message);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return usersList;
    return usersList.filter(
      (u) =>
        (u.displayName && u.displayName.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
    );
  }, [usersList, searchQuery]);

  const stats = useMemo(() => {
    const total = usersList.length;
    const withStrava = usersList.filter((u) => u.hasStravaData).length;
    const manualOnly = total - withStrava;
    return { total, withStrava, manualOnly };
  }, [usersList]);

  const formatDate = (ts: number): string => {
    if (!ts) return 'Sin fecha';
    return new Date(ts).toLocaleString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto space-y-6">
      {/* Top Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Panel de Administración</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-50">
            Usuarios Registrados en Lab Running
          </h1>
          <p className="text-xs text-zinc-400">
            Vista privada de cuentas sincronizadas. No expone ritmos ni métricas personales de entrenamiento.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/"
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la App</span>
          </Link>

          {user && (
            <button
              type="button"
              onClick={() => signOutUser()}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          )}
        </div>
      </header>

      {!isFirebaseConfigured ? (
        <section className="lab-panel rounded-2xl p-6 text-center space-y-2">
          <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto" />
          <p className="text-sm text-zinc-300 font-semibold">
            Firebase no está configurado en las variables de entorno.
          </p>
        </section>
      ) : authLoading ? (
        <section className="lab-panel rounded-2xl p-8 text-center text-sm text-zinc-400">
          Verificando sesión...
        </section>
      ) : !user ? (
        <section className="lab-panel rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-zinc-100">
              Acceso exclusivo para Administrador
            </h2>
            <p className="text-xs text-zinc-400">
              Iniciá sesión con tu cuenta de Google autorizada para ver el listado de usuarios.
            </p>
          </div>
          <button
            type="button"
            onClick={() => signInWithGoogle()}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Iniciar sesión con Google</span>
          </button>
        </section>
      ) : !isAdmin ? (
        <section className="lab-panel rounded-2xl p-8 text-center space-y-3 max-w-md mx-auto border-rose-500/30">
          <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-base font-bold text-zinc-100">Acceso denegado</h2>
          <p className="text-xs text-zinc-400">
            La cuenta <strong className="text-zinc-200">{user.email}</strong> no tiene permisos de administrador.
          </p>
        </section>
      ) : (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <section
            aria-label="Resumen de usuarios"
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div className="lab-panel rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Total Usuarios</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold num-telemetry text-zinc-50">
                {stats.total}
              </div>
            </div>

            <div className="lab-panel rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Con Strava / Garmin</span>
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold num-telemetry text-emerald-400">
                {stats.withStrava}
              </div>
            </div>

            <div className="lab-panel rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Solo Test Manual</span>
                <Clock className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="text-2xl font-extrabold num-telemetry text-zinc-200">
                {stats.manualOnly}
              </div>
            </div>
          </section>

          {/* Search & Refresh Controls */}
          <section className="lab-panel rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <label htmlFor="admin-user-search" className="sr-only">
                  Buscar usuario por nombre o email
                </label>
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-user-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre o email..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={fetchUsers}
                disabled={loadingUsers}
                className="px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loadingUsers ? 'animate-spin' : ''}`} />
                <span>{loadingUsers ? 'Actualizando...' : 'Actualizar lista'}</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Users Table */}
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                    <th className="py-3 px-4 font-semibold">Usuario</th>
                    <th className="py-3 px-4 font-semibold">Email</th>
                    <th className="py-3 px-4 font-semibold">Datos Cargados</th>
                    <th className="py-3 px-4 font-semibold text-right">Última Sincronización</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-zinc-500">
                        {loadingUsers
                          ? 'Cargando usuarios...'
                          : 'No se encontraron usuarios.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr
                        key={u.uid}
                        className="hover:bg-zinc-900/60 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            {u.photoURL ? (
                              <img
                                src={u.photoURL}
                                alt={u.displayName || 'Avatar'}
                                className="w-7 h-7 rounded-full border border-zinc-700 object-cover shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[11px] font-bold text-zinc-300 shrink-0">
                                {(u.displayName || u.email || '?')[0].toUpperCase()}
                              </div>
                            )}
                            <span className="font-semibold text-zinc-100">
                              {u.displayName || 'Sin nombre'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-zinc-400 num-telemetry">
                          {u.email || '—'}
                        </td>
                        <td className="py-3 px-4">
                          {u.hasStravaData ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-medium">
                              Strava conectado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 font-medium">
                              Manual
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-zinc-400 num-telemetry whitespace-nowrap">
                          {formatDate(u.updatedAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
