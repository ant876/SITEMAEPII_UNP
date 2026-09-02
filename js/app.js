/* ============================================================
   DASHBOARD UNP — app.js
   Router, navegación, tema e hidratación de íconos. Namespace: App
   ============================================================ */
const App = (function () {
  const VIEWS = {
    dashboard:      { title: "Inicio",         inNav: true,  render: () => UIDashboard.render() },
    tareas:         { title: "Tareas",         inNav: true,  render: () => UITareas.render() },
    calendario:     { title: "Calendario",     inNav: true,  render: () => UICalendario.render() },
    cursos:         { title: "Cursos",         inNav: true,  render: () => UICursos.render() },
    horario:        { title: "Horario",        inNav: false, render: () => UIHorario.render() },
    estudio:        { title: "Estudio",        inNav: false, render: () => UIEstudio.render() },
    inbox:          { title: "Inbox",          inNav: true,  render: () => UIInbox.render() },
    recursos:       { title: "Recursos",       inNav: true,  render: () => UIRecursos.render() },
    objetivos:      { title: "Objetivos",      inNav: false, render: () => UIObjetivos.render() },
    productividad:  { title: "Exámenes y Eventos", inNav: true,  render: () => UIProductividad.render() },
    configuracion:  { title: "Configuración",  inNav: true,  render: () => UIConfiguracion.render() },
  };

  let current = "dashboard";

  function go(view) {
    if (!VIEWS[view]) view = "dashboard";
    current = view;
    location.hash = view;
    refresh();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function refresh() {
    const v = VIEWS[current];
    document.getElementById("viewTitle").textContent = v.title;
    v.render();
    Icons.hydrate(document.getElementById("view"));
    if (v.inNav) updateNavActive();
    updateHeader();
  }

  function updateNavActive() {
    document.querySelectorAll(".nav-item, .mnav-item").forEach(el => {
      el.classList.toggle("active", el.dataset.view === current);
    });
  }

  function firstName(fullName) {
    return (fullName || "Estudiante").trim().split(/\s+/)[0];
  }

  function updateHeader() {
    document.getElementById("dateLine").textContent = Utils.longDate(Utils.today());
    document.getElementById("todayMini").textContent = Utils.shortDate(Utils.today());
    const s = Store.getSettings();
    const cicloTxt = (s.ciclo ? s.ciclo : "—") + (s.cicloRomano ? ` · Ciclo ${s.cicloRomano}` : "");
    document.getElementById("cycleTag").textContent = cicloTxt;
    document.getElementById("cycleTagMobile").textContent = cicloTxt;
    document.getElementById("profileNameLabel").textContent = s.nombre || "Estudiante";
    document.getElementById("profileAvatar").textContent = firstName(s.nombre).charAt(0).toUpperCase() || "?";
  }

  function wireNav() {
    document.querySelectorAll("[data-view]").forEach(el => {
      el.addEventListener("click", () => go(el.dataset.view));
    });
  }

  // ---------- Tema claro / oscuro ----------
  function applyTheme(tema) {
    document.documentElement.setAttribute("data-theme", tema);
    document.querySelectorAll("#themeToggle .ic, #themeToggleMobile .ic").forEach(el => {
      el.dataset.icon = tema === "oscuro" ? "sun" : "moon";
    });
    Icons.hydrate(document);
  }

  function toggleTheme() {
    const s = Store.getSettings();
    const next = s.tema === "oscuro" ? "claro" : "oscuro";
    Store.updateSettings({ tema: next });
    applyTheme(next);
  }

  function wireTheme() {
    applyTheme(Store.getSettings().tema || "claro");
    document.getElementById("themeToggle").addEventListener("click", toggleTheme);
    document.getElementById("themeToggleMobile").addEventListener("click", toggleTheme);
  }

  // ---------- Perfil del estudiante ----------
  let profilePromedios = [];

  function renderPromediosRows() {
    const wrap = document.getElementById("promediosWrap");
    if (!wrap) return;
    wrap.innerHTML = profilePromedios.map((p, i) => `
      <div class="sched-row" data-i="${i}" style="grid-template-columns:1fr 1fr auto;">
        <input data-f="ciclo" placeholder="Ciclo (ej. III)" value="${Utils.esc(p.ciclo||"")}">
        <input data-f="promedio" type="number" step="0.01" min="0" max="20" placeholder="Promedio" value="${p.promedio ?? ""}">
        <button type="button" class="mini-btn" data-rmprom="${i}">${Icons.get("trash",12)}</button>
      </div>
    `).join("") || `<p style="font-size:12px;color:var(--ink-faint);margin:2px 0 8px;">Aún no agregas ciclos anteriores.</p>`;

    wrap.querySelectorAll(".sched-row").forEach(row => {
      const i = Number(row.dataset.i);
      row.querySelectorAll("[data-f]").forEach(input => {
        input.addEventListener("input", () => { profilePromedios[i][input.dataset.f] = input.value; });
      });
    });
    wrap.querySelectorAll("[data-rmprom]").forEach(btn => {
      btn.addEventListener("click", () => { profilePromedios.splice(Number(btn.dataset.rmprom), 1); renderPromediosRows(); });
    });
  }

  function openProfileForm() {
    const ov = document.getElementById("overlayForm");
    const s = Store.getSettings();
    profilePromedios = JSON.parse(JSON.stringify(s.promedios || []));
    const romanos = ["I","II","III","IV","V","VI","VII","VIII","IX","X"];

    document.getElementById("formTitle").textContent = "Perfil y configuración";
    document.getElementById("formBody").innerHTML = `
      <div style="display:flex;justify-content:center;margin-bottom:16px;">
        <div class="profile-avatar" style="width:56px;height:56px;font-size:20px;">${Utils.esc((s.nombre||"?").trim().charAt(0).toUpperCase())}</div>
      </div>

      <div class="section-head" style="margin-top:0;"><h2>Datos personales</h2></div>
      <div class="field"><label>Nombre completo</label><input id="fPerfilNombre" value="${Utils.esc(s.nombre||"")}"></div>
      <div class="field-row">
        <div class="field"><label>Código universitario</label><input id="fPerfilCodigo" value="${Utils.esc(s.codigo||"")}"></div>
        <div class="field"><label>Ciclo actual</label>
          <select id="fPerfilCicloRomano">
            <option value="">—</option>
            ${romanos.map(r=>`<option value="${r}" ${s.cicloRomano===r?"selected":""}>${r}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="field-row">
        <div class="field"><label>Semestre actual</label><input id="fPerfilSemestre" value="${Utils.esc(s.ciclo||"")}" placeholder="Ej. 2026-II"></div>
        <div class="field"><label>Escuela profesional</label><input id="fPerfilEscuela" value="${Utils.esc(s.escuela||"")}" placeholder="Ej. Ing. Informática"></div>
      </div>
      <div class="field"><label>Créditos aprobados antes del ciclo actual</label><input id="fPerfilCreditos" type="number" min="0" value="${s.creditosAprobados||0}"></div>

      <div class="section-head"><h2>Promedio ponderado por ciclo anterior</h2></div>
      <div id="promediosWrap"></div>
      <button type="button" class="btn btn-sm" id="btnAddPromedio">${Icons.get("plus",12)} Agregar ciclo anterior</button>

      <div style="margin-top:18px;">
        <button type="button" class="btn btn-sm" id="btnLimpiarPerfil" style="width:100%;border-style:dashed;color:var(--red);">Limpiar datos del perfil</button>
      </div>
    `;
    ov.classList.add("open");
    renderPromediosRows();
    Icons.hydrate(ov);

    document.getElementById("btnAddPromedio").addEventListener("click", () => {
      profilePromedios.push({ ciclo: "", promedio: "" });
      renderPromediosRows();
    });

    document.getElementById("btnLimpiarPerfil").addEventListener("click", () => {
      if (!confirm("¿Borrar los datos de tu perfil (nombre, código, ciclo, escuela, créditos y promedios)? Tus cursos, tareas y demás no se verán afectados.")) return;
      Store.updateSettings({ nombre: "Estudiante", codigo: "", cicloRomano: "", ciclo: "", escuela: "", creditosAprobados: 0, promedios: [] });
      Utils.toast("Datos del perfil borrados");
      QuickAdd.closeAll();
      refresh();
    });

    document.getElementById("formSave").onclick = () => {
      const nombre = document.getElementById("fPerfilNombre").value.trim() || "Estudiante";
      Store.updateSettings({
        nombre,
        codigo: document.getElementById("fPerfilCodigo").value.trim(),
        cicloRomano: document.getElementById("fPerfilCicloRomano").value,
        ciclo: document.getElementById("fPerfilSemestre").value.trim(),
        escuela: document.getElementById("fPerfilEscuela").value.trim(),
        creditosAprobados: Number(document.getElementById("fPerfilCreditos").value)||0,
        promedios: profilePromedios.filter(p => p.ciclo || p.promedio),
      });
      Utils.toast("Perfil actualizado");
      QuickAdd.closeAll();
      refresh();
    };
  }

  function wireProfile() {
    document.getElementById("profileRow").addEventListener("click", openProfileForm);
    document.getElementById("brandMobile").addEventListener("click", openProfileForm);
  }

  function init() {
    Icons.hydrate(document);
    QuickAdd.init();
    wireNav();
    wireTheme();
    wireProfile();
    const hash = location.hash.replace("#", "");
    current = VIEWS[hash] ? hash : "dashboard";
    refresh();

    // refresco ligero cada minuto para relojes/relativos si la app queda abierta
    setInterval(() => { if (current === "dashboard") refresh(); }, 60000);
  }

  document.addEventListener("DOMContentLoaded", init);

  return { go, refresh, openProfileForm, firstName };
})();
