import React, { useState, useEffect } from 'react';
import { Expediente, Audiencia, User, AppSettings, ExpedienteStatus, Notificacion } from './types';
import { saveExpedienteToSheet, updateExpedienteInSheet, fetchExpedientesFromSheet, fetchUsersFromSheet, updateAudienciaDateInSheet, fetchNotificacionesFromSheet } from './services/googleSheets';

const STORAGE_KEYS = {
  EXPEDIENTES: 'defensa_consumidor_expedientes',
  AUDIENCIAS: 'defensa_consumidor_audiencias',
  USERS: 'defensa_consumidor_users',
  SETTINGS: 'defensa_consumidor_settings',
  CURRENT_USER: 'defensa_consumidor_current_user',
  NOTIFICACIONES: 'defensa_consumidor_notificaciones',
};

const generateId = () => {
  try {
    return crypto.randomUUID();
  } catch (e) {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
};

export function useStore() {
  const [expedientes, setExpedientes] = useState<Expediente[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPEDIENTES);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.map(exp => ({
        ...exp,
        timeline: Array.isArray(exp.timeline) ? exp.timeline : []
      })) : [];
    } catch (e) {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return saved ? JSON.parse(saved) : null;
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Sincronización con Google Sheets
  const syncWithSheets = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncError(null);
    try {
      console.log('🔄 Iniciando sincronización con Google Sheets...');
      
      // Ejecutar secuencialmente para no saturar el script de Google
      const sheetExpedientes = await fetchExpedientesFromSheet();
      const sheetUsers = await fetchUsersFromSheet();
      const sheetNotificaciones = await fetchNotificacionesFromSheet();

      // Si llegamos aquí, la conexión fue exitosa.
      setSyncError(null);
      setExpedientes(currentExpedientes => {
        console.log('📦 Datos recibidos del Sheet:', sheetExpedientes?.length, 'filas');
        const normalizedSheets = (sheetExpedientes || []).map(exp => {
          // Si el Excel no tiene ID, intentamos buscarlo en el estado local por número de expediente
          const existing = currentExpedientes.find(e => e.numero === exp.numero);
          
          // Si tenemos una versión local más reciente, la preservamos
          if (existing && existing.fechaModificacion) {
            const localDate = new Date(existing.fechaModificacion).getTime();
            const sheetDate = exp.fechaModificacion ? new Date(exp.fechaModificacion).getTime() : 0;
            
            if (!isNaN(localDate) && (isNaN(sheetDate) || localDate > sheetDate)) {
              console.log(`⏳ Preservando versión local más reciente para ${exp.numero} (Local: ${existing.fechaModificacion}, Sheet: ${exp.fechaModificacion || 'N/A'})`);
              return existing;
            }
          }

          return {
            ...exp,
            id: exp.id || (existing ? existing.id : generateId()),
            estado: exp.estado || (existing ? existing.estado : 'expediente no armado, esperando documental'),
            timeline: Array.isArray(exp.timeline) ? exp.timeline : []
          };
        });

        // Evitar duplicados por número de expediente
        const uniqueExpedientes: Expediente[] = [];
        const seenNumbers = new Set();
        
        normalizedSheets.forEach(exp => {
          if (!seenNumbers.has(exp.numero)) {
            uniqueExpedientes.push(exp);
            seenNumbers.add(exp.numero);
          }
        });

        console.log(`✅ Sincronización completada. ${uniqueExpedientes.length} expedientes únicos.`);
        return uniqueExpedientes;
      });

      setLastSync(new Date());
      if (sheetUsers && sheetUsers.length > 0) {
        setUsers(sheetUsers);
      }
      if (sheetNotificaciones && sheetNotificaciones.length > 0) {
        setNotificaciones(sheetNotificaciones);
      }
    } catch (error: any) {
      console.error('⚠️ Error de conexión con Google Sheets. Manteniendo datos locales.', error);
      setSyncError(error.message || 'Error de conexión');
    } finally {
      setIsSyncing(false);
    }
  };

  // Ref para evitar problemas de clausura en el intervalo
  const syncRef = React.useRef(syncWithSheets);
  syncRef.current = syncWithSheets;

  useEffect(() => {
    syncRef.current();
    
    // Sincronización automática cada 2 minutos
    const interval = setInterval(() => syncRef.current(), 120000);
    return () => clearInterval(interval);
  }, []);

  const [audiencias, setAudiencias] = useState<Audiencia[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIENCIAS);
    return saved ? JSON.parse(saved) : [];
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : [
      { id: '1', username: 'admin', password: 'admin', role: 'admin' }
    ];
  });

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICACIONES);
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : { proximoNumero: 1000 };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPEDIENTES, JSON.stringify(expedientes));
  }, [expedientes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIENCIAS, JSON.stringify(audiencias));
  }, [audiencias]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICACIONES, JSON.stringify(notificaciones));
  }, [notificaciones]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  const login = (username: string, password: string): boolean => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addExpediente = (data: Omit<Expediente, 'id' | 'numero' | 'fechaCreacion' | 'fechaModificacion' | 'timeline' | 'estado'>) => {
    const year = new Date().getFullYear();
    const numero = `${settings.proximoNumero.toString().padStart(4, '0')}/${year}`;
    const now = new Date().toISOString();
    const newExpediente: Expediente = {
      ...data,
      id: generateId(),
      numero,
      fechaCreacion: now,
      fechaModificacion: now,
      estado: 'expediente no armado, esperando documental',
      timeline: [{
        id: generateId(),
        status: 'expediente no armado, esperando documental',
        date: now,
        notes: 'Reclamo ingresado por Ventanilla Única',
        user: currentUser?.username
      }]
    };

    setExpedientes(prev => [newExpediente, ...prev]);
    setSettings(prev => ({ ...prev, proximoNumero: prev.proximoNumero + 1 }));
    
    // Sincronizar con Google Sheets
    saveExpedienteToSheet(newExpediente);
    
    return newExpediente;
  };

  // Heal expedientes missing IDs
  React.useEffect(() => {
    const missingIds = expedientes.some(e => !e.id);
    if (missingIds) {
      setExpedientes(prev => prev.map(e => ({
        ...e,
        id: e.id || generateId()
      })));
    }
  }, [expedientes]);

  const updateExpedienteStatus = async (id: string, newStatus: ExpedienteStatus, notes?: string) => {
    if (!id) {
      console.error("No se puede actualizar un expediente sin ID");
      return;
    }
    const now = new Date().toISOString();
    const expToUpdate = expedientes.find(e => e.id === id);
    if (!expToUpdate) return;

    const updated = {
      ...expToUpdate,
      estado: newStatus,
      fechaModificacion: now,
      timeline: [
        ...(Array.isArray(expToUpdate.timeline) ? expToUpdate.timeline : []),
        { id: generateId(), status: newStatus, date: now, notes, user: currentUser?.username }
      ]
    };

    setExpedientes(prev => {
      const exists = prev.find(e => e.id === id);
      if (!exists) return prev;
      return prev.map(e => e.id === id ? updated : e);
    });
    
    // Sincronizar actualización
    const success = await updateExpedienteInSheet(updated);
    if (!success) {
      console.warn("⚠️ No se pudo guardar el estado en Google Sheets. Se reintentará en la próxima sincronización.");
    }
  };

  const addAudiencia = (data: Omit<Audiencia, 'id'>) => {
    if (!data.expedienteId) {
      console.error("No se puede agregar una audiencia sin ID de expediente");
      return;
    }
    const dateOnly = data.fecha.split('T')[0];
    const newAudiencia: Audiencia = {
      ...data,
      fecha: dateOnly,
      id: generateId(),
    };
    setAudiencias(prev => [...prev, newAudiencia]);
    
    // Sincronizar con Google Sheets
    updateAudienciaDateInSheet(data.expedienteId, dateOnly);

    // Actualizar estado local del expediente
    setExpedientes(prev => prev.map(exp => {
      if (exp.id === data.expedienteId) {
        return { ...exp, fechaAudiencia: dateOnly };
      }
      return exp;
    }));
  };

  const addUser = (username: string, role: 'admin' | 'staff') => {
    const newUser: User = {
      id: generateId(),
      username,
      role,
    };
    setUsers(prev => [...prev, newUser]);
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return {
    expedientes,
    audiencias,
    notificaciones,
    users,
    settings,
    currentUser,
    login,
    logout,
    addExpediente,
    updateExpedienteStatus,
    addAudiencia,
    addUser,
    deleteUser,
    setSettings,
    refreshData: syncWithSheets,
    isSyncing,
    syncError,
    lastSync,
  };
}
