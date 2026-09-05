/* ============================================================
   DASHBOARD UNP — icons.js
   Set de iconos SVG lineales minimalistas (sin emojis).
   Namespace global: Icons
   ============================================================ */
const Icons = (function () {
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1V9.5"/>',
    tasks: '<rect x="3.5" y="4.5" width="6" height="6" rx="1.4"/><path d="m5 7.5 1.3 1.3L8.5 6.4"/><rect x="3.5" y="13.5" width="6" height="6" rx="1.4"/><path d="m5 16.5 1.3 1.3 2.2-2.4"/><path d="M13 6.5h7.5M13 17.5h7.5"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.2"/><path d="M3.5 9.8h17M8 3v4M16 3v4"/>',
    book: '<path d="M4 5.2C5.6 4.2 7.7 3.7 12 5v14.3C7.7 18 5.6 18.5 4 19.5Z"/><path d="M20 5.2c-1.6-1-3.7-1.5-8 .0v14.3c4.3-1.3 6.4-.8 8 .2Z"/>',
    clock: '<circle cx="12" cy="12" r="8.3"/><path d="M12 7.6V12l3 2"/>',
    inbox: '<path d="M4 13.5 6 5.5h12l2 8"/><path d="M4 13.5h5a1 1 0 0 1 1 .78c.28 1.24 1.06 2.1 2 2.1s1.72-.86 2-2.1a1 1 0 0 1 1-.78h5v5a1.3 1.3 0 0 1-1.3 1.3H5.3A1.3 1.3 0 0 1 4 18.5Z"/>',
    folder: '<path d="M3.5 6.5a1.3 1.3 0 0 1 1.3-1.3h4.3l2 2.3h8.1a1.3 1.3 0 0 1 1.3 1.3v9a1.3 1.3 0 0 1-1.3 1.3H4.8a1.3 1.3 0 0 1-1.3-1.3Z"/>',
    target: '<circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1"/>',
    chart: '<path d="M4 20V10.5M11 20V4.5M18 20v-7.2"/><path d="M3.2 20h17.6"/>',
    settings: '<line x1="4.5" y1="7" x2="19.5" y2="7"/><circle cx="9.5" cy="7" r="2.1"/><line x1="4.5" y1="12" x2="19.5" y2="12"/><circle cx="15" cy="12" r="2.1"/><line x1="4.5" y1="17" x2="19.5" y2="17"/><circle cx="8.5" cy="17" r="2.1"/>',
    plus: '<path d="M12 4.5v15M4.5 12h15"/>',
    bell: '<path d="M6 10.2a6 6 0 0 1 12 0c0 4.3 1.4 5.6 1.4 5.6H4.6S6 14.5 6 10.2Z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.3"/><path d="m19.5 19.5-4-4"/>',
    edit: '<path d="M14.3 4.8 19 9.5 8.2 20.3H3.5v-4.7Z"/><path d="M12.4 6.7 17.1 11.4"/>',
    trash: '<path d="M4.5 7h15"/><path d="M9.5 7V5a1.4 1.4 0 0 1 1.4-1.4h2.2A1.4 1.4 0 0 1 14.5 5v2"/><path d="M6.5 7 7.3 19.4A1.6 1.6 0 0 0 8.9 21h6.2a1.6 1.6 0 0 0 1.6-1.6L17.5 7"/><path d="M10.2 11v6.4M13.8 11v6.4"/>',
    check: '<path d="m4.5 12.5 5 5 10-11"/>',
    x: '<path d="m5.5 5.5 13 13M18.5 5.5l-13 13"/>',
    sun: '<circle cx="12" cy="12" r="4.3"/><path d="M12 2.8v2.4M12 18.8v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.8 12h2.4M18.8 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7"/>',
    moon: '<path d="M20 14.2a8.3 8.3 0 1 1-9.2-11c-.6 1-.9 2.2-.9 3.4a7.6 7.6 0 0 0 7.6 7.6c1.2 0 2.4-.3 3.4-.9Z"/>',
    flame: '<path d="M12 3s-1 3-3.5 5.3C6.3 10.3 6 12.2 6 13.5a6 6 0 0 0 12 0c0-2-.9-3.4-1.8-4.6-.2 1.4-.9 2.3-1.7 2.8C15 9.8 14.4 6.7 12 3Z"/>',
    alert: '<path d="M12 4 3 19.5h18Z"/><path d="M12 10v4.2M12 17.3v.1"/>',
    chevronLeft: '<path d="m14.5 5-7 7 7 7"/>',
    chevronRight: '<path d="m9.5 5 7 7-7 7"/>',
    link: '<path d="M10 14.2a4.2 4.2 0 0 0 6 0l2.3-2.3a4.2 4.2 0 0 0-6-6L11 7.2"/><path d="M14 9.8a4.2 4.2 0 0 0-6 0l-2.3 2.3a4.2 4.2 0 0 0 6 6L13 16.8"/>',
    note: '<path d="M5.5 3.5h13a1 1 0 0 1 1 1V15l-5.5 5.5h-8.5a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z"/><path d="M19.3 15h-4a1.3 1.3 0 0 0-1.3 1.3v4"/><path d="M8 8h8M8 12h5"/>',
    grid: '<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M3.5 9.7h17M3.5 15.8h17M9.6 3.5v17M15.7 3.5v17"/>',
    sparkle: '<path d="M12 3.5c.6 3 2 4.4 5 5-3 .6-4.4 2-5 5-.6-3-2-4.4-5-5 3-.6 4.4-2 5-5Z"/>',
    user: '<circle cx="12" cy="8.3" r="3.3"/><path d="M4.8 20.2c1.1-3.6 3.9-5.6 7.2-5.6s6.1 2 7.2 5.6"/>',
    pin: '<path d="M12 21.5s-7-6.3-7-11.7a7 7 0 0 1 14 0c0 5.4-7 11.7-7 11.7Z"/><circle cx="12" cy="9.8" r="2.4"/>',
    dots: '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
    refresh: '<path d="M4.5 12a7.5 7.5 0 0 1 12.7-5.4L19.5 8"/><path d="M19.5 4.5V8H16"/><path d="M19.5 12a7.5 7.5 0 0 1-12.7 5.4L4.5 16"/><path d="M4.5 19.5V16H8"/>',
  };

  function get(name, size) {
    const s = size || 18;
    const body = P[name] || P.dots;
    return `<svg class="ic-svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  }

  function hydrate(root) {
    (root || document).querySelectorAll("[data-icon]").forEach(el => {
      const size = el.dataset.iconSize ? Number(el.dataset.iconSize) : undefined;
      el.innerHTML = get(el.dataset.icon, size);
    });
  }

  return { get, hydrate, names: Object.keys(P) };
})();
