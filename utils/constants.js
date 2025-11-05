export const USER_ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  RECEPCIONISTA: 'recepcionista',
  INVITADO: 'invitado'
};

export const TASK_STATUS = {
  PENDIENTE: 'pendiente',
  EN_PROGRESO: 'en_progreso',
  COMPLETADA: 'completada',
  CANCELADA: 'cancelada'
};

export const TASK_PRIORITY = {
  BAJA: 'baja',
  MEDIA: 'media',
  ALTA: 'alta',
  URGENTE: 'urgente'
};

export const REPORT_TYPES = {
  INCIDENTE: 'incidente',
  MEJORA: 'mejora',
  MANTENIMIENTO: 'mantenimiento',
  GENERAL: 'general'
};

export const NOTE_TYPES = {
  PERSONAL: 'personal',
  EQUIPO: 'equipo',
  GENERAL: 'general'
};

export const getRoleName = (role) => {
  const roleNames = {
    [USER_ROLES.ADMIN]: 'Administrador',
    [USER_ROLES.SUPERVISOR]: 'Supervisor',
    [USER_ROLES.RECEPCIONISTA]: 'Recepcionista',
    [USER_ROLES.INVITADO]: 'Invitado'
  };
  return roleNames[role] || role;
};

export const getStatusName = (status) => {
  const statusNames = {
    [TASK_STATUS.PENDIENTE]: 'Pendiente',
    [TASK_STATUS.EN_PROGRESO]: 'En Progreso',
    [TASK_STATUS.COMPLETADA]: 'Completada',
    [TASK_STATUS.CANCELADA]: 'Cancelada'
  };
  return statusNames[status] || status;
};

export const getPriorityName = (priority) => {
  const priorityNames = {
    [TASK_PRIORITY.BAJA]: 'Baja',
    [TASK_PRIORITY.MEDIA]: 'Media',
    [TASK_PRIORITY.ALTA]: 'Alta',
    [TASK_PRIORITY.URGENTE]: 'Urgente'
  };
  return priorityNames[priority] || priority;
};

export const getNoteTypeName = (type) => {
  const typeNames = {
    [NOTE_TYPES.PERSONAL]: 'Personal',
    [NOTE_TYPES.EQUIPO]: 'Equipo',
    [NOTE_TYPES.GENERAL]: 'General'
  };
  return typeNames[type] || type;
};

export const getReportTypeName = (type) => {
  const typeNames = {
    [REPORT_TYPES.INCIDENTE]: 'Incidente',
    [REPORT_TYPES.MEJORA]: 'Mejora',
    [REPORT_TYPES.MANTENIMIENTO]: 'Mantenimiento',
    [REPORT_TYPES.GENERAL]: 'General'
  };
  return typeNames[type] || type;
};