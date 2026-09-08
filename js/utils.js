/* ============================================================
   DASHBOARD UNP — utils.js
   Namespace global: Utils
   ============================================================ */
const Utils = (function () {

  const DOW = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
  const DOW_SHORT = ["DOM","LUN","MAR","MIÉ","JUE","VIE","SÁB"];
  const MONTHS = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

  function startOfDay(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
  function isSameDay(a, b) {
    const x = new Date(a), y = new Date(b);
    return x.getFullYear()===y.getFullYear() && x.getMonth()===y.getMonth() && x.getDate()===y.getDate();
  }
  function daysBetween(a, b) {
    const MS = 86400000;
    return Math.round((startOfDay(b) - startOfDay(a)) / MS);
  }
  function today() { return new Date(); }

  function longDate(d) {
    const dt = new Date(d);
    return `${DOW[dt.getDay()]}, ${dt.getDate()} de ${MONTHS[dt.getMonth()]}`;
  }
  function shortDate(d) {
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}`;
  }
  function dowShort(d) { return DOW_SHORT[new Date(d).getDay()]; }
  function timeHM(d) {
    const dt = new Date(d);
    return `${String(dt.getHours()).padStart(2,"0")}:${String(dt.getMinutes()).padStart(2,"0")}`;
  }

  function to12h(hhmm) {
    if (!hhmm) return "";
    const [hStr, mStr] = hhmm.split(":");
    let h = Number(hStr);
    const suffix = h >= 12 ? "p.m." : "a.m.";
    h = h % 12; if (h === 0) h = 12;
    return `${h}:${mStr} ${suffix}`;
  }

  function relativeDay(d) {
    const diff = daysBetween(today(), d);
    if (diff === 0) return "Hoy";
    if (diff === 1) return "Mañana";
    if (diff === -1) return "Ayer";
    if (diff > 1 && diff <= 6) return dowShort(d);
    return shortDate(d);
  }

  function minutesToLabel(min) {
    if (!min) return "—";
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60), m = min % 60;
    return m ? `${h} h ${m} min` : `${h} h`;
  }

  // -------- Prioridad --------
  // score = urgencia (tiempo restante) + peso de prioridad declarada + tiempo estimado
  function priorityScore(task) {
    if (!task.fecha) return 0;
    const diasRestantes = daysBetween(today(), task.fecha);
    let urgencia;
    if (diasRestantes <= 0) urgencia = 10;
    else if (diasRestantes === 1) urgencia = 9;
    else if (diasRestantes <= 3) urgencia = 7;
    else if (diasRestantes <= 6) urgencia = 4;
    else urgencia = 2;

    const pesoPrioridad = { alta: 4, media: 2, baja: 0 }[task.prioridad] || 0;
    const pesoTiempo = task.tiempoEstMin >= 120 ? 2 : task.tiempoEstMin >= 60 ? 1 : 0;

    let score = Math.min(10, Math.round((urgencia * 0.6) + pesoPrioridad * 0.6 + pesoTiempo * 0.4));
    return Math.max(1, score);
  }

  function esc(str) {
    if (str === undefined || str === null) return "";
    return String(str)
      .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
      .replaceAll('"',"&quot;");
  }

  function contrastColor(hex) {
    if (!hex) return "#FFFFFF";
    const h = hex.replace("#","");
    const r = parseInt(h.substring(0,2),16), g = parseInt(h.substring(2,4),16), b = parseInt(h.substring(4,6),16);
    const luminance = (0.299*r + 0.587*g + 0.114*b) / 255;
    return luminance > 0.62 ? "#152238" : "#FFFFFF";
  }

  function toast(msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 2200);
  }

  let undoTimer = null;
  function showUndo(message, onUndo) {
    const el = document.getElementById("undoToast");
    if (!el) return;
    clearTimeout(undoTimer);
    document.getElementById("undoToastMsg").textContent = message;
    const oldBtn = document.getElementById("undoToastBtn");
    const btn = oldBtn.cloneNode(true); // limpia listeners previos
    oldBtn.parentNode.replaceChild(btn, oldBtn);
    btn.addEventListener("click", () => {
      clearTimeout(undoTimer);
      el.classList.remove("show");
      onUndo();
    });
    el.classList.add("show");
    undoTimer = setTimeout(() => el.classList.remove("show"), 2000);
  }

  const CAT_META = {
    clase:      { label: "Clase",       cls: "cat-clase" },
    examen:     { label: "Examen",      cls: "cat-examen" },
    tarea:      { label: "Tarea",       cls: "cat-tarea" },
    exposicion: { label: "Exposición",  cls: "cat-exposicion" },
    estudio:    { label: "Estudio",     cls: "cat-estudio" },
    reunion:    { label: "Reunión",     cls: "cat-reunion" },
    evento:     { label: "Evento",      cls: "cat-clase" },
  };

  return {
    DOW, DOW_SHORT, MONTHS, CAT_META,
    startOfDay, isSameDay, daysBetween, today,
    longDate, shortDate, dowShort, timeHM, to12h, relativeDay,
    minutesToLabel, priorityScore, esc, contrastColor, toast, showUndo,
  };
})();
