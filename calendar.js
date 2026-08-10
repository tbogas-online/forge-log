(() => {
  const TYPE_LETTERS = {
    WOD: "W",
    HYBRID: "H",
    FBB: "F",
    RUN: "R",
    WALK: "K",
    HIT: "I",
    OTHER: "O",
  };

  const TYPE_COLORS = {
    WOD: "#5ec8ff",
    HYBRID: "#ffb454",
    FBB: "#ff7a9a",
    RUN: "#7ddea0",
    WALK: "#b8a4ff",
    HIT: "#ff6b4a",
    OTHER: "#b0a89a",
  };

  const TYPE_ORDER = ["WOD", "HYBRID", "FBB", "RUN", "WALK", "HIT", "OTHER"];

  function shiftMonth(yearMonth, delta) {
    const [y, m] = yearMonth.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${yy}-${mm}`;
  }

  function monthLabel(yearMonth) {
    const [y, m] = yearMonth.split("-").map(Number);
    const d = new Date(y, m - 1, 1);
    return d
      .toLocaleDateString("en-GB", { month: "long", year: "numeric" })
      .toUpperCase();
  }

  function getMonthCells(yearMonth) {
    const [y, m] = yearMonth.split("-").map(Number);
    const first = new Date(y, m - 1, 1);
    const daysInMonth = new Date(y, m, 0).getDate();
    const startPad = (first.getDay() + 6) % 7;
    const cells = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    const mm = String(m).padStart(2, "0");
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(`${y}-${mm}-${String(day).padStart(2, "0")}`);
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }

  function groupByDate(workouts) {
    const map = new Map();
    for (const w of workouts) {
      if (!map.has(w.date)) map.set(w.date, []);
      map.get(w.date).push(w);
    }
    return map;
  }

  function countsByType(sessions) {
    const counts = {};
    for (const w of sessions) {
      counts[w.type] = (counts[w.type] || 0) + 1;
    }
    return counts;
  }

  function donutGradient(counts) {
    const total = TYPE_ORDER.reduce((sum, t) => sum + (counts[t] || 0), 0);
    if (!total) return null;
    let acc = 0;
    const parts = [];
    for (const type of TYPE_ORDER) {
      const n = counts[type] || 0;
      if (!n) continue;
      const pct = (n / total) * 100;
      parts.push(`${TYPE_COLORS[type]} ${acc}% ${acc + pct}%`);
      acc += pct;
    }
    return `conic-gradient(${parts.join(", ")})`;
  }

  function dayLetters(sessions) {
    if (!sessions?.length) return "–";
    return sessions.map((w) => TYPE_LETTERS[w.type] || w.type[0]).join(" ");
  }

  window.ForgeCalendar = {
    TYPE_LETTERS,
    TYPE_COLORS,
    TYPE_ORDER,
    shiftMonth,
    monthLabel,
    getMonthCells,
    groupByDate,
    countsByType,
    donutGradient,
    dayLetters,
  };
})();
