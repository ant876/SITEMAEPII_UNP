/* ============================================================
   DASHBOARD UNP — ui-cursos.js
   Namespace global: UICursos
   ============================================================ */
const UICursos = (function () {
  let schedRows = []; // estado temporal del editor de horario mientras el formulario está abierto

  function activitiesOf(courseId) {
    const ev = Store.all("events").filter(e => e.courseId === courseId);
    const tk = Store.all("tasks").filter(t => t.courseId === courseId && t.estado !== "completada");
    return { ev, tk };
  }

  function cardHTML(c) {
    const { ev, tk } = activitiesOf(c.id);
    return `
      <div class="course-card" data-open="${c.id}">
        <div class="course-top" style="background:${c.color};">
          <div class="cname">${Utils.esc(c.nombre)}</div>
          <div class="cprof">${Utils.esc(c.profesor||"DOCENTE POR ASIGNAR")}${c.seccion ? ` · Sección ${Utils.esc(c.seccion)}` : ""}</div>
        </div>
        <div class="course-bot">
          <div class="crow"><span>Créditos</span><b style="color:var(--ink);">${c.creditos}</b></div>
          <div class="crow"><span>Aula</span><span>${Utils.esc(c.aula||"—")}</span></div>
          <div class="crow"><span>Pendientes</span><span>${tk.length} tareas</span></div>
          <span class="course-badge">${ev.length} actividad${ev.length===1?"":"es"} próxima${ev.length===1?"":"s"}</span>
        </div>
      </div>`;
  }

  function resourceMeta(label) {
    const l = (label || "").toLowerCase();
    if (l.includes("sílabo") || l.includes("silabo") || l.includes("syllabus")) return { tag: "SÍLABO", icon: "note" };
    if (l.includes("drive") || l.includes("carpeta")) return { tag: "DRIVE", icon: "folder" };
    if (l.includes("classroom")) return { tag: "CLASSROOM", icon: "link" };
    if (l.includes("ejercicio") || l.includes("guía") || l.includes("guia") || l.includes("práctica") || l.includes("practica")) return { tag: "EJERCICIOS", icon: "book" };
    return { tag: "ENLACE", icon: "link" };
  }

  function findQuickLink(resources, keyword) {
    return resources.find(r => (r.label || "").toLowerCase().includes(keyword));
  }

  function detailHTML(c) {
    const tasksAll = Store.all("tasks").filter(t => t.courseId === c.id).sort((a,b)=> new Date(a.fecha)-new Date(b.fecha));
    const examenes = Store.all("events").filter(e => e.courseId === c.id && e.tipo === "examen").sort((a,b)=> new Date(a.fecha)-new Date(b.fecha));
    const res = Store.all("resources").filter(r => r.courseId === c.id);
    const drive = findQuickLink(res, "drive");
    const classroom = findQuickLink(res, "classroom");
    const ink = Utils.contrastColor(c.color);

    return `
      <div class="modal cd-modal">
        <div class="cd-header" style="background:${c.color};color:${ink};">
          <div class="cd-header-top">
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
              ${c.codigo ? `<span class="cd-badge" style="color:${ink};border-color:${ink}55;">${Utils.esc(c.codigo)}</span>` : ""}
              <span class="cd-badge" style="color:${ink};border-color:${ink}55;">${Icons.get("book",11)} ${c.creditos} Créditos</span>
              ${c.seccion ? `<span class="cd-badge" style="color:${ink};border-color:${ink}55;">Sección ${Utils.esc(c.seccion)}</span>` : ""}
            </div>
            <div style="display:flex;gap:6px;">
              ${drive ? `<a class="cd-quick-link" href="${Utils.esc(drive.url)}" target="_blank" rel="noopener" style="color:${ink};border-color:${ink}55;">${Icons.get("folder",13)} Drive</a>` : ""}
              ${classroom ? `<a class="cd-quick-link" href="${Utils.esc(classroom.url)}" target="_blank" rel="noopener" style="color:${ink};border-color:${ink}55;">${Icons.get("link",13)} Classroom</a>` : ""}
              <button class="icon-btn" data-editcourse="${c.id}" style="background:${ink}22;border-color:transparent;color:${ink};">${Icons.get("edit",15)}</button>
              <button class="icon-btn" data-close style="background:${ink}22;border-color:transparent;color:${ink};">${Icons.get("x",15)}</button>
            </div>
          </div>
          <h3 style="color:${ink};margin-top:10px;">${Utils.esc(c.nombre)}</h3>
        </div>

        <div class="modal-body">
          <div class="cd-info-row">
            <div class="cd-info-item">
              <span class="cd-info-ic">${Icons.get("user",14)}</span>
              <div><div class="cd-info-label">Docente responsable</div><div class="cd-info-value">${Utils.esc(c.profesor || "Por asignar")}</div></div>
            </div>
            <div class="cd-info-item">
              <span class="cd-info-ic">${Icons.get("pin",14)}</span>
              <div><div class="cd-info-label">Aula / Pabellón</div><div class="cd-info-value">${Utils.esc(c.aula || "—")}</div></div>
            </div>
          </div>

          <div class="cd-grid">
            <div>
              <div class="section-head" style="margin-top:0;"><h2>${Icons.get("clock",12)} Horario semanal de clases</h2></div>
              <div class="cd-sched-row">
                ${(c.horario||[]).map(h=>`
                  <div class="cd-sched-chip">
                    <b>${h.dia}</b>
                    <span class="cd-time-pill">${Utils.to12h(h.inicio)} – ${Utils.to12h(h.fin)}</span>
                    ${c.aula ? `<span class="cd-sched-aula">${Utils.esc(c.aula)}</span>` : ""}
                  </div>`).join("") || `<p style="color:var(--ink-faint);font-size:13px;">Sin horario registrado.</p>`}
              </div>

              <div class="section-head"><h2>Sumilla y contenido</h2></div>
              <p class="cd-sumilla">${Utils.esc(c.descripcion || "Sin descripción registrada aún.")}</p>

              <div class="section-head">
                <h2>${Icons.get("folder",12)} Materiales del curso</h2>
                <button class="btn btn-sm" id="btnAddResourceInline">${Icons.get("plus",12)} Agregar enlace</button>
              </div>
              <div class="cd-materials-grid">
                ${res.length ? res.map(r => {
                  const meta = resourceMeta(r.label);
                  return `<a class="cd-material-card" href="${Utils.esc(r.url)}" target="_blank" rel="noopener">
                    <span class="cd-material-ic">${Icons.get(meta.icon,15)}</span>
                    <span class="cd-material-title">${Utils.esc(r.label)} ${Icons.get("link",10)}</span>
                    <span class="cd-material-tag">${meta.tag}</span>
                  </a>`;
                }).join("") : `<p style="color:var(--ink-faint);font-size:13px;">Sin recursos vinculados aún.</p>`}
              </div>
            </div>

            <div>
              <div class="section-head" style="margin-top:0;"><h2>${Icons.get("tasks",12)} Tareas del curso</h2><span class="hint">${tasksAll.length}</span></div>
              <div class="cd-task-list">
                ${tasksAll.length ? tasksAll.map(t => `
                  <div class="cd-task-item">
                    <div class="cd-task-top">
                      <span class="pill ${t.estado==='completada' ? 'pill-baja' : 'pill-media'}">${t.estado==='completada' ? 'Completada' : 'Pendiente'}</span>
                      <span class="cd-task-date">${Utils.shortDate(t.fecha)}</span>
                    </div>
                    <div class="cd-task-title ${t.estado==='completada'?'is-done':''}">${Utils.esc(t.titulo)}</div>
                  </div>`).join("") : `<p style="color:var(--ink-faint);font-size:13px;">Sin tareas registradas.</p>`}
              </div>

              <div class="section-head"><h2>${Icons.get("target",12)} Exámenes y evaluaciones</h2></div>
              ${examenes.length ? examenes.map(e => `
                <div class="cd-exam-card">
                  <b>${Utils.esc(e.titulo)}</b>
                  <div class="cd-exam-meta">${Utils.shortDate(e.fecha)} · ${Utils.to12h(e.horaInicio)}</div>
                  ${e.ubicacion ? `<div class="cd-exam-meta">${Utils.esc(e.ubicacion)}</div>` : ""}
                </div>`).join("") : `<p style="color:var(--ink-faint);font-size:13px;">Sin exámenes programados.</p>`}
            </div>
          </div>
        </div>
      </div>`;
  }

  function render() {
    const cursos = Store.all("courses");
    document.getElementById("view").innerHTML = `
      <div class="toolbar">
        <button class="btn btn-primary btn-sm" id="btnNewCourse">${Icons.get("plus",13)} Nuevo curso</button>
        <button class="btn btn-sm" id="btnShowSchedule">${Icons.get("grid",13)} Mostrar horario</button>
      </div>
      <div class="course-grid">
        ${cursos.length ? cursos.map(cardHTML).join("") : UIDashboard.emptyState("book","Aún no registras cursos","Agrega tu primer curso para organizar tus tareas por materia.","tarea")}
      </div>
    `;

    document.querySelectorAll("[data-open]").forEach(el => el.addEventListener("click", ()=> openDetail(el.dataset.open)));
    document.getElementById("btnNewCourse").addEventListener("click", ()=> openCourseForm(null));
    document.getElementById("btnShowSchedule").addEventListener("click", ()=> App.go("horario"));
  }

  function openDetail(id) {
    const c = Store.get("courses", id);
    const ov = document.getElementById("overlayForm");
    ov.querySelector(".modal").outerHTML = detailHTML(c);
    ov.classList.add("open");
    ov.querySelectorAll("[data-close]").forEach(b=> b.addEventListener("click", ()=>{ ov.classList.remove("open"); rebuildFormModal(); }));
    ov.querySelector("[data-editcourse]").addEventListener("click", ()=> openCourseForm(c.id));
    const addResBtn = ov.querySelector("#btnAddResourceInline");
    if (addResBtn) addResBtn.addEventListener("click", () => UIRecursos.openResourceFormFor(c.id, () => openDetail(c.id)));
    ov.addEventListener("click", function handler(e){ if (e.target===ov){ ov.classList.remove("open"); rebuildFormModal(); ov.removeEventListener("click", handler);} });
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

  // ---------- Formulario de curso (crear / editar), con editor de horario por bloques oficiales ----------
  function openCourseForm(courseId) {
    rebuildFormModal();
    const ov = document.getElementById("overlayForm");
    const c = courseId ? Store.get("courses", courseId) : null;
    schedRows = c ? JSON.parse(JSON.stringify(c.horario || [])) : [];

    document.getElementById("formTitle").textContent = c ? "Editar curso" : "Nuevo curso";
    document.getElementById("formBody").innerHTML = `
      <div class="field-row">
        <div class="field"><label>Código del curso</label><input id="fCodigo" value="${Utils.esc(c?.codigo||"")}" placeholder="Ej. MAT-301" style="text-transform:uppercase;"></div>
        <div class="field"><label>Créditos</label><input id="fCred" type="number" min="1" max="8" value="${c?.creditos||3}"></div>
      </div>
      <div class="field"><label>Nombre del curso</label><input id="fNombre" value="${Utils.esc(c?.nombre||"")}" placeholder="Ej. CÁLCULO I" style="text-transform:uppercase;"></div>
      <div class="field-row">
        <div class="field"><label>Profesor</label><input id="fProf" value="${Utils.esc(c?.profesor||"")}" placeholder="Nombre del docente" style="text-transform:uppercase;"></div>
        <div class="field"><label>Sección</label>
          <select id="fSeccion">
            <option value="" ${!c?.seccion?"selected":""}>Sin especificar</option>
            <option value="1" ${c?.seccion==="1"?"selected":""}>1</option>
            <option value="2" ${c?.seccion==="2"?"selected":""}>2</option>
            <option value="3" ${c?.seccion==="3"?"selected":""}>3</option>
            <option value="4" ${c?.seccion==="4"?"selected":""}>4</option>
          </select>
        </div>
      </div>
      <div class="field"><label>Aula</label><input id="fAula" value="${Utils.esc(c?.aula||"")}" placeholder="Ej. Pab. A - 204"></div>
      <div class="field"><label>Color</label><input id="fColor" type="color" value="${c?.color||"#2455A4"}"></div>

      <div class="field">
        <label>Horario (según plantilla horaria oficial)</label>
        <div id="schedRowsWrap"></div>
        <button type="button" class="btn btn-sm" id="btnAddSched">${Icons.get("plus",12)} Agregar bloque de horario</button>
      </div>

      <div class="field"><label>Descripción</label><textarea id="fDescC">${Utils.esc(c?.descripcion||"")}</textarea></div>
    `;
    ov.classList.add("open");
    renderSchedRows();
    document.getElementById("btnAddSched").addEventListener("click", () => {
      const firstOpt = Bloques.selectOptions()[0];
      schedRows.push({ dia: "Lunes", inicio: firstOpt.ini, fin: firstOpt.fin });
      renderSchedRows();
    });

    document.getElementById("formSave").onclick = () => {
      const nombre = document.getElementById("fNombre").value.trim();
      if (!nombre) return Utils.toast("Ponle un nombre al curso");
      const payload = {
        nombre: nombre.toUpperCase(),
        codigo: document.getElementById("fCodigo").value.trim().toUpperCase(),
        profesor: document.getElementById("fProf").value.trim().toUpperCase(),
        seccion: document.getElementById("fSeccion").value.trim(),
        creditos: Number(document.getElementById("fCred").value)||3,
        aula: document.getElementById("fAula").value.trim(),
        color: document.getElementById("fColor").value,
        horario: schedRows,
        descripcion: document.getElementById("fDescC").value.trim(),
      };
      if (c) {
        Store.update("courses", c.id, payload);
        Utils.toast("Curso actualizado");
      } else {
        Store.add("courses", payload, "c");
        Utils.toast("Curso agregado");
      }
      QuickAdd.closeAll();
      App.refresh();
    };
  }

  function renderSchedRows() {
    const wrap = document.getElementById("schedRowsWrap");
    if (!wrap) return;
    const opts = Bloques.selectOptions();
    wrap.innerHTML = schedRows.map((h, i) => {
      const currentValue = opts.find(o => o.ini === h.inicio && o.fin === h.fin)?.value || "";
      return `
      <div class="sched-row" data-i="${i}">
        <select data-f="dia">${Bloques.DIAS.map(d=>`<option value="${d}" ${h.dia===d?"selected":""}>${d}</option>`).join("")}</select>
        <select data-f="bloque">
          ${!currentValue ? `<option value="" selected disabled>Horario libre (${Utils.to12h(h.inicio)} – ${Utils.to12h(h.fin)})</option>` : ""}
          ${opts.map(o=>`<option value="${o.value}" ${o.value===currentValue?"selected":""}>${o.label}</option>`).join("")}
        </select>
        <button type="button" class="mini-btn" data-rmsched="${i}">${Icons.get("trash",12)}</button>
      </div>
    `;
    }).join("") || `<p style="font-size:12px;color:var(--ink-faint);margin:2px 0 8px;">Sin bloques de horario. Agrega al menos uno.</p>`;

    wrap.querySelectorAll(".sched-row").forEach(row => {
      const i = Number(row.dataset.i);
      row.querySelector('[data-f="dia"]').addEventListener("change", (e) => { schedRows[i].dia = e.target.value; });
      row.querySelector('[data-f="bloque"]').addEventListener("change", (e) => {
        const opt = opts.find(o => o.value === e.target.value);
        if (opt) { schedRows[i].inicio = opt.ini; schedRows[i].fin = opt.fin; }
      });
    });
    wrap.querySelectorAll("[data-rmsched]").forEach(btn => {
      btn.addEventListener("click", () => { schedRows.splice(Number(btn.dataset.rmsched), 1); renderSchedRows(); });
    });
  }

  return { render, rebuildFormModal };
})();
