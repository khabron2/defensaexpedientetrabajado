import React, { useState, useEffect } from 'react';
import { Expediente, Audiencia, User, AppSettings, ExpedienteStatus } from './types';
import { saveExpedienteToSheet, updateExpedienteInSheet, fetchExpedientesFromSheet, fetchUsersFromSheet, updateAudienciaDateInSheet } from './services/googleSheets';

const STORAGE_KEYS = {
  EXPEDIENTES: 'defensa_consumidor_expedientes',
  AUDIENCIAS: 'defensa_consumidor_audiencias',
  USERS: 'defensa_consumidor_users',
  SETTINGS: 'defensa_consumidor_settings',
  CURRENT_USER: 'defensa_consumidor_current_user',
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

  // Sincronización con Google Sheets
  const syncWithSheets = async () => {
    try {
      const [sheetExpedientes, sheetUsers] = await Promise.all([
        fetchExpedientesFromSheet(),
        fetchUsersFromSheet()
      ]);

      // Si llegamos aquí, la conexión fue exitosa.
      // El Excel es la fuente de verdad, pero intentamos preservar IDs locales si faltan en el Excel
      const normalizedSheets = (sheetExpedientes || []).map(exp => {
        // Si el Excel no tiene ID, intentamos buscarlo en el estado local por número de expediente
        const existing = expedientes.find(e => e.numero === exp.numero);
        return {
          ...exp,
          id: exp.id || (existing ? existing.id : crypto.randomUUID()),
          timeline: Array.isArray(exp.timeline) ? exp.timeline : []
        };
      });
      
      setExpedientes(normalizedSheets);

      // Limpiar audiencias cuyos expedientes ya no existen
      setAudiencias(prev => prev.filter(aud => 
        normalizedSheets.some(exp => exp.id === aud.expedienteId)
      ));

      if (sheetUsers && sheetUsers.length > 0) {
        setUsers(sheetUsers);
      }
    } catch (error) {
      console.error('⚠️ Error de conexión con Google Sheets. Manteniendo datos locales.', error);
    }
  };

  useEffect(() => {
    syncWithSheets();
    
    // Sincronización automática cada 2 minutos
    const interval = setInterval(syncWithSheets, 120000);
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
      id: crypto.randomUUID(),
      numero,
      fechaCreacion: now,
      fechaModificacion: now,
      estado: 'expediente no armado, esperando documental',
      timeline: [{
        id: crypto.randomUUID(),
        status: 'expediente no armado, esperando documental',
        date: now,
        notes: 'Reclamo ingresado por Ventanilla Única'
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
        id: e.id || crypto.randomUUID()
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
        { id: crypto.randomUUID(), status: newStatus, date: now, notes }
      ]
    };

    setExpedientes(prev => prev.map(e => e.id === id ? updated : e));
    
    // Sincronizar actualización
    await updateExpedienteInSheet(updated);
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
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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
  };
}
