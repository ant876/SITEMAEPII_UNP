/* ============================================================
   DASHBOARD UNP — ui-tareas.js
   Namespace global: UITareas
   ============================================================ */
const UITareas = (function () {
  let filter = "todas";
  let search = "";
  let sortBy = "prioridad";

  function courseName(id) { const c = Store.get("courses", id); return c ? c.nombre : ""; }

  function applyFilters(list) {
    const today = Utils.today();
    if (filter === "hoy") list = list.filter(t => Utils.isSameDay(t.fecha, today) && t.estado !== "completada");
    else if (filter === "proximas") list = list.filter(t => Utils.daysBetween(today, t.fecha) > 0 && Utils.daysBetween(today, t.fecha) <= 7 && t.estado !== "completada");
    else if (filter === "atrasadas") list = list.filter(t => t.estado === "atrasada" || (t.estado==="pendiente" && Utils.daysBetween(today, t.fecha) < 0));
    else if (filter === "completadas") list = list.filter(t => t.estado === "completada");
    else if (filter === "alta") list = list.filter(t => t.prioridad === "alta" && t.estado !== "completada");

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t => t.titulo.toLowerCase().includes(q) || (t.descripcion||"").toLowerCase().includes(q) || courseName(t.courseId).toLowerCase().includes(q));
    }

    if (sortBy === "prioridad") list = [...list].sort((a,b)=> Utils.priorityScore(b) - Utils.priorityScore(a));
    else if (sortBy === "fecha") list = [...list].sort((a,b)=> new Date(a.fecha) - new Date(b.fecha));
    else if (sortBy === "curso") list = [...list].sort((a,b)=> courseName(a.courseId).localeCompare(courseName(b.courseId)));

    return list;
  }

  function rowHTML(t) {
    const c = t.courseId ? courseName(t.courseId) : "";
    const done = t.estado === "completada";
    const atrasada = !done && Utils.daysBetween(Utils.today(), t.fecha) < 0;
    return `
      <div class="task-row ${done?"done":""}" data-id="${t.id}">
        <div class="check ${done?"on":""}" data-toggle="${t.id}">${done?Icons.get("check",12):""}</div>
        <div class="task-body">
          <div class="task-title">${Utils.esc(t.titulo)}</div>
          <div class="task-meta">
            <span class="pill pill-${t.prioridad}">${t.prioridad==="alta"?"Alta":t.prioridad==="media"?"Media":"Baja"}</span>
            ${c ? `<span class="pill pill-course">${Icons.get("book",11)} ${Utils.esc(c)}</span>` : ""}
            <span>${atrasada ? `${Icons.get("alert",11)} Atrasada` : Utils.relativeDay(t.fecha)}${t.hora ? " · " + Utils.to12h(t.hora) : ""}</span>
            <span>${Utils.minutesToLabel(t.tiempoEstMin)}</span>
          </div>
        </div>
        <div class="row-actions">
          <button class="mini-btn" data-edit="${t.id}">${Icons.get("edit",13)}</button>
          <button class="mini-btn" data-del="${t.id}">${Icons.get("trash",13)}</button>
        </div>
      </div>`;
  }

  function render() {
    const all = Store.all("tasks");
    const list = applyFilters(all);
    const filters = [
      ["todas","Todas"], ["hoy","Hoy"], ["proximas","Próximas"],
      ["atrasadas","Atrasadas"], ["completadas","Completadas"], ["alta","Alta prioridad"],
    ];

    document.getElementById("view").innerHTML = `
      <div class="toolbar">
        ${filters.map(([v,l])=>`<button class="chip-filter ${filter===v?"active":""}" data-f="${v}">${l}</button>`).join("")}
        <select class="sort-select" id="sortSel">
          <option value="prioridad" ${sortBy==="prioridad"?"selected":""}>Ordenar: Prioridad</option>
          <option value="fecha" ${sortBy==="fecha"?"selected":""}>Ordenar: Fecha</option>
          <option value="curso" ${sortBy==="curso"?"selected":""}>Ordenar: Curso</option>
        </select>
        <div class="search-box">${Icons.get("search",14)} <input id="searchInput" placeholder="Buscar tareas..." value="${Utils.esc(search)}"></div>
      </div>
      <div id="taskList">
        ${list.length ? list.map(rowHTML).join("") : UIDashboard.emptyState("tasks","No tienes tareas aquí","Prueba otro filtro o agrega una nueva.","tarea")}
      </div>
    `;

    document.querySelectorAll("[data-f]").forEach(b => b.addEventListener("click", ()=>{ filter = b.dataset.f; render(); }));
    document.getElementById("sortSel").addEventListener("change", (e)=>{ sortBy = e.target.value; render(); });
    document.getElementById("searchInput").addEventListener("input", (e)=>{ search = e.target.value; render(); });

    document.querySelectorAll("[data-toggle]").forEach(el => el.addEventListener("click", ()=>{
      const t = Store.get("tasks", el.dataset.toggle);
      Store.update("tasks", t.id, { estado: t.estado==="completada" ? "pendiente" : "completada" });
      Utils.toast(t.estado==="completada" ? "Marcada como pendiente" : "Tarea completada");
      App.refresh();
    }));
    document.querySelectorAll("[data-edit]").forEach(el => el.addEventListener("click", ()=> QuickAdd.editTask(el.dataset.edit)));
    document.querySelectorAll("[data-del]").forEach(el => el.addEventListener("click", ()=>{
      if (confirm("¿Eliminar esta tarea?")) { Store.remove("tasks", el.dataset.del); Utils.toast("Tarea eliminada"); App.refresh(); }
    }));
    document.querySelectorAll("[data-newof]").forEach(el => el.addEventListener("click", ()=> QuickAdd.newOfType(el.dataset.newof)));
  }

  return { render };
})();
