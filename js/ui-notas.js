/* ============================================================
   DASHBOARD UNP — ui-notas.js
   Widget de notas rápidas embebido en el Dashboard.
   Namespace global: UINotas
   ============================================================ */
const UINotas = (function () {

  function noteCardHTML(n) {
    return `
      <div class="note-card" data-id="${n.id}">
        <button class="mini-btn note-del" data-delnote="${n.id}">${Icons.get("trash",12)}</button>
        <div class="note-text">${Utils.esc(n.texto)}</div>
        <div class="note-time">${Utils.relativeDay(n.fecha)}</div>
      </div>`;
  }

  function render() {
    const notes = [...Store.all("notes")].sort((a,b)=> new Date(b.fecha)-new Date(a.fecha));
    return `
      <div class="notes-widget">
        <div class="notes-input-row">
          <textarea id="noteInput" placeholder="Escribe algo rápido... tarea para mañana, una idea, lo que sea."></textarea>
        </div>
        <button class="btn btn-primary btn-sm" id="btnSaveNote" style="align-self:flex-end;">${Icons.get("plus",13)} Guardar nota</button>
        <div id="notesList" style="display:flex;flex-direction:column;gap:8px;max-height:340px;overflow-y:auto;">
          ${notes.length ? notes.map(noteCardHTML).join("") : `<div class="empty" style="padding:20px 10px;"><div class="em-emoji">${Icons.get("note",20)}</div><div class="em-sub">Sin notas todavía.</div></div>`}
        </div>
      </div>`;
  }

  function wire() {
    const btn = document.getElementById("btnSaveNote");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const input = document.getElementById("noteInput");
      const texto = input.value.trim();
      if (!texto) return Utils.toast("Escribe algo primero");
      Store.add("notes", { texto, fecha: new Date().toISOString() }, "n");
      App.refresh();
    });
    document.querySelectorAll("[data-delnote]").forEach(el => el.addEventListener("click", () => {
      Store.remove("notes", el.dataset.delnote);
      App.refresh();
    }));
  }

  return { render, wire };
})();
