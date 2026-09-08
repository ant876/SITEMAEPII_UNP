/* ============================================================
   DASHBOARD UNP — ui-calendario.js
   Mes + panel "Detalle del día" lado a lado, con filtros por
   categoría. Namespace global: UICalendario
   ============================================================ */
const UICalendario = (function () {
  let mode = "mes"; // mes | dia
  let cursor = new Date();
  let selected = new Date();
  let filter = "todos";

  const FILTROS = [
    { key: "todos", label: "Todos" },
    { key: "clase", label: "Clases" },
    { key: "examen", label: "Exámenes" },
    { key: "tarea", label: "Tareas" },
    { key: "exposicion", label: "Exposiciones" },
    { key: "estudio", label: "Estudio" },
    { key: "reunion", label: "Reuniones" },
  ];

  function courseName(id) { const c = Store.get("courses", id); return c ? c.nombre : ""; }

  function itemsOfDay(d) {
    const items = [];
    Store.all("events").forEach(e => { if (Utils.isSameDay(e.fecha, d)) items.push({ kind: e.tipo, ref: e, time: e.horaInicio || "" }); });
    Store.all("tasks").forEach(t => { if (Utils.isSameDay(t.fecha, d) && t.estado !== "completada") items.push({ kind: "tarea", ref: t, time: t.hora || "" }); });
    Store.all("study").forEach(s => { if (Utils.isSameDay(s.fecha, d)) items.push({ kind: "estudio", ref: s, time: s.horaInicio || "" }); });
    const filtered = filter === "todos" ? items : items.filter(i => i.kind === filter);
    return filtered.sort((a,b)=> a.time.localeCompare(b.time));
  }

  function monthGrid() {
    const y = cursor.getFullYear(), m = cursor.getMonth();
    const first = new Date(y, m, 1);
    const startOffset = first.getDay();
    const daysInMonth = new Date(y, m+1, 0).getDate();
    const cells = [];
    for (let i=0;i<startOffset;i++) cells.push(null);
    for (let d=1; d<=daysInMonth; d++) cells.push(new Date(y,m,d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }

  function dayCellHTML(date) {
    if (!date) return `<div class="cal-day cal-day-empty"></div>`;
    const items = itemsOfDay(date);
    const isToday = Utils.isSameDay(date, Utils.today());
    const isSelected = Utils.isSameDay(date, selected);
    const preview = items.slice(0, 2);
    const extra = items.length - preview.length;
    return `
      <div class="cal-day ${isSelected?"is-selected":""}" data-day="${date.toISOString()}">
        <div class="cal-day-top">
          <span class="cal-daynum ${isToday?"is-today":""} ${isSelected?"is-selected":""}">${date.getDate()}</span>
          ${items.length ? `<span class="cal-day-count">${items.length}</span>` : ""}
        </div>
        <div class="cal-day-chips">
          ${preview.map(i => `<span class="cal-chip cat-${i.kind}-soft">${i.time ? Utils.to12h(i.time) : Utils.CAT_META[i.kind]?.label || ""}</span>`).join("")}
          ${extra > 0 ? `<span class="cal-chip-more">+${extra} más</span>` : ""}
        </div>
      </div>`;
  }

  function itemCardHTML(item) {
    const meta = Utils.CAT_META[item.kind] || Utils.CAT_META.evento;
    const isTask = item.kind === "tarea";
    const isStudy = item.kind === "estudio";
    const title = item.ref.titulo || item.ref.tema;
    const timeRange = isTask
      ? (item.ref.hora || "")
      : `${item.ref.horaInicio || ""}${item.ref.horaFin && item.ref.horaFin !== item.ref.horaInicio ? " – " + item.ref.horaFin : ""}`;
    const c = item.ref.courseId ? courseName(item.ref.courseId) : "";
    const ubic = isTask ? "" : (item.ref.ubicacion || (isStudy ? "" : ""));
    return `
      <div class="cal-item-card ${meta.cls}" data-openitem="${item.ref.id}" data-kind="${item.kind}">
        <div class="cal-item-top">
          <span class="cal-item-badge ${meta.cls}-soft"><span class="dot ${meta.cls}"></span>${meta.label.toUpperCase()}</span>
          ${timeRange ? `<span class="cal-item-time">${Icons.get("clock",11)} ${Utils.to12h(timeRange.split(" – ")[0])}${timeRange.includes(" – ") ? " – " + Utils.to12h(timeRange.split(" – ")[1]) : ""}</span>` : ""}
        </div>
        <div class="cal-item-title">${Utils.esc(title)}</div>
        ${c ? `<div class="cal-item-meta">${Icons.get("book",11)} ${Utils.esc(c)}</div>` : ""}
        ${ubic ? `<div class="cal-item-meta">${Icons.get("pin",11)} ${Utils.esc(ubic)}</div>` : ""}
      </div>`;
  }

  function panelHTML() {
    const items = itemsOfDay(selected);
    return `
      <div class="cal-panel-head">
        <div>
          <div class="cal-panel-label">Detalle del día</div>
          <div class="cal-panel-date">${Utils.longDate(selected)}</div>
        </div>
        <button class="btn btn-primary btn-sm" id="btnAddEventDay">${Icons.get("plus",12)} Evento</button>
      </div>
      <div class="cal-panel-list">
        ${items.length ? items.map(itemCardHTML).join("") : `<div class="empty" style="padding:30px 10px;"><div class="em-emoji">${Icons.get("calendar",20)}</div><div class="em-sub">Sin actividades este día.</div></div>`}
      </div>`;
  }

  function monthLabel() {
    return `${Utils.MONTHS[cursor.getMonth()][0].toUpperCase()+Utils.MONTHS[cursor.getMonth()].slice(1)} ${cursor.getFullYear()}`;
  }

  function filterChipsHTML() {
    return FILTROS.map(f => `
      <button class="cal-filter-chip ${filter===f.key?"active":""}" data-filter="${f.key}">
        ${f.key !== "todos" ? `<span class="dot cat-${f.key}"></span>` : ""}${f.label}
      </button>`).join("");
  }

  function render() {
    document.getElementById("view").innerHTML = `
      <div class="card cal-toolbar-card">
        <div class="cal-toolbar-row">
          <div class="cal-nav">
            <button class="icon-btn" id="calPrev">${Icons.get("chevronLeft",16)}</button>
            <div class="cal-month-label">${monthLabel()}</div>
            <button class="icon-btn" id="calNext">${Icons.get("chevronRight",16)}</button>
          </div>
          <div class="cal-toggle">
            <button data-m="mes" class="${mode==="mes"?"active":""}">Mes</button>
            <button data-m="dia" class="${mode==="dia"?"active":""}">Día seleccionado</button>
          </div>
        </div>
        <div class="cal-filters">${filterChipsHTML()}</div>
      </div>

      <div class="cal-layout ${mode==="dia"?"cal-layout-dia":""}">
        ${mode==="mes" ? `
        <div class="card card-pad">
          <div class="cal-grid">
            ${Utils.DOW_SHORT.map(d=>`<div class="cal-dow">${d}</div>`).join("")}
            ${monthGrid().map(dayCellHTML).join("")}
          </div>
        </div>` : ""}
        <div class="card card-pad cal-panel">${panelHTML()}</div>
      </div>
    `;

    document.getElementById("calPrev").addEventListener("click", ()=> { cursor.setMonth(cursor.getMonth()-1); render(); });
    document.getElementById("calNext").addEventListener("click", ()=> { cursor.setMonth(cursor.getMonth()+1); render(); });
    document.querySelectorAll("[data-m]").forEach(b=> b.addEventListener("click", ()=>{ mode=b.dataset.m; render(); }));
    document.querySelectorAll("[data-filter]").forEach(b=> b.addEventListener("click", ()=>{ filter=b.dataset.filter; render(); }));
    document.querySelectorAll("[data-day]").forEach(el=> el.addEventListener("click", ()=>{
      selected = new Date(el.dataset.day);
      render();
    }));
    document.getElementById("btnAddEventDay").addEventListener("click", ()=> QuickAdd.newOnDate("evento", selected));
    document.querySelectorAll("[data-openitem]").forEach(el => el.addEventListener("click", ()=>{
      const kind = el.dataset.kind;
      if (kind === "tarea") UITaskDetail.open(el.dataset.openitem);
      else if (kind === "estudio") QuickAdd.editStudy(el.dataset.openitem);
      else UIEventDetail.open(el.dataset.openitem);
    }));
  }

  return { render };
})();
