/* ============================================================
   DASHBOARD UNP — quickadd.js
   Modal "+ Agregar" y formularios reutilizables (crear/editar).
   Namespace global: QuickAdd
   ============================================================ */
const QuickAdd = (function () {

  const ovType = () => document.getElementById("overlayQuickAdd");
  const ovForm = () => document.getElementById("overlayForm");
  const formBody = () => document.getElementById("formBody");
  const formTitle = () => document.getElementById("formTitle");
  const formSave = () => document.getElementById("formSave");

  let onSaveHandler = null;
  let pendingInboxConversion = null; // id del inbox a eliminar SOLO si el guardado se completa

  function openTypeChooser() {
    closeAll();
    ovType().classList.add("open");
  }

  function closeAll() {
    ovType().classList.remove("open");
    ovForm().classList.remove("open");
    pendingInboxConversion = null;
  }

  function resolveInboxConversion(tipo) {
    if (pendingInboxConversion) {
      Store.update("inbox", pendingInboxConversion, { procesado: true, convertidoA: tipo });
      pendingInboxConversion = null;
    }
  }

  function courseOptions(selectedId) {
    return Store.all("courses").map(c =>
      `<option value="${c.id}" ${c.id === selectedId ? "selected" : ""}>${Utils.esc(c.nombre)}</option>`
    ).join("");
  }

  function toDateInput(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  function openForm(type, existing) {
    ovType().classList.remove("open");
    ovForm().classList.add("open");
    const isEdit = !!existing;

    const titles = {
      tarea: isEdit ? "Editar tarea" : "Nueva tarea",
      evento: isEdit ? "Editar evento" : "Nuevo evento",
      examen: isEdit ? "Editar examen" : "Nuevo examen",
      estudio: isEdit ? "Editar sesión de estudio" : "Nueva sesión de estudio",
      inbox: "Nuevo en Inbox",
    };
    formTitle().textContent = titles[type] || "Nuevo";

    if (type === "tarea") renderTaskForm(existing);
    else if (type === "evento" || type === "examen") renderEventForm(type, existing);
    else if (type === "estudio") renderStudyForm(existing);
    else if (type === "inbox") renderInboxForm(existing);
  }

  function renderTaskForm(t) {
    t = t || {};
    formBody().innerHTML = `
      <div class="field"><label>Título</label><input id="fTitulo" value="${Utils.esc(t.titulo||"")}" placeholder="Ej. Resolver ejercicios 1–20"></div>
      <div class="field-row">
        <div class="field"><label>Curso</label><select id="fCurso"><option value="">Sin curso</option>${courseOptions(t.courseId)}</select></div>
        <div class="field"><label>Tiempo estimado</label>
          <select id="fTiempo">
            ${[15,30,60,90,120,180,240].map(m=>`<option value="${m}" ${t.tiempoEstMin===m?"selected":""}>${Utils.minutesToLabel(m)}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="field-row">
        <div class="field"><label>Fecha de entrega</label><input type="date" id="fFecha" value="${toDateInput(t.fecha) || toDateInput(new Date())}"></div>
        <div class="field"><label>Hora</label><input type="time" id="fHora" value="${t.hora || "23:59"}"></div>
      </div>
      <div class="field"><label>Prioridad</label>
        <div class="seg" id="fPrioridad">
          <button data-v="alta" class="${(t.prioridad||"media")==="alta"?"active":""}">Alta</button>
          <button data-v="media" class="${(t.prioridad||"media")==="media"?"active":""}">Media</button>
          <button data-v="baja" class="${(t.prioridad||"media")==="baja"?"active":""}">Baja</button>
        </div>
      </div>
      <div class="field"><label>Descripción (opcional)</label><textarea id="fDesc" placeholder="Detalles...">${Utils.esc(t.descripcion||"")}</textarea></div>
    `;
    wireSeg("fPrioridad");

    formSave().onclick = () => {
      const titulo = document.getElementById("fTitulo").value.trim();
      if (!titulo) return Utils.toast("Ponle un título a la tarea");
      const fecha = document.getElementById("fFecha").value;
      const hora = document.getElementById("fHora").value || "23:59";
      const payload = {
        titulo,
        descripcion: document.getElementById("fDesc").value.trim(),
        courseId: document.getElementById("fCurso").value || null,
        fecha: fecha ? new Date(fecha + "T" + hora).toISOString() : new Date().toISOString(),
        hora,
        prioridad: document.querySelector("#fPrioridad button.active")?.dataset.v || "media",
        tiempoEstMin: Number(document.getElementById("fTiempo").value),
        estado: t.estado || "pendiente",
        etiquetas: t.etiquetas || [],
        subtareas: t.subtareas || [],
      };
      if (t.id) {
        Store.update("tasks", t.id, payload);
        Utils.toast("Tarea actualizada");
      } else {
        Store.add("tasks", payload, "t");
        resolveInboxConversion("tarea");
        Utils.toast("Tarea agregada");
      }
      closeAll();
      App.refresh();
    };
  }

  function renderEventForm(type, e) {
    e = e || {};
    const isExam = type === "examen";
    formBody().innerHTML = `
      <div class="field"><label>Título</label><input id="fTitulo" value="${Utils.esc(e.titulo||"")}" placeholder="${isExam?"Ej. PC2 Matemática III":"Ej. Reunión de grupo"}"></div>
      <div class="field-row">
        <div class="field"><label>Curso</label><select id="fCurso"><option value="">Sin curso</option>${courseOptions(e.courseId)}</select></div>
        <div class="field"><label>Tipo</label>
          <select id="fTipoEvento">
            <option value="evento" ${e.tipo==="evento"?"selected":""}>Evento</option>
            <option value="examen" ${(e.tipo==="examen"||isExam)?"selected":""}>Examen</option>
            <option value="clase" ${e.tipo==="clase"?"selected":""}>Clase</option>
            <option value="reunion" ${e.tipo==="reunion"?"selected":""}>Reunión</option>
            <option value="exposicion" ${e.tipo==="exposicion"?"selected":""}>Exposición</option>
          </select>
        </div>
      </div>
      <div class="field-row">
        <div class="field"><label>Fecha</label><input type="date" id="fFecha" value="${toDateInput(e.fecha) || toDateInput(new Date())}"></div>
        <div class="field"><label>Hora inicio</label><input type="time" id="fHoraIni" value="${e.horaInicio || "10:00"}"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Hora fin</label><input type="time" id="fHoraFin" value="${e.horaFin || "11:00"}"></div>
        <div class="field"><label>Ubicación</label><input id="fUbic" value="${Utils.esc(e.ubicacion||"")}" placeholder="Aula / link"></div>
      </div>
      <div class="field"><label>${isExam ? "Temas a evaluar" : "Descripción"}</label><textarea id="fDesc" placeholder="${isExam?"Derivadas, aplicaciones...":"Detalles..."}">${Utils.esc(e.descripcion||"")}</textarea></div>
      <div class="field"><label>Repetición</label>
        <select id="fRepite">
          <option value="no" ${(e.repite||"no")==="no"?"selected":""}>No se repite</option>
          <option value="semanal" ${e.repite==="semanal"?"selected":""}>Semanal</option>
        </select>
      </div>
    `;

    formSave().onclick = () => {
      const titulo = document.getElementById("fTitulo").value.trim();
      if (!titulo) return Utils.toast("Ponle un título al evento");
      const fecha = document.getElementById("fFecha").value;
      const horaIni = document.getElementById("fHoraIni").value || "00:00";
      const payload = {
        tipo: document.getElementById("fTipoEvento").value,
        titulo,
        courseId: document.getElementById("fCurso").value || null,
        fecha: fecha ? new Date(fecha + "T" + horaIni).toISOString() : new Date().toISOString(),
        horaInicio: horaIni,
        horaFin: document.getElementById("fHoraFin").value || horaIni,
        ubicacion: document.getElementById("fUbic").value.trim(),
        descripcion: document.getElementById("fDesc").value.trim(),
        repite: document.getElementById("fRepite").value,
      };
      if (e.id) {
        Store.update("events", e.id, payload);
        Utils.toast("Evento actualizado");
      } else {
        Store.add("events", payload, "e");
        resolveInboxConversion(payload.tipo === "examen" ? "examen" : "evento");
        Utils.toast(payload.tipo === "examen" ? "Examen agregado" : `Evento agregado — lo verás en Calendario el ${Utils.shortDate(payload.fecha)}`);
      }
      closeAll();
      App.refresh();
    };
  }

  function renderStudyForm(s) {
    s = s || {};
    formBody().innerHTML = `
      <div class="field"><label>Curso</label><select id="fCurso">${courseOptions(s.courseId)}</select></div>
      <div class="field"><label>Tema</label><input id="fTema" value="${Utils.esc(s.tema||"")}" placeholder="Ej. Lambda expressions"></div>
      <div class="field-row">
        <div class="field"><label>Fecha</label><input type="date" id="fFecha" value="${toDateInput(s.fecha) || toDateInput(new Date())}"></div>
        <div class="field"><label>Dificultad</label>
          <select id="fDificultad">
            <option value="baja" ${s.dificultad==="baja"?"selected":""}>Baja</option>
            <option value="media" ${(s.dificultad||"media")==="media"?"selected":""}>Media</option>
            <option value="alta" ${s.dificultad==="alta"?"selected":""}>Alta</option>
          </select>
        </div>
      </div>
      <div class="field-row">
        <div class="field"><label>Hora inicio</label><input type="time" id="fHoraIni" value="${s.horaInicio || "18:00"}"></div>
        <div class="field"><label>Hora fin</label><input type="time" id="fHoraFin" value="${s.horaFin || "19:00"}"></div>
      </div>
      <div class="field"><label>Comentarios</label><textarea id="fComentarios">${Utils.esc(s.comentarios||"")}</textarea></div>
    `;

    formSave().onclick = () => {
      const tema = document.getElementById("fTema").value.trim();
      if (!tema) return Utils.toast("Ponle un tema a la sesión");
      const fecha = document.getElementById("fFecha").value;
      const horaIni = document.getElementById("fHoraIni").value || "00:00";
      const horaFin = document.getElementById("fHoraFin").value || horaIni;
      const dur = Math.max(0, minutesDiff(horaIni, horaFin));
      const payload = {
        courseId: document.getElementById("fCurso").value || null,
        tema,
        fecha: fecha ? new Date(fecha + "T" + horaIni).toISOString() : new Date().toISOString(),
        horaInicio: horaIni,
        horaFin: horaFin,
        duracionMin: dur,
        dificultad: document.getElementById("fDificultad").value,
        comentarios: document.getElementById("fComentarios").value.trim(),
      };
      if (s.id) {
        Store.update("study", s.id, payload);
        Utils.toast("Sesión actualizada");
      } else {
        Store.add("study", payload, "s");
        Utils.toast("Sesión de estudio registrada");
      }
      closeAll();
      App.refresh();
    };
  }

  function renderInboxForm(i) {
    i = i || {};
    formBody().innerHTML = `
      <div class="field"><label>¿Qué quieres recordar?</label>
        <textarea id="fTexto" placeholder="Ej. Preguntar al profesor sobre PC2">${Utils.esc(i.texto||"")}</textarea>
      </div>
      <p style="font-size:12px;color:var(--ink-faint);">Podrás convertirlo luego en tarea, evento o recordatorio desde el Inbox.</p>
    `;
    formSave().onclick = () => {
      const texto = document.getElementById("fTexto").value.trim();
      if (!texto) return Utils.toast("Escribe algo para capturar");
      if (i.id) {
        Store.update("inbox", i.id, { texto });
        Utils.toast("Actualizado");
      } else {
        Store.add("inbox", { texto, fecha: new Date().toISOString(), procesado: false }, "i");
        Utils.toast("Capturado en Inbox");
      }
      closeAll();
      App.refresh();
    };
  }

  function minutesDiff(hIni, hFin) {
    const [h1,m1] = hIni.split(":").map(Number);
    const [h2,m2] = hFin.split(":").map(Number);
    return (h2*60+m2) - (h1*60+m1);
  }

  function wireSeg(id) {
    const seg = document.getElementById(id);
    seg.querySelectorAll("button").forEach(b => {
      b.addEventListener("click", () => {
        seg.querySelectorAll("button").forEach(x => x.classList.remove("active"));
        b.classList.add("active");
      });
    });
  }

  function init() {
    document.getElementById("btnAdd").addEventListener("click", openTypeChooser);
    document.getElementById("btnAddMobile").addEventListener("click", openTypeChooser);

    document.querySelectorAll("[data-qa]").forEach(opt => {
      opt.addEventListener("click", () => openForm(opt.dataset.qa, null));
    });

    document.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", closeAll));
    [ovType(), ovForm()].forEach(ov => {
      ov.addEventListener("click", (e) => { if (e.target === ov) closeAll(); });
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });
  }

  return {
    init, openTypeChooser, closeAll,
    editTask: (id) => openForm("tarea", Store.get("tasks", id)),
    editEvent: (id) => { const ev = Store.get("events", id); openForm(ev.tipo === "examen" ? "examen" : "evento", ev); },
    editStudy: (id) => openForm("estudio", Store.get("study", id)),
    editInbox: (id) => openForm("inbox", Store.get("inbox", id)),
    newOfType: (type) => openForm(type, null),
    // Convierte un ítem de Inbox en tarea/evento SIN borrarlo todavía —
    // solo se elimina del Inbox cuando el formulario se guarda con éxito.
    convertInboxTo: (inboxItem, type) => {
      pendingInboxConversion = inboxItem.id;
      openForm(type, null);
      const titleField = document.getElementById("fTitulo");
      if (titleField) titleField.value = inboxItem.texto;
    },
    // Abre el formulario de un tipo con la fecha ya preseleccionada (para "+ Evento" desde un día del calendario)
    newOnDate: (type, dateObj) => {
      openForm(type, null);
      const y = dateObj.getFullYear(), m = String(dateObj.getMonth()+1).padStart(2,"0"), d = String(dateObj.getDate()).padStart(2,"0");
      const f = document.getElementById("fFecha");
      if (f) f.value = `${y}-${m}-${d}`;
    },
  };
})();
