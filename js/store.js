/* ============================================================
   DASHBOARD UNP — store.js
   Capa de datos sobre localStorage. Namespace global: Store
   ============================================================ */
const Store = (function () {
  const KEY = "dashboardUNP.v1";

  const EMPTY_DB = {
    settings: {
      nombre: "Marck",
      codigo: "",
      cicloRomano: "",
      ciclo: "2026-I",
      escuela: "",
      creditosAprobados: 0,
      promedios: [], // [{ id, ciclo, promedio }]
      tema: "claro",
      notificaciones: true,
    },
    courses: [],
    tasks: [],
    events: [],   // incluye eventos, clases y exámenes (type: 'clase'|'evento'|'examen'|'reunion'|'exposicion')
    study: [],
    inbox: [],
    notes: [],    // notas rápidas del dashboard
    objectives: [],
    resources: [], // { id, courseId, label, url }
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error("Store: error leyendo localStorage", e);
      return null;
    }
  }

  function save(db) {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
      return true;
    } catch (e) {
      console.error("Store: error guardando en localStorage", e);
      return false;
    }
  }

  let db = load();
  if (!db) {
    db = seedDemoData();
    save(db);
  } else {
    // migración suave: asegura que colecciones/campos nuevos existan sin perder datos existentes
    if (!db.notes) db.notes = [];
    if (db.settings.codigo === undefined) db.settings.codigo = "";
    if (db.settings.cicloRomano === undefined) db.settings.cicloRomano = "";
    if (db.settings.escuela === undefined) db.settings.escuela = "";
    if (db.settings.creditosAprobados === undefined) db.settings.creditosAprobados = 0;
    if (!db.settings.promedios) db.settings.promedios = [];
    (db.courses || []).forEach(c => {
      if (c.seccion === undefined) c.seccion = "";
      if (c.codigo === undefined) c.codigo = "";
      if (c.nombre) c.nombre = c.nombre.toUpperCase();
      if (c.profesor) c.profesor = c.profesor.toUpperCase();
    });
    save(db);
  }

  function uid(prefix) {
    return (prefix || "id") + "_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  }

  function seedDemoData() {
    const d = JSON.parse(JSON.stringify(EMPTY_DB));
    const today = new Date();
    const iso = (offsetDays, h = 0, m = 0) => {
      const dt = new Date(today);
      dt.setDate(dt.getDate() + offsetDays);
      dt.setHours(h, m, 0, 0);
      return dt.toISOString();
    };

    // ---- Cursos reales del ciclo 2026-I (según horario proporcionado) ----
    d.courses = [
      { id: "c1", nombre: "ACTIVIDAD DE RESPONSABILIDAD SOCIAL UNIVERSITARIA", profesor: "", seccion: "", codigo: "", creditos: 1, color: "#5B6B85",
        horario: [{ dia: "Lunes", inicio: "07:00", fin: "08:40" }],
        aula: "", descripcion: "" },
      { id: "c2", nombre: "ESTADÍSTICA GENERAL", profesor: "", seccion: "", codigo: "", creditos: 3, color: "#7C5CC7",
        horario: [
          { dia: "Miércoles", inicio: "07:50", fin: "08:40" },
          { dia: "Jueves", inicio: "07:00", fin: "08:40" },
          { dia: "Viernes", inicio: "07:00", fin: "08:40" },
        ],
        aula: "", descripcion: "" },
      { id: "c3", nombre: "INGENIERÍA EN PROCESOS DE NEGOCIOS", profesor: "", seccion: "", codigo: "", creditos: 4, color: "#16305C",
        horario: [
          { dia: "Lunes", inicio: "08:50", fin: "10:30" },
          { dia: "Martes", inicio: "08:50", fin: "10:30" },
          { dia: "Miércoles", inicio: "08:50", fin: "09:40" },
        ],
        aula: "", descripcion: "" },
      { id: "c4", nombre: "ESTRUCTURAS DISCRETAS", profesor: "", seccion: "", codigo: "", creditos: 4, color: "#E0685C",
        horario: [
          { dia: "Miércoles", inicio: "09:40", fin: "10:30" },
          { dia: "Jueves", inicio: "08:50", fin: "10:30" },
          { dia: "Viernes", inicio: "08:50", fin: "10:30" },
        ],
        aula: "", descripcion: "" },
      { id: "c5", nombre: "CÁLCULO I", profesor: "", seccion: "", codigo: "", creditos: 4, color: "#E29A2E",
        horario: [
          { dia: "Lunes", inicio: "10:40", fin: "12:20" },
          { dia: "Martes", inicio: "10:40", fin: "12:20" },
          { dia: "Miércoles", inicio: "10:40", fin: "11:30" },
        ],
        aula: "", descripcion: "" },
      { id: "c6", nombre: "INTRODUCCIÓN A LA CONTABILIDAD", profesor: "", seccion: "", codigo: "", creditos: 2, color: "#279463",
        horario: [
          { dia: "Miércoles", inicio: "11:30", fin: "12:20" },
          { dia: "Jueves", inicio: "10:40", fin: "12:20" },
        ],
        aula: "", descripcion: "" },
      { id: "c7", nombre: "MICROECONOMÍA", profesor: "", seccion: "", codigo: "", creditos: 4, color: "#1B6B45",
        horario: [
          { dia: "Lunes", inicio: "13:50", fin: "15:30" },
          { dia: "Martes", inicio: "13:50", fin: "15:30" },
          { dia: "Miércoles", inicio: "13:50", fin: "14:40" },
        ],
        aula: "", descripcion: "" },
      { id: "c8", nombre: "DEFENSA NACIONAL", profesor: "", seccion: "", codigo: "", creditos: 2, color: "#3FA9E0",
        horario: [
          { dia: "Lunes", inicio: "15:40", fin: "17:20" },
          { dia: "Miércoles", inicio: "15:40", fin: "16:30" },
        ],
        aula: "", descripcion: "" },
    ];

    d.tasks = [
      { id: "t1", titulo: "Resolver práctica de derivadas", descripcion: "", courseId: "c5",
        fecha: iso(1), hora: "23:59", prioridad: "alta", estado: "pendiente", tiempoEstMin: 120, etiquetas: [], subtareas: [] },
      { id: "t2", titulo: "Leer material de Microeconomía", descripcion: "", courseId: "c7",
        fecha: iso(0), hora: "20:00", prioridad: "media", estado: "pendiente", tiempoEstMin: 60, etiquetas: [], subtareas: [] },
      { id: "t3", titulo: "Ejercicios de Estructuras Discretas", descripcion: "", courseId: "c4",
        fecha: iso(0), hora: "21:00", prioridad: "alta", estado: "pendiente", tiempoEstMin: 90, etiquetas: [], subtareas: [] },
      { id: "t4", titulo: "Informe de Contabilidad", descripcion: "", courseId: "c6",
        fecha: iso(5), hora: "23:59", prioridad: "media", estado: "pendiente", tiempoEstMin: 180, etiquetas: [], subtareas: [] },
      { id: "t5", titulo: "Práctica de Estadística General", descripcion: "", courseId: "c2",
        fecha: iso(-1), hora: "23:59", prioridad: "alta", estado: "atrasada", tiempoEstMin: 90, etiquetas: [], subtareas: [] },
      { id: "t6", titulo: "Cuestionario de repaso", descripcion: "", courseId: "c3",
        fecha: iso(-3), hora: "18:00", prioridad: "baja", estado: "completada", tiempoEstMin: 30, etiquetas: [], subtareas: [] },
    ];

    d.events = [
      { id: "e1", tipo: "examen", titulo: "PC1 Cálculo I", courseId: "c5", fecha: iso(5, 10, 40),
        horaInicio: "10:40", horaFin: "12:20", ubicacion: "", descripcion: "Límites, derivadas y aplicaciones.", repite: "no" },
      { id: "e2", tipo: "evento", titulo: "Entrega — Introducción a la Contabilidad", courseId: "c6", fecha: iso(3, 23, 59),
        horaInicio: "23:59", horaFin: "23:59", ubicacion: "Aula virtual", descripcion: "Subir informe a Classroom.", repite: "no" },
      { id: "e3", tipo: "reunion", titulo: "Trabajo grupal — Estructuras Discretas", courseId: "c4", fecha: iso(1, 17, 0),
        horaInicio: "17:00", horaFin: "19:00", ubicacion: "Biblioteca central", descripcion: "", repite: "no" },
    ];

    d.study = [
      { id: "s1", courseId: "c5", tema: "Regla de la cadena", fecha: iso(-1), horaInicio: "18:00", horaFin: "19:30", duracionMin: 90, dificultad: "media", comentarios: "" },
      { id: "s2", courseId: "c2", tema: "Distribuciones de probabilidad", fecha: iso(-2), horaInicio: "19:00", horaFin: "20:00", duracionMin: 60, dificultad: "alta", comentarios: "" },
      { id: "s3", courseId: "c7", tema: "Curvas de demanda", fecha: iso(-3), horaInicio: "16:00", horaFin: "17:20", duracionMin: 80, dificultad: "baja", comentarios: "" },
    ];

    d.inbox = [
      { id: "i1", texto: "Preguntar por el sílabo de Estructuras Discretas", fecha: iso(0), procesado: false },
      { id: "i2", texto: "El grupo quiere reunirse el jueves", fecha: iso(-1), procesado: false },
    ];

    d.notes = [
      { id: "n1", texto: "Revisar el correo de la facultad sobre matrícula.", fecha: iso(0) },
    ];

    d.objectives = [
      { id: "o1", titulo: "No tener tareas atrasadas", meta: 1, progreso: 0, tipo: "boolean" },
      { id: "o2", titulo: "Estudiar 15 horas por semana", meta: 15, progreso: 3.8, tipo: "horas" },
      { id: "o3", titulo: "Entregar trabajos antes del límite", meta: 1, progreso: 1, tipo: "boolean" },
      { id: "o4", titulo: "Preparar exámenes con anticipación", meta: 1, progreso: 1, tipo: "boolean" },
      { id: "o5", titulo: "Mantener una rutina constante", meta: 1, progreso: 0, tipo: "boolean" },
    ];

    d.resources = [];

    return d;
  }

  function persist() { save(db); }

  // ---------- Generic CRUD por colección ----------
  function all(col) { return db[col] || []; }
  function get(col, id) { return (db[col] || []).find(x => x.id === id); }
  function add(col, obj, prefix) {
    obj.id = obj.id || uid(prefix || col.slice(0, 2));
    db[col].push(obj);
    persist();
    return obj;
  }
  function update(col, id, patch) {
    const item = get(col, id);
    if (!item) return null;
    Object.assign(item, patch);
    persist();
    return item;
  }
  function remove(col, id) {
    db[col] = db[col].filter(x => x.id !== id);
    persist();
  }
  function getSettings() { return db.settings; }
  function updateSettings(patch) { Object.assign(db.settings, patch); persist(); return db.settings; }
  function resetDemo() { db = seedDemoData(); persist(); }
  function wipeAll() { db = JSON.parse(JSON.stringify(EMPTY_DB)); persist(); }

  return { all, get, add, update, remove, getSettings, updateSettings, resetDemo, wipeAll, uid };
})();
