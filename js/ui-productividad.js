/* ============================================================
   DASHBOARD UNP — ui-productividad.js
   Antes mostraba estadísticas de tiempo; ahora es la vista
   "Exámenes y Eventos": todo lo creado como Examen/Evento desde
   + Agregar, priorizado por urgencia (exámenes primero).
   Namespace global: UIProductividad
   ============================================================ */
const UIProductividad = (function () {

  function courseName(id) { const c = Store.get("courses", id); return c ? c.nombre : ""; }
  function courseColor(id) { const c = Store.get("courses", id); return c ? c.color : "var(--ink-faint)"; }

  // Urgencia: más alto = más prioritario (más cerca o ya vencido)
  function urgency(fecha) {
    const d = Utils.daysBetween(Utils.today(), fecha);
    if (d < 0) return 100 - d;   // atrasado: mientras más atrasado, más arriba
    if (d === 0) return 90;
    if (d === 1) return 80;
    if (d <= 3) return 60;
    if (d <= 7) return 40;
    return 20 - Math.min(d, 20);
  }

  function rowHTML(e) {
    const isExamen = e.tipo === "examen";
    const meta = Utils.CAT_META[e.tipo] || Utils.CAT_META.evento;
    const d = Utils.daysBetween(Utils.today(), e.fecha);
    const atrasado = d < 0;
    const c = e.courseId ? courseName(e.courseId) : "";
    return `
      <div class="task-row" data-id="${e.id}" style="border-left:3px solid ${e.courseId ? courseColor(e.courseId) : "var(--border)"};">
        <div style="width:8px;height:8px;border-radius:50%;flex-shrink:0;" class="${meta.cls}"></div>
        <div class="task-body">
          <div class="task-title">${isExamen ? "<strong>" : ""}${Utils.esc(e.titulo)}${isExamen ? "</strong>" : ""}</div>
          <div class="task-meta">
            <span class="pill ${isExamen ? "pill-alta" : "pill-media"}">${meta.label}</span>
            ${c ? `<span class="pill pill-course">${Icons.get("book",11)} ${Utils.esc(c)}</span>` : ""}
            <span>${atrasado ? `${Icons.get("alert",11)} Atrasado` : Utils.relativeDay(e.fecha)}${e.horaInicio ? " · " + Utils.to12h(e.horaInicio) : ""}</span>
          </div>
        </div>
        <div class="row-actions" style="opacity:1;">
          <button class="mini-btn" data-edit="${e.id}">${Icons.get("edit",13)}</button>
          <button class="mini-btn" data-del="${e.id}">${Icons.get("trash",13)}</button>
        </div>
      </div>`;
  }

  function render() {
    const all = Store.all("events");
    const examenes = all.filter(e => e.tipo === "examen").sort((a,b)=> urgency(b.fecha) - urgency(a.fecha));
    const otros = all.filter(e => e.tipo !== "examen" && e.tipo !== "clase").sort((a,b)=> urgency(b.fecha) - urgency(a.fecha));

    document.getElementById("view").innerHTML = `
      <div class="section-head" style="margin-top:0;"><h2>Exámenes</h2><span class="hint">${examenes.length} en total</span></div>
      <div>
        ${examenes.length ? examenes.map(rowHTML).join("") : UIDashboard.emptyState("target","Sin exámenes registrados","Los que agregues desde + Agregar aparecerán aquí, priorizados.","examen")}
      </div>

      <div class="section-head"><h2>Otros eventos de tus cursos</h2><span class="hint">${otros.length} en total</span></div>
      <div>
        ${otros.length ? otros.map(rowHTML).join("") : UIDashboard.emptyState("calendar","Sin otros eventos","Reuniones, exposiciones y entregas aparecerán aquí.","evento")}
      </div>
    `;

    document.querySelectorAll("[data-edit]").forEach(el => el.addEventListener("click", () => QuickAdd.editEvent(el.dataset.edit)));
    document.querySelectorAll("[data-del]").forEach(el => el.addEventListener("click", () => {
      if (confirm("¿Eliminar este elemento?")) { Store.remove("events", el.dataset.del); Utils.toast("Eliminado"); App.refresh(); }
    }));
    document.querySelectorAll("[data-newof]").forEach(el => el.addEventListener("click", () => QuickAdd.newOfType(el.dataset.newof)));
  }

  return { render };
})();
