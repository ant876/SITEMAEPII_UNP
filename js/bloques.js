/* ============================================================
   DASHBOARD UNP — bloques.js
   Plantilla horaria oficial (bloques 1 a 6, hasta grupo G12).
   Se usa para: (a) el selector de horario al editar un curso,
   y (b) la grilla de la vista Horario.
   Namespace global: Bloques
   ============================================================ */
const Bloques = (function () {
  // Cada bloque tiene dos sub-periodos de 50 min. Los horarios coinciden
  // exactamente con la "Plantilla Horaria" oficial (bloques 1–6, hasta G12).
  const LIST = [
    { n: 1, subs: [{ ini: "07:00", fin: "07:50" }, { ini: "07:50", fin: "08:40" }] },
    { n: 2, subs: [{ ini: "08:50", fin: "09:40" }, { ini: "09:40", fin: "10:30" }] },
    { n: 3, subs: [{ ini: "10:40", fin: "11:30" }, { ini: "11:30", fin: "12:20" }] },
    { n: 4, subs: [{ ini: "13:50", fin: "14:40" }, { ini: "14:40", fin: "15:30" }] },
    { n: 5, subs: [{ ini: "15:40", fin: "16:30" }, { ini: "16:30", fin: "17:20" }] },
    { n: 6, subs: [{ ini: "17:30", fin: "18:20" }, { ini: "18:20", fin: "19:10" }] },
  ];

  // Filas de receso que van DESPUÉS de cada bloque (para la grilla visual)
  const RECESOS = {
    1: { ini: "08:40", fin: "08:50", label: "RECESO" },
    2: { ini: "10:30", fin: "10:40", label: "RECESO" },
    3: { ini: "12:20", fin: "13:50", label: "ALMUERZO" },
    4: { ini: "15:30", fin: "15:40", label: "RECESO" },
    5: { ini: "17:20", fin: "17:30", label: "RECESO" },
  };

  const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  // Código de "Grupo" oficial que le corresponde a cada celda según la
  // Plantilla Horaria de la UNP (para bloques 1–6, hasta G12). Se usa
  // para mostrar el grupo en las celdas que el estudiante no ocupa.
  function grupoCode(bloqueN, dia, subIndex) {
    const odd = bloqueN * 2 - 1;
    const even = bloqueN * 2;
    if (dia === "Lunes") return `G${odd}a`;
    if (dia === "Martes") return `G${odd}b`;
    if (dia === "Miércoles") return subIndex === 0 ? `G${odd}h` : `G${even}h`;
    if (dia === "Jueves") return `G${even}a`;
    if (dia === "Viernes") return `G${even}b`;
    return "";
  }

  // Opciones para el <select> del editor de horario de un curso:
  // por cada bloque, sus dos mitades + la opción "completo".
  function selectOptions() {
    const opts = [];
    LIST.forEach(b => {
      opts.push({
        value: `${b.n}:${b.subs[0].ini}:${b.subs[1].fin}`,
        label: `Bloque ${b.n} · completo (${Utils.to12h(b.subs[0].ini)} – ${Utils.to12h(b.subs[1].fin)})`,
        ini: b.subs[0].ini, fin: b.subs[1].fin,
      });
      b.subs.forEach((s, i) => {
        opts.push({
          value: `${b.n}:${s.ini}:${s.fin}`,
          label: `Bloque ${b.n} · ${i === 0 ? "1ª hora" : "2ª hora"} (${Utils.to12h(s.ini)} – ${Utils.to12h(s.fin)})`,
          ini: s.ini, fin: s.fin,
        });
      });
    });
    return opts;
  }

  return { LIST, RECESOS, DIAS, selectOptions, grupoCode };
})();
