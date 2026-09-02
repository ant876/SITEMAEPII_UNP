/* ============================================================
   DASHBOARD UNP — ui-objetivos.js
   Namespace global: UIObjetivos
   ============================================================ */
const UIObjetivos = (function () {

  function rowHTML(o) {
    const pct = Math.min(100, Math.round((o.progreso / o.meta) * 100));
    const isBool = o.tipo === "boolean";
    return `
      <div class="obj-row">
        ${isBool
          ? `<div class="check ${o.progreso>=o.meta?"on":""}" data-toggleobj="${o.id}">${o.progreso>=o.meta?Icons.get("check",12):""}</div>`
          : `<div style="font-family:var(--font-mono);font-size:11.5px;color:var(--ink-soft);width:70px;">${o.progreso}/${o.meta}h</div>`
        }
        <div style="flex:1;">
          <div class="task-title">${Utils.esc(o.titulo)}</div>
          <div class="obj-bar" style="margin-top:8px;"><div style="width:${pct}%;"></div></div>
        </div>
        <span style="font-family:var(--font-mono);font-size:12px;color:var(--ink-soft);">${pct}%</span>
        <button class="mini-btn" data-delobj="${o.id}">${Icons.get("trash",13)}</button>
      </div>`;
  }

  function render() {
    const objs = Store.all("objectives");
    const completed = objs.filter(o => o.progreso >= o.meta).length;

    document.getElementById("view").innerHTML = `
      <div class="kpi-row" style="grid-template-columns:1fr;">
        <div class="kpi k-proximo"><div class="kpi-label">${Icons.get("target",13)} Progreso general</div><div class="kpi-main">${completed} / ${objs.length} objetivos cumplidos</div></div>
      </div>
      <div class="toolbar"><button class="btn btn-primary btn-sm" id="btnNewObj">${Icons.get("plus",13)} Nuevo objetivo</button></div>
      <div>${objs.length ? objs.map(rowHTML).join("") : UIDashboard.emptyState("target","Sin objetivos definidos","Define tu primera meta para la semana.","tarea")}</div>
    `;

    document.querySelectorAll("[data-toggleobj]").forEach(el => el.addEventListener("click", () => {
      const o = Store.get("objectives", el.dataset.toggleobj);
      Store.update("objectives", o.id, { progreso: o.progreso >= o.meta ? 0 : o.meta });
      App.refresh();
    }));
    document.querySelectorAll("[data-delobj]").forEach(el => el.addEventListener("click", () => {
      Store.remove("objectives", el.dataset.delobj); Utils.toast("Objetivo eliminado"); App.refresh();
    }));
    document.getElementById("btnNewObj").addEventListener("click", openNewObjForm);
  }

  function openNewObjForm() {
    const ov = document.getElementById("overlayForm");
    document.getElementById("formTitle").textContent = "Nuevo objetivo";
    document.getElementById("formBody").innerHTML = `
      <div class="field"><label>Objetivo</label><input id="fTitulo" placeholder="Ej. Estudiar 15 horas por semana"></div>
      <div class="field"><label>Tipo de meta</label>
        <div class="seg" id="fTipoObj">
          <button data-v="boolean" class="active">Cumplir / no cumplir</button>
          <button data-v="horas">Horas semanales</button>
        </div>
      </div>
      <div class="field" id="fMetaWrap" style="display:none;"><label>Meta (horas)</label><input id="fMeta" type="number" min="1" value="10"></div>
    `;
    document.querySelectorAll("#fTipoObj button").forEach(b => b.addEventListener("click", () => {
      document.querySelectorAll("#fTipoObj button").forEach(x=>x.classList.remove("active"));
      b.classList.add("active");
      document.getElementById("fMetaWrap").style.display = b.dataset.v === "horas" ? "block" : "none";
    }));
    ov.classList.add("open");
    document.getElementById("formSave").onclick = () => {
      const titulo = document.getElementById("fTitulo").value.trim();
      if (!titulo) return Utils.toast("Ponle un nombre al objetivo");
      const tipo = document.querySelector("#fTipoObj button.active").dataset.v;
      const meta = tipo === "horas" ? Number(document.getElementById("fMeta").value)||10 : 1;
      Store.add("objectives", { titulo, tipo, meta, progreso: 0 }, "o");
      Utils.toast("Objetivo creado");
      QuickAdd.closeAll();
      App.refresh();
    };
  }

  return { render };
})();
