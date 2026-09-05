/* ============================================================
   DASHBOARD UNP — ui-task-detail.js
   Modal de solo-lectura con el detalle completo de una tarea,
   abierto al hacer clic en su fila (no en check/editar/eliminar).
   Namespace global: UITaskDetail
   ============================================================ */
const UITaskDetail = (function () {

  function courseName(id) { const c = Store.get("courses", id); return c ? c.nombre : ""; }
  function courseColor(id) { const c = Store.get("courses", id); return c ? c.color : "var(--ink-faint)"; }

  const PRIORIDAD_LABEL = { alta: "Alta", media: "Media", baja: "Baja" };
  const ESTADO_LABEL = { pendiente: "Pendiente", "en progreso": "En progreso", completada: "Completada", atrasada: "Atrasada" };

  function detailHTML(t) {
    const c = t.courseId ? courseName(t.courseId) : "";
    const barColor = t.courseId ? courseColor(t.courseId) : "var(--border)";
    const atrasada = t.estado !== "completada" && Utils.daysBetween(Utils.today(), t.fecha) < 0;
    return `
      <div class="modal" style="max-width:460px;">
        <div class="modal-head" style="border-left:5px solid ${barColor};">
          <div>
            <h3>${Utils.esc(t.titulo)}</h3>
            <div style="font-size:12px;color:var(--ink-soft);margin-top:3px;">${c ? Utils.esc(c) : "Sin curso"}</div>
          </div>
          <div style="display:flex;gap:6px;">
            <button class="icon-btn" data-edittask="${t.id}">${Icons.get("edit",15)}</button>
            <button class="icon-btn" data-close>${Icons.get("x",15)}</button>
          </div>
        </div>
        <div class="modal-body">
          <div class="task-meta" style="margin-bottom:16px;">
            <span class="pill pill-${t.prioridad}">${PRIORIDAD_LABEL[t.prioridad]||t.prioridad}</span>
            <span class="pill ${t.estado==='completada'?'pill-baja':atrasada?'pill-alta':'pill-media'}">${atrasada ? "Atrasada" : (ESTADO_LABEL[t.estado]||t.estado)}</span>
          </div>

          <div class="cd-info-row" style="grid-template-columns:1fr 1fr;">
            <div class="cd-info-item">
              <span class="cd-info-ic">${Icons.get("calendar",15)}</span>
              <div><div class="cd-info-label">Fecha de entrega</div><div class="cd-info-value">${Utils.relativeDay(t.fecha)}${t.hora ? " · " + Utils.to12h(t.hora) : ""}</div></div>
            </div>
            <div class="cd-info-item">
              <span class="cd-info-ic">${Icons.get("clock",15)}</span>
              <div><div class="cd-info-label">Tiempo estimado</div><div class="cd-info-value">${Utils.minutesToLabel(t.tiempoEstMin)}</div></div>
            </div>
          </div>

          <div class="section-head"><h2>Descripción</h2></div>
          <p style="font-size:13px;color:var(--ink-soft);line-height:1.5;">${Utils.esc(t.descripcion || "Sin descripción registrada.")}</p>

          ${(t.etiquetas && t.etiquetas.length) ? `
            <div class="section-head"><h2>Etiquetas</h2></div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">${t.etiquetas.map(e=>`<span class="pill pill-course">${Utils.esc(e)}</span>`).join("")}</div>
          ` : ""}

          <div style="margin-top:20px;display:flex;gap:8px;">
            <button class="btn btn-sm ${t.estado==='completada' ? '' : 'btn-primary'}" data-togglemodal="${t.id}" style="flex:1;">
              ${t.estado==='completada' ? "Marcar como pendiente" : "Marcar como completada"}
            </button>
          </div>
        </div>
      </div>`;
  }

  function rebuildFormModal() {
    const ov = document.getElementById("overlayForm");
    ov.innerHTML = `
      <div class="modal">
        <div class="modal-head"><h3 id="formTitle">Nuevo</h3><button class="icon-btn" data-close>${Icons.get("x",15)}</button></div>
        <div class="modal-body" id="formBody"></div>
        <div class="modal-foot"><button class="btn" data-close>Cancelar</button><button class="btn btn-primary" id="formSave">Guardar</button></div>
      </div>`;
    ov.querySelectorAll("[data-close]").forEach(b=> b.addEventListener("click", QuickAdd.closeAll));
  }

  function open(id) {
    const t = Store.get("tasks", id);
    if (!t) return;
    const ov = document.getElementById("overlayForm");
    ov.querySelector(".modal").outerHTML = detailHTML(t);
    ov.classList.add("open");

    ov.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => { ov.classList.remove("open"); rebuildFormModal(); }));
    ov.addEventListener("click", function handler(e){ if (e.target===ov){ ov.classList.remove("open"); rebuildFormModal(); ov.removeEventListener("click", handler);} });

    ov.querySelector("[data-edittask]").addEventListener("click", () => { rebuildFormModal(); QuickAdd.editTask(t.id); });
    ov.querySelector("[data-togglemodal]").addEventListener("click", () => {
      Store.update("tasks", t.id, { estado: t.estado === "completada" ? "pendiente" : "completada" });
      Utils.toast(t.estado === "completada" ? "Marcada como pendiente" : "Tarea completada");
      ov.classList.remove("open");
      rebuildFormModal();
      App.refresh();
    });
  }

  return { open };
})();
