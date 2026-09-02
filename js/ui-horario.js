/* ============================================================
   DASHBOARD UNP — ui-horario.js
   Tabla de horario fiel a la Plantilla Horaria oficial de la UNP
   (bloques 1 a 6, hasta grupo G12), construida a partir de
   courses[].horario. Namespace global: UIHorario
   ============================================================ */
const UIHorario = (function () {

  // Encuentra el curso cuyo horario cubre por completo este sub-periodo
  // (soporta tanto entradas de "bloque completo" como de "media hora").
  function courseForCell(dia, sub) {
    return Store.all("courses").find(c =>
      (c.horario || []).some(h => h.dia === dia && h.inicio <= sub.ini && h.fin >= sub.fin)
    );
  }

  function courseCellHTML(dia, sub, bloqueN, subIndex) {
    const c = courseForCell(dia, sub);
    if (!c) {
      return `<td class="hcell hcell-empty"><span class="hcell-grupo">${Bloques.grupoCode(bloqueN, dia, subIndex)}</span></td>`;
    }
    return `<td class="hcell hcell-course" style="background:${c.color};color:${Utils.contrastColor(c.color)};">
      <div class="hcell-name">${Utils.esc(c.nombre)}</div>
      ${c.seccion ? `<div class="hcell-sec">Sección ${Utils.esc(c.seccion)}</div>` : ""}
    </td>`;
  }

  function render() {
    const totalCreditos = Store.all("courses").reduce((a,c)=>a+(c.creditos||0),0);
    const dias = Bloques.DIAS;

    let rows = "";
    Bloques.LIST.forEach(b => {
      b.subs.forEach((sub, i) => {
        rows += `<tr>
          ${i === 0 ? `<td class="bnum" rowspan="2">${b.n}</td>` : ""}
          <td class="hora-cell">${Utils.to12h(sub.ini)}<br>${Utils.to12h(sub.fin)}</td>
          ${dias.map(d => courseCellHTML(d, sub, b.n, i)).join("")}
        </tr>`;
      });
      const r = Bloques.RECESOS[b.n];
      if (r) {
        rows += `<tr class="receso-row">
          <td class="bnum bnum-r">R</td>
          <td class="hora-cell">${Utils.to12h(r.ini)}<br>${Utils.to12h(r.fin)}</td>
          <td colspan="5" class="receso-label">${r.label}</td>
        </tr>`;
      }
    });

    document.getElementById("view").innerHTML = `
      <div class="toolbar" style="justify-content:space-between;">
        <button class="btn btn-sm" id="btnBackCourses">${Icons.get("chevronLeft",14)} Volver a cursos</button>
        <span class="hint">${Store.all("courses").length} cursos · ${totalCreditos} créditos</span>
      </div>
      <div class="card card-pad" style="overflow-x:auto;">
        <table class="horario-table">
          <thead>
            <tr>
              <th>N°</th><th>HORA</th>
              ${dias.map(d=>`<th>${d.toUpperCase()}</th>`).join("")}
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;

    document.getElementById("btnBackCourses").addEventListener("click", ()=> App.go("cursos"));
  }

  return { render };
})();
