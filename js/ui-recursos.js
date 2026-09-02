/* ============================================================
   DASHBOARD UNP — ui-recursos.js
   Namespace global: UIRecursos
   ============================================================ */
const UIRecursos = (function () {

  function blockHTML(c) {
    const res = Store.all("resources").filter(r => r.courseId === c.id);
    return `
      <div class="res-course-block">
        <div class="section-head"><h2>${Icons.get("book",14)} ${Utils.esc(c.nombre)}</h2><button class="btn btn-sm" data-addres="${c.id}">${Icons.get("plus",12)} Enlace</button></div>
        ${res.length ? res.map(r=>`
          <div class="res-link">
            <a href="${Utils.esc(r.url)}" target="_blank" rel="noopener">${Icons.get("link",13)} ${Utils.esc(r.label)}</a>
            <button class="mini-btn" data-delres="${r.id}">${Icons.get("trash",13)}</button>
          </div>`).join("") : `<p style="font-size:12.5px;color:var(--ink-faint);">Sin enlaces todavía.</p>`}
      </div>`;
  }

  function render() {
    const cursos = Store.all("courses");
    document.getElementById("view").innerHTML = cursos.length
      ? cursos.map(blockHTML).join("")
      : UIDashboard.emptyState("folder","Aún no hay cursos","Crea un curso primero para vincular recursos.","tarea");

    document.querySelectorAll("[data-addres]").forEach(el => el.addEventListener("click", () => openResourceForm(el.dataset.addres)));
    document.querySelectorAll("[data-delres]").forEach(el => el.addEventListener("click", () => {
      Store.remove("resources", el.dataset.delres); Utils.toast("Recurso eliminado"); App.refresh();
    }));
  }

  function openResourceForm(courseId) {
    openResourceFormFor(courseId, null);
  }

  function openResourceFormFor(courseId, onSaved) {
    UICursos.rebuildFormModal();
    const ov = document.getElementById("overlayForm");
    document.getElementById("formTitle").textContent = "Nuevo recurso";
    document.getElementById("formBody").innerHTML = `
      <div class="field"><label>Nombre</label><input id="fLabel" placeholder="Ej. Sílabo, Classroom, Material..."></div>
      <div class="field"><label>Enlace (URL)</label><input id="fUrl" placeholder="https://..."></div>
    `;
    ov.classList.add("open");
    document.getElementById("formSave").onclick = () => {
      const label = document.getElementById("fLabel").value.trim();
      const url = document.getElementById("fUrl").value.trim();
      if (!label || !url) return Utils.toast("Completa nombre y enlace");
      Store.add("resources", { courseId, label, url }, "r");
      Utils.toast("Recurso agregado");
      QuickAdd.closeAll();
      if (onSaved) onSaved(); else App.refresh();
    };
  }

  return { render, openResourceFormFor };
})();
