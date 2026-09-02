/* ============================================================
   DASHBOARD UNP — ui-inbox.js
   Namespace global: UIInbox
   ============================================================ */
const UIInbox = (function () {

  function rowHTML(i) {
    const convLabel = { tarea: "Convertido a tarea", examen: "Convertido a examen", evento: "Convertido a evento" };
    return `
      <div class="inbox-item ${i.procesado?"is-done":""}" data-id="${i.id}">
        <div class="ib-dot"></div>
        <div class="ib-text">${Utils.esc(i.texto)}<div class="ib-time">${Utils.relativeDay(i.fecha)}${i.procesado ? ` · ${convLabel[i.convertidoA] || "Convertido"}` : ""}</div></div>
        <div class="inbox-actions">
          ${i.procesado ? "" : `
          <button class="mini-btn" data-conv="tarea" data-id2="${i.id}" title="Convertir en tarea">${Icons.get("tasks",13)}</button>
          <button class="mini-btn" data-conv="evento" data-id2="${i.id}" title="Convertir en evento">${Icons.get("calendar",13)}</button>
          `}
          <button class="mini-btn" data-edit="${i.id}" title="Editar">${Icons.get("edit",13)}</button>
          <button class="mini-btn" data-del="${i.id}" title="Eliminar">${Icons.get("trash",13)}</button>
        </div>
      </div>`;
  }

  function render() {
    const items = [...Store.all("inbox")].sort((a,b)=> new Date(b.fecha)-new Date(a.fecha));
    document.getElementById("view").innerHTML = `
      <div class="toolbar">
        <div class="search-box" style="margin-left:0;flex:1;">${Icons.get("edit",14)} <input id="quickCapture" placeholder="Captura algo rápido y presiona Enter..."></div>
      </div>
      <div id="inboxList">
        ${items.length ? items.map(rowHTML).join("") : `<div class="empty"><div class="em-emoji">${Icons.get("inbox",22)}</div><div class="em-title">Tu bandeja está limpia</div><div class="em-sub">Todo está organizado.</div></div>`}
      </div>
    `;

    const input = document.getElementById("quickCapture");
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && input.value.trim()) {
        Store.add("inbox", { texto: input.value.trim(), fecha: new Date().toISOString(), procesado: false }, "i");
        Utils.toast("Capturado");
        App.refresh();
      }
    });

    document.querySelectorAll("[data-conv]").forEach(el => el.addEventListener("click", () => {
      const item = Store.get("inbox", el.dataset.id2);
      QuickAdd.convertInboxTo(item, el.dataset.conv === "tarea" ? "tarea" : "evento");
    }));
    document.querySelectorAll("[data-edit]").forEach(el => el.addEventListener("click", () => QuickAdd.editInbox(el.dataset.edit)));
    document.querySelectorAll("[data-del]").forEach(el => el.addEventListener("click", () => {
      Store.remove("inbox", el.dataset.del); Utils.toast("Eliminado del Inbox"); App.refresh();
    }));
  }

  return { render };
})();
