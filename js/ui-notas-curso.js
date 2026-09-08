/* ============================================================
   DASHBOARD UNP — ui-notas-curso.js
   Simulador de notas dentro del detalle de un curso (pestaña
   "Notas"). Rubros (ej. "PC" = 40%, con N notas) → promedio
   ponderado final, coloreado según el reglamento de la UNP:
   >=10.5 Aprobado (verde) · 7.5–10.4 Sustitutorio (gris) · <7.5 Desaprobado (rojo)
   Namespace global: UICursoNotas
   ============================================================ */
const UICursoNotas = (function () {

  function rubroAverage(rubro) {
    const vals = (rubro.notas || []).filter(n => n !== null && n !== "" && !isNaN(n)).map(Number);
    if (!vals.length) return null;
    return vals.reduce((a,b)=>a+b, 0) / vals.length;
  }

  function finalWeighted(course) {
    const rubros = course.rubros || [];
    return rubros.reduce((sum, r) => {
      const avg = rubroAverage(r);
      return sum + (avg === null ? 0 : avg) * ((Number(r.peso)||0) / 100);
    }, 0);
  }

  function totalPeso(course) {
    return (course.rubros || []).reduce((s,r)=> s + (Number(r.peso)||0), 0);
  }

  function tierOf(nota) {
    if (nota >= 10.5) return { label: "Aprobado", cls: "nota-aprobado" };
    if (nota >= 7.5) return { label: "Necesitas dar examen sustitutorio", cls: "nota-sustitutorio" };
    return { label: "Desaprobado", cls: "nota-desaprobado" };
  }

  function rubroCardHTML(course, r, i) {
    const avg = rubroAverage(r);
    return `
      <div class="rubro-card" data-ri="${i}">
        <div class="rubro-head">
          <div class="rubro-name-wrap">
            <input class="rubro-name" data-rf="nombre" value="${Utils.esc(r.nombre)}" placeholder="Ej. PC">
            <div class="rubro-peso-wrap"><input class="rubro-peso" data-rf="peso" type="number" min="0" max="100" value="${r.peso}"><span>%</span></div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="rubro-avg">${avg===null ? "—" : avg.toFixed(2)}</span>
            <button class="mini-btn" data-rmrubro="${i}">${Icons.get("trash",12)}</button>
          </div>
        </div>
        <div class="rubro-notas">
          ${(r.notas||[]).map((n,ni)=>`
            <div class="rubro-nota-chip">
              <input type="number" min="0" max="20" step="0.1" data-rn="${ni}" value="${n===null||n===""?"":n}" placeholder="—">
              <button data-rmnota="${ni}">${Icons.get("x",10)}</button>
            </div>`).join("")}
          <button class="rubro-add-nota" data-addnota>${Icons.get("plus",11)} Nota</button>
        </div>
      </div>`;
  }

  function panelHTML(course) {
    const rubros = course.rubros || [];
    const final = finalWeighted(course);
    const rounded = Math.round(final);
    const peso = totalPeso(course);
    const tier = tierOf(final);

    return `
      <div class="notas-summary ${tier.cls}">
        <div class="notas-final-num">${rounded}</div>
        <div class="notas-final-info">
          <div class="notas-final-exact">Promedio exacto: ${final.toFixed(2)}</div>
          <div class="notas-final-status">${tier.label}</div>
          <div class="notas-final-peso">Peso asignado: ${peso}% ${peso !== 100 ? "(debería sumar 100%)" : ""}</div>
        </div>
      </div>

      <div class="section-head" style="margin-top:18px;"><h2>Rubros de evaluación</h2></div>
      <div id="rubrosWrap">
        ${rubros.length ? rubros.map((r,i)=>rubroCardHTML(course,r,i)).join("") : `<p style="color:var(--ink-faint);font-size:13px;">Aún no agregas rubros. Ej: "PC" con 40% y 4 notas.</p>`}
      </div>
      <div class="rubro-new-row">
        <input id="newRubroNombre" placeholder="Nombre (ej. PC, Examen final...)">
        <div class="rubro-peso-wrap"><input id="newRubroPeso" type="number" min="0" max="100" placeholder="Peso"><span>%</span></div>
        <button class="btn btn-primary btn-sm" id="btnAddRubro">${Icons.get("plus",12)} Agregar rubro</button>
      </div>
      ${rubros.length ? `<button class="btn btn-primary" id="btnConfirmNotas" style="width:100%;margin-top:14px;">${Icons.get("check",13)} Confirmar cambios</button>` : ""}
    `;
  }

  function wire(courseId, onChange) {
    function save(patchFn) {
      const c = Store.get("courses", courseId);
      const rubros = JSON.parse(JSON.stringify(c.rubros || []));
      patchFn(rubros);
      Store.update("courses", courseId, { rubros });
      onChange();
    }

    const wrap = document.getElementById("rubrosWrap");
    if (wrap) {
      wrap.querySelectorAll(".rubro-card").forEach(card => {
        const i = Number(card.dataset.ri);
        card.querySelector('[data-rf="nombre"]').addEventListener("change", (e) => save(rs => { rs[i].nombre = e.target.value.trim(); }));
        card.querySelector('[data-rf="peso"]').addEventListener("change", (e) => save(rs => { rs[i].peso = Number(e.target.value)||0; }));
        card.querySelectorAll("[data-rn]").forEach(inp => {
          inp.addEventListener("change", (e) => {
            const ni = Number(e.target.dataset.rn);
            save(rs => { rs[i].notas[ni] = e.target.value === "" ? "" : Number(e.target.value); });
          });
        });
        card.querySelectorAll("[data-rmnota]").forEach(btn => {
          btn.addEventListener("click", () => {
            const ni = Number(btn.dataset.rmnota);
            const removedValue = Store.get("courses", courseId).rubros[i].notas[ni];
            save(rs => { rs[i].notas.splice(ni,1); });
            Utils.showUndo("Nota eliminada", () => save(rs => { rs[i].notas.splice(ni, 0, removedValue); }));
          });
        });
        card.querySelector("[data-addnota]").addEventListener("click", () => save(rs => { rs[i].notas.push(""); }));
        card.querySelector("[data-rmrubro]").addEventListener("click", () => {
          const removedRubro = JSON.parse(JSON.stringify(Store.get("courses", courseId).rubros[i]));
          save(rs => { rs.splice(i,1); });
          Utils.showUndo("Rubro eliminado", () => save(rs => { rs.splice(i, 0, removedRubro); }));
        });
      });
    }

    const btnAdd = document.getElementById("btnAddRubro");
    if (btnAdd) btnAdd.addEventListener("click", () => {
      const nombre = document.getElementById("newRubroNombre").value.trim();
      const peso = Number(document.getElementById("newRubroPeso").value) || 0;
      if (!nombre) return Utils.toast("Ponle un nombre al rubro");
      save(rs => { rs.push({ nombre, peso, notas: [] }); });
    });

    const btnConfirm = document.getElementById("btnConfirmNotas");
    if (btnConfirm) btnConfirm.addEventListener("click", () => Utils.toast("Notas guardadas"));
  }

  return { panelHTML, wire, finalWeighted, tierOf };
})();
