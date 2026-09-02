/* ============================================================
   DASHBOARD UNP — ui-estudio.js
   Namespace global: UIEstudio
   ============================================================ */
const UIEstudio = (function () {
  function courseName(id) { const c = Store.get("courses", id); return c ? c.nombre : "Sin curso"; }
  function courseColor(id) { const c = Store.get("courses", id); return c ? c.color : "var(--ink-faint)"; }

  function rowHTML(s) {
    return `
      <div class="study-row" data-id="${s.id}">
        <div style="width:4px;align-self:stretch;border-radius:4px;background:${courseColor(s.courseId)};"></div>
        <div style="flex:1;">
          <div class="task-title">${Utils.esc(s.tema)}</div>
          <div class="task-meta">
            <span class="pill pill-course">${Icons.get("book",11)} ${Utils.esc(courseName(s.courseId))}</span>
            <span>${Utils.relativeDay(s.fecha)} · ${Utils.to12h(s.horaInicio)}–${Utils.to12h(s.horaFin)}</span>
            <span>Dificultad: ${s.dificultad}</span>
          </div>
        </div>
        <div class="study-dur">${Utils.minutesToLabel(s.duracionMin)}</div>
        <div class="row-actions" style="opacity:1;">
          <button class="mini-btn" data-edit="${s.id}">${Icons.get("edit",13)}</button>
          <button class="mini-btn" data-del="${s.id}">${Icons.get("trash",13)}</button>
        </div>
      </div>`;
  }

  function render() {
    const sessions = [...Store.all("study")].sort((a,b)=> new Date(b.fecha)-new Date(a.fecha));
    const totalMin = sessions.reduce((a,s)=>a+s.duracionMin,0);

    document.getElementById("view").innerHTML = `
      <div class="kpi-row" style="grid-template-columns:1fr 1fr;">
        <div class="kpi k-hoy"><div class="kpi-label">${Icons.get("clock",13)} Total registrado</div><div class="kpi-main">${Utils.minutesToLabel(totalMin)}</div><div class="kpi-sub">${sessions.length} sesiones</div></div>
        <div class="kpi k-tareas"><div class="kpi-label">${Icons.get("book",13)} Cursos distintos</div><div class="kpi-main">${new Set(sessions.map(s=>s.courseId)).size}</div><div class="kpi-sub">estudiados hasta ahora</div></div>
      </div>
      <div class="toolbar"><button class="btn btn-primary btn-sm" data-newof="estudio">${Icons.get("plus",13)} Registrar sesión</button></div>
      <div>${sessions.length ? sessions.map(rowHTML).join("") : UIDashboard.emptyState("clock","Aún no registras sesiones","Registra tu primera sesión de estudio.","estudio")}</div>
    `;

    document.querySelectorAll("[data-newof]").forEach(el => el.addEventListener("click", ()=> QuickAdd.newOfType(el.dataset.newof)));
    document.querySelectorAll("[data-edit]").forEach(el => el.addEventListener("click", ()=> QuickAdd.editStudy(el.dataset.edit)));
    document.querySelectorAll("[data-del]").forEach(el => el.addEventListener("click", ()=>{
      if (confirm("¿Eliminar esta sesión?")) { Store.remove("study", el.dataset.del); Utils.toast("Sesión eliminada"); App.refresh(); }
    }));
  }

  return { render };
})();
