/* ============================================================
   DASHBOARD UNP — ui-dashboard.js
   Namespace global: UIDashboard
   ============================================================ */
const UIDashboard = (function () {

  function courseName(id) {
    const c = Store.get("courses", id);
    return c ? c.nombre : "";
  }

  function todaysEvents() {
    return Store.all("events").filter(e => Utils.isSameDay(e.fecha, Utils.today()))
      .sort((a,b)=> a.horaInicio.localeCompare(b.horaInicio));
  }
  function todaysTasks() {
    return Store.all("tasks").filter(t => t.estado !== "completada" && Utils.isSameDay(t.fecha, Utils.today()));
  }
  function pendingTasks() {
    return Store.all("tasks").filter(t => t.estado === "pendiente" || t.estado === "atrasada");
  }
  function urgentTasks() {
    return pendingTasks().filter(t => Utils.priorityScore(t) >= 8);
  }
  function upcoming(days = 10) {
    const items = [];
    Store.all("events").forEach(e => {
      const d = Utils.daysBetween(Utils.today(), e.fecha);
      if (d >= 0 && d <= days) items.push({ kind:"evento", d, ref:e });
    });
    Store.all("tasks").forEach(t => {
      if (t.estado === "completada") return;
      const d = Utils.daysBetween(Utils.today(), t.fecha);
      if (d >= 0 && d <= days) items.push({ kind:"tarea", d, ref:t });
    });
    return items.sort((a,b)=> a.d - b.d || new Date(a.ref.fecha)-new Date(b.ref.fecha)).slice(0, 8);
  }

  function paraHoy() {
    // combina tareas de hoy + tareas urgentes no completadas, ordenadas por prioridad
    const pool = [...todaysTasks(), ...pendingTasks().filter(t=>Utils.priorityScore(t)>=8)];
    const uniq = Array.from(new Map(pool.map(t=>[t.id,t])).values());
    return uniq.sort((a,b)=> Utils.priorityScore(b) - Utils.priorityScore(a)).slice(0,6);
  }

  function taskRowHTML(t) {
    const c = t.courseId ? courseName(t.courseId) : "";
    const done = t.estado === "completada";
    return `
      <div class="task-row ${done?"done":""}" data-id="${t.id}">
        <div class="check ${done?"on":""}" data-toggle="${t.id}">${done?Icons.get("check",12):""}</div>
        <div class="task-body">
          <div class="task-title">${Utils.esc(t.titulo)}</div>
          <div class="task-meta">
            <span class="pill pill-${t.prioridad}">${t.prioridad==="alta"?"Alta":t.prioridad==="media"?"Media":"Baja"}</span>
            ${c ? `<span class="pill pill-course">${Icons.get("book",11)} ${Utils.esc(c)}</span>` : ""}
            <span>${Utils.minutesToLabel(t.tiempoEstMin)}</span>
          </div>
        </div>
        <div class="task-time">${Utils.timeHM(t.fecha) !== "00:00" ? Utils.to12h(t.hora) : ""}</div>
        <div class="row-actions">
          <button class="mini-btn" data-edit="${t.id}">${Icons.get("edit",13)}</button>
          <button class="mini-btn" data-del="${t.id}">${Icons.get("trash",13)}</button>
        </div>
      </div>`;
  }

  function timelineItemHTML(item) {
    const meta = Utils.CAT_META[item.kind === "evento" ? item.ref.tipo : "tarea"];
    const title = item.ref.titulo;
    const c = item.ref.courseId ? courseName(item.ref.courseId) : "";
    return `
      <div class="tl-item">
        <div class="tl-date">${Utils.relativeDay(item.ref.fecha)}</div>
        <div class="tl-dot ${meta.cls}"></div>
        <div class="tl-body">
          <div class="tl-title">${Utils.esc(title)}</div>
          <div class="tl-sub">${meta.label}${c ? " · " + Utils.esc(c) : ""}${item.kind==="evento" ? " · " + Utils.to12h(item.ref.horaInicio) : ""}</div>
        </div>
      </div>`;
  }

  function render() {
    const s = Store.getSettings();
    const nombre = App.firstName(s.nombre);
    const hoyEv = todaysEvents();
    const hoyTareas = todaysTasks();
    const pend = pendingTasks();
    const urg = urgentTasks();
    const prox = upcoming();
    const hoyPlan = paraHoy();

    document.getElementById("view").innerHTML = `
      <div class="greeting">
        <div>
          <h1>Hola, ${Utils.esc(nombre)}</h1>
          <div class="sub">${Utils.longDate(Utils.today())}</div>
        </div>
        <div class="streak-chip">${Icons.get("flame",15)} ${streakDays()} días de racha</div>
      </div>

      <div class="kpi-row">
        <div class="kpi k-hoy">
          <div class="kpi-label">${Icons.get("book",13)} Hoy</div>
          <div class="kpi-main">${hoyEv.length + hoyTareas.length} actividades</div>
          <div class="kpi-sub">${hoyEv.length} eventos · ${hoyTareas.length} tareas</div>
        </div>
        <div class="kpi k-tareas">
          <div class="kpi-label">${Icons.get("tasks",13)} Tareas</div>
          <div class="kpi-main">${pend.length} pendientes</div>
          <div class="kpi-sub">${urg.length} urgente${urg.length===1?"":"s"}</div>
        </div>
        <div class="kpi k-proximo">
          <div class="kpi-label">${Icons.get("calendar",13)} Próximo</div>
          <div class="kpi-main">${prox[0] ? Utils.esc(prox[0].ref.titulo) : "Nada por ahora"}</div>
          <div class="kpi-sub">${prox[0] ? Utils.relativeDay(prox[0].ref.fecha) : "Todo tranquilo"}</div>
        </div>
      </div>

      <div class="dash-grid">
        <div>
          <div class="section-head"><h2>Para hoy</h2><span class="hint">ordenado por prioridad</span></div>
          <div id="paraHoyList">
            ${hoyPlan.length ? hoyPlan.map(taskRowHTML).join("") : emptyState("sparkle","Nada urgente para hoy","Disfruta el momento o adelanta algo de tu lista.","tarea")}
          </div>
        </div>
        <div>
          <div class="section-head"><h2>Notas</h2><span class="hint">rápidas</span></div>
          <div class="card card-pad">${UINotas.render()}</div>
        </div>
      </div>

      <div class="section-head"><h2>Próximamente</h2><span class="hint">10 días</span></div>
      <div class="card card-pad">
        <div class="timeline">
          ${prox.length ? prox.map(timelineItemHTML).join("") : `<div class="empty"><div class="em-emoji">${Icons.get("sparkle",22)}</div><div class="em-title">Sin actividades próximas</div></div>`}
        </div>
      </div>
    `;

    wireRows();
    UINotas.wire();
  }

  function emptyState(iconName, title, sub, qaType) {
    return `<div class="empty">
      <div class="em-emoji">${Icons.get(iconName,22)}</div>
      <div class="em-title">${title}</div>
      <div class="em-sub">${sub}</div>
      <button class="btn btn-primary btn-sm" data-newof="${qaType}">${Icons.get("plus",13)} Agregar</button>
    </div>`;
  }

  function streakDays() {
    // racha simple basada en días consecutivos con al menos una sesión de estudio o tarea completada
    let streak = 0;
    for (let i=0;i<60;i++){
      const day = new Date(); day.setDate(day.getDate()-i);
      const hit = Store.all("study").some(s=>Utils.isSameDay(s.fecha, day)) ||
                  Store.all("tasks").some(t=>t.estado==="completada" && Utils.isSameDay(t.fecha, day));
      if (hit) streak++; else if (i===0) continue; else break;
    }
    return streak;
  }

  function wireRows() {
    document.querySelectorAll("[data-toggle]").forEach(el => {
      el.addEventListener("click", () => {
        const t = Store.get("tasks", el.dataset.toggle);
        const nowDone = t.estado !== "completada";
        Store.update("tasks", t.id, { estado: nowDone ? "completada" : "pendiente" });
        Utils.toast(nowDone ? "Tarea completada" : "Marcada como pendiente");
        App.refresh();
      });
    });
    document.querySelectorAll("[data-edit]").forEach(el => el.addEventListener("click", (e)=>{ e.stopPropagation(); QuickAdd.editTask(el.dataset.edit); }));
    document.querySelectorAll("[data-del]").forEach(el => el.addEventListener("click", (e)=>{
      e.stopPropagation();
      if (confirm("¿Eliminar esta tarea?")) { Store.remove("tasks", el.dataset.del); Utils.toast("Tarea eliminada"); App.refresh(); }
    }));
    document.querySelectorAll("[data-newof]").forEach(el => el.addEventListener("click", ()=> QuickAdd.newOfType(el.dataset.newof)));
  }

  return { render, taskRowHTML, emptyState, pendingTasks, upcoming };
})();
