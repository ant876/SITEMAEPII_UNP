/* ============================================================
   DASHBOARD UNP — ui-configuracion.js
   Namespace global: UIConfiguracion
   ============================================================ */
const UIConfiguracion = (function () {

  function render() {
    const s = Store.getSettings();
    document.getElementById("view").innerHTML = `
      <div class="section-head" style="margin-top:0;"><h2>Perfil</h2></div>
      <div class="card card-pad" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
        <div class="profile-avatar" style="width:44px;height:44px;font-size:16px;">${Utils.esc(App.firstName(s.nombre).charAt(0).toUpperCase()||"?")}</div>
        <div style="flex:1;min-width:180px;">
          <div style="font-weight:600;font-size:14px;">${Utils.esc(s.nombre||"Estudiante")}</div>
          <div style="font-size:12px;color:var(--ink-soft);margin-top:2px;">
            ${s.codigo ? Utils.esc(s.codigo) + " · " : ""}${s.escuela ? Utils.esc(s.escuela) + " · " : ""}${s.cicloRomano ? "Ciclo " + Utils.esc(s.cicloRomano) : "Sin ciclo registrado"}
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="btnEditProfileFull">${Icons.get("edit",13)} Editar perfil completo</button>
      </div>

      <div class="section-head"><h2>Notificaciones</h2></div>
      <div class="card card-pad" style="display:flex;align-items:center;justify-content:space-between;">
        <span style="font-size:13.5px;">Activar recordatorios (futuro)</span>
        <input type="checkbox" id="cfgNotif" ${s.notificaciones?"checked":""} style="width:18px;height:18px;">
      </div>

      <div class="section-head"><h2>Apariencia</h2></div>
      <div class="card card-pad" style="display:flex;align-items:center;justify-content:space-between;">
        <span style="font-size:13.5px;">Tema ${s.tema==="oscuro"?"oscuro":"claro"}</span>
        <div class="cal-toggle">
          <button data-tema="claro" class="${(s.tema||"claro")==="claro"?"active":""}">${Icons.get("sun",13)} Claro</button>
          <button data-tema="oscuro" class="${s.tema==="oscuro"?"active":""}">${Icons.get("moon",13)} Oscuro</button>
        </div>
      </div>

      <div class="section-head"><h2>Cursos registrados</h2></div>
      <div class="card card-pad">
        ${Store.all("courses").map(c=>`
          <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-soft);">
            <span style="width:10px;height:10px;border-radius:50%;background:${c.color};"></span>
            <span style="flex:1;font-size:13.5px;">${Utils.esc(c.nombre)}</span>
            <button class="mini-btn" data-delcourse="${c.id}">${Icons.get("trash",13)}</button>
          </div>`).join("") || `<p style="color:var(--ink-faint);font-size:13px;">Sin cursos registrados.</p>`}
      </div>

      <div class="section-head"><h2>Datos</h2></div>
      <div class="card card-pad" style="display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn-sm" id="btnReset">${Icons.get("refresh",13)} Restaurar datos de demostración</button>
        <button class="btn btn-sm btn-danger" id="btnWipe">${Icons.get("trash",13)} Borrar todos mis datos</button>
      </div>

      <div class="section-head"><h2>Acerca de</h2></div>
      <div class="card card-pad" style="font-size:12.5px;color:var(--ink-soft);">
        En desarrollo por Marcos Velasco y su única neurona funcional + un 99.9999% de colaboración de Claude
      </div>
    `;

    document.getElementById("btnEditProfileFull").addEventListener("click", () => App.openProfileForm());

    document.getElementById("cfgNotif").addEventListener("change", (e) => {
      Store.updateSettings({ notificaciones: e.target.checked });
      Utils.toast("Preferencia guardada");
    });

    document.querySelectorAll("[data-tema]").forEach(el => el.addEventListener("click", () => {
      Store.updateSettings({ tema: el.dataset.tema });
      document.documentElement.setAttribute("data-theme", el.dataset.tema);
      document.querySelectorAll("#themeToggle .ic, #themeToggleMobile .ic").forEach(ic => {
        ic.dataset.icon = el.dataset.tema === "oscuro" ? "sun" : "moon";
      });
      Icons.hydrate(document);
      App.refresh();
    }));

    document.querySelectorAll("[data-delcourse]").forEach(el => el.addEventListener("click", () => {
      if (confirm("¿Eliminar este curso? No se eliminarán sus tareas/eventos.")) {
        Store.remove("courses", el.dataset.delcourse);
        Utils.toast("Curso eliminado");
        App.refresh();
      }
    }));

    document.getElementById("btnReset").addEventListener("click", () => {
      if (confirm("Esto reemplazará tus datos actuales con los datos de demostración. ¿Continuar?")) {
        Store.resetDemo(); Utils.toast("Datos de demostración restaurados"); App.refresh();
      }
    });
    document.getElementById("btnWipe").addEventListener("click", () => {
      if (confirm("Esto borrará TODOS tus datos permanentemente. ¿Continuar?")) {
        Store.wipeAll(); Utils.toast("Datos borrados"); App.refresh();
      }
    });
  }

  return { render };
})();
