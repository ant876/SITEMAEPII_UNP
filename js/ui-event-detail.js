/* ============================================================
   DASHBOARD UNP — ui-event-detail.js
   Modal de solo-lectura con el detalle completo de un evento
   (evento/examen/reunión/exposición/clase), abierto al hacer clic
   en él desde cualquier parte de la app. Para exámenes, permite
   adjuntar material de repaso (imágenes).
   Namespace global: UIEventDetail
   ============================================================ */
const UIEventDetail = (function () {
  const MAX_IMG_BYTES = 2.2 * 1024 * 1024; // ~2.2MB por imagen (margen de localStorage)

  function courseName(id) { const c = Store.get("courses", id); return c ? c.nombre : ""; }
  function courseColor(id) { const c = Store.get("courses", id); return c ? c.color : "var(--ink-faint)"; }

  function materialesHTML(e) {
    const mats = e.materiales || [];
    return `
      <div class="section-head"><h2>Material de repaso</h2></div>
      <div class="evd-materials-grid" id="evdMaterialsGrid">
        ${mats.map(m => `
          <div class="evd-material-card" data-matid="${m.id}">
            <img src="${m.dataUrl}" alt="${Utils.esc(m.nombre)}">
            <button class="evd-material-remove" data-rmmat="${m.id}" title="Quitar">${Icons.get("x",12)}</button>
          </div>`).join("")}
        <label class="evd-material-add">
          ${Icons.get("plus",16)}
          <span>Subir imagen</span>
          <input type="file" accept="image/*" id="evdFileInput" style="display:none;">
        </label>
      </div>
      <p class="evd-material-hint">Guarda fotos de tus apuntes, la rúbrica o el sílabo del examen para repasar rápido. Máx. ~2 MB por imagen.</p>`;
  }

  function detailHTML(e) {
    const meta = Utils.CAT_META[e.tipo] || Utils.CAT_META.evento;
    const c = e.courseId ? courseName(e.courseId) : "";
    const barColor = e.courseId ? courseColor(e.courseId) : "var(--border)";
    const isExamen = e.tipo === "examen";
    const d = Utils.daysBetween(Utils.today(), e.fecha);
    const atrasado = d < 0;

    return `
      <div class="modal" style="max-width:480px;">
        <div class="modal-head" style="border-left:5px solid ${barColor};">
          <div>
            <h3>${Utils.esc(e.titulo)}</h3>
            <div style="font-size:12px;color:var(--ink-soft);margin-top:3px;">${c ? Utils.esc(c) : "Sin curso"}</div>
          </div>
          <div style="display:flex;gap:6px;">
            <button class="icon-btn" data-editevt="${e.id}">${Icons.get("edit",15)}</button>
            <button class="icon-btn" data-close>${Icons.get("x",15)}</button>
          </div>
        </div>
        <div class="modal-body">
          <div class="task-meta" style="margin-bottom:16px;">
            <span class="pill ${isExamen ? "pill-alta" : "pill-media"}">${meta.label}</span>
            ${atrasado ? `<span class="pill pill-alta">${Icons.get("alert",11)} Atrasado</span>` : ""}
            ${e.repite && e.repite !== "no" ? `<span class="pill pill-course">Repite: ${Utils.esc(e.repite)}</span>` : ""}
          </div>

          <div class="cd-info-row" style="grid-template-columns:1fr 1fr;">
            <div class="cd-info-item">
              <span class="cd-info-ic">${Icons.get("calendar",15)}</span>
              <div><div class="cd-info-label">Fecha</div><div class="cd-info-value">${Utils.relativeDay(e.fecha)}${e.horaInicio ? " · " + Utils.to12h(e.horaInicio) : ""}${e.horaFin && e.horaFin !== e.horaInicio ? " – " + Utils.to12h(e.horaFin) : ""}</div></div>
            </div>
            <div class="cd-info-item">
              <span class="cd-info-ic">${Icons.get("pin",15)}</span>
              <div><div class="cd-info-label">Ubicación</div><div class="cd-info-value">${Utils.esc(e.ubicacion || "—")}</div></div>
            </div>
          </div>

          ${e.enlace ? `
          <div class="cd-info-item" style="margin-top:10px;">
            <span class="cd-info-ic">${Icons.get("link",15)}</span>
            <div style="min-width:0;"><div class="cd-info-label">Enlace</div><a class="cd-info-value evd-link" href="${Utils.esc(e.enlace)}" target="_blank" rel="noopener">${Utils.esc(e.enlace)}</a></div>
          </div>` : ""}

          <div class="section-head"><h2>${isExamen ? "Temas a evaluar" : "Descripción"}</h2></div>
          <p style="font-size:13px;color:var(--ink-soft);line-height:1.5;">${Utils.esc(e.descripcion || "Sin detalles registrados.")}</p>

          ${isExamen ? materialesHTML(e) : ""}
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
    const e = Store.get("events", id);
    if (!e) return;
    const ov = document.getElementById("overlayForm");
    ov.querySelector(".modal").outerHTML = detailHTML(e);
    ov.classList.add("open");

    ov.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => { ov.classList.remove("open"); rebuildFormModal(); }));
    ov.addEventListener("click", function handler(ev){ if (ev.target===ov){ ov.classList.remove("open"); rebuildFormModal(); ov.removeEventListener("click", handler);} });
    ov.querySelector("[data-editevt]").addEventListener("click", () => { rebuildFormModal(); QuickAdd.editEvent(e.id); });

    const fileInput = ov.querySelector("#evdFileInput");
    if (fileInput) {
      fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (!file) return;
        if (file.size > MAX_IMG_BYTES) return Utils.toast("La imagen pesa demasiado (máx. ~2 MB)");
        const reader = new FileReader();
        reader.onload = () => {
          const materiales = [...(e.materiales || []), { id: Store.uid("mat"), nombre: file.name, dataUrl: reader.result }];
          try {
            Store.update("events", e.id, { materiales });
            Utils.toast("Material agregado");
            open(e.id);
          } catch (err) {
            Utils.toast("No se pudo guardar la imagen (espacio local lleno)");
          }
        };
        reader.readAsDataURL(file);
      });
    }
    ov.querySelectorAll("[data-rmmat]").forEach(btn => {
      btn.addEventListener("click", () => {
        const materiales = (e.materiales || []).filter(m => m.id !== btn.dataset.rmmat);
        Store.update("events", e.id, { materiales });
        open(e.id);
      });
    });
  }

  return { open };
})();
