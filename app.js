(() => {
  const STORAGE_KEY = "forge-log-entries-v1";
  const CUSTOM_KEY = "forge-log-custom-workouts-v1";
  const MANUAL_PR_KEY = "forge-log-manual-prs-v1";
  const COACH_FEEDBACK_KEY = "forge-log-coach-feedback-v1";
  const PANELS_UI_KEY = "forge-log-panels-ui-v2";
  const LEGACY_CALENDAR_UI_KEY = "forge-log-calendar-ui-v1";

  const PANEL_IDS = ["workload", "coach", "calendar", "sessions", "prs", "detail"];

  const DEFAULT_PANELS_OPEN = {
    workload: true,
    coach: false,
    calendar: false,
    sessions: false,
    prs: false,
    detail: true,
  };

  const SECTION_HEADERS = [
    "STRENGTH ENDURANCE",
    "STRENGTH",
    "CONDITIONING",
    "SKILL",
    "ACCESSORY",
    "TEAM WORKOUT",
    "TEAM CONDITIONING",
    "PARTNER CONDITIONING",
    "HYBRID DOUBLES",
    "HYBRID",
  ];

  const state = {
    filter: "ALL",
    query: "",
    selectedId: null,
    mode: "detail", // detail | add | import-result | exercise | pr-form
    selectedExerciseId: null,
    prFormPreset: null,
    interval: "30", // 7 | 30 | 90 | all | custom
    lastPrBoard: [],
    customFrom: "",
    customTo: "",
    logs: loadLogs(),
    custom: loadCustom(),
    manualPrs: loadManualPrs(),
    coachFeedback: loadCoachFeedback(),
    detailExpanded: false,
    formulaVisible: false,
  };

  Object.assign(state, loadPanelsUi(state.custom));

  const els = {
    list: document.getElementById("workout-list"),
    detail: document.getElementById("detail"),
    detailPanel: document.getElementById("detail-panel"),
    detailPanelTitle: document.getElementById("detail-panel-title"),
    detailPanelMeta: document.getElementById("detail-panel-meta"),
    detailPanelClose: document.getElementById("detail-panel-close"),
    detailCollapseHint: document.getElementById("detail-collapse-hint"),
    stats: document.getElementById("stats"),
    search: document.getElementById("search"),
    filters: document.getElementById("filters"),
    addBtn: document.getElementById("add-workout-btn"),
    exportBtn: document.getElementById("export-csv-btn"),
    prsGrid: document.getElementById("prs-grid"),
    prsRefresh: document.getElementById("prs-refresh"),
    prsAdd: document.getElementById("prs-add"),
    coachInsights: document.getElementById("coach-insights"),
    calendarGrid: document.getElementById("calendar-grid"),
    calendarTitle: document.getElementById("calendar-title"),
    calendarLegend: document.getElementById("calendar-legend"),
    calendarPanel: document.getElementById("calendar-panel"),
    calendarPanelMeta: document.getElementById("calendar-panel-meta"),
    calendarPrev: document.getElementById("calendar-prev"),
    calendarNext: document.getElementById("calendar-next"),
    workloadPanelMeta: document.getElementById("workload-panel-meta"),
    coachPanelMeta: document.getElementById("coach-panel-meta"),
    sessionsPanelMeta: document.getElementById("sessions-panel-meta"),
    prsPanelMeta: document.getElementById("prs-panel-meta"),
    chart: document.getElementById("workload-chart"),
    chartSummary: document.getElementById("workload-summary"),
    chartLegend: document.getElementById("workload-legend"),
    chartFormula: document.getElementById("workload-formula"),
    chartFormulaToggle: document.getElementById("workload-formula-toggle"),
    chartCaption: document.getElementById("workload-caption"),
    chartPeriod: document.getElementById("workload-period"),
    intervalPresets: document.getElementById("interval-presets"),
    intervalCustom: document.getElementById("interval-custom"),
    intervalFrom: document.getElementById("interval-from"),
    intervalTo: document.getElementById("interval-to"),
    intervalApply: document.getElementById("interval-apply"),
    balloon: document.getElementById("chart-balloon"),
    openBalloon: document.getElementById("open-balloon"),
    banner: document.getElementById("app-banner"),
  };

  const WORKOUT_TYPES = ["WOD", "HYBRID", "FBB", "RUN", "WALK", "HIT", "OTHER"];

  const LOAD_WEIGHTS = {
    WOD: 1.0,
    HYBRID: 1.25,
    FBB: 0.9,
    RUN: 0.35,
    WALK: 0.2,
    HIT: 1.2,
    OTHER: 0.8,
  };

  const SERIES = [
    { key: "WOD", color: "#5ec8ff", label: "WOD" },
    { key: "HYBRID", color: "#ffb454", label: "Hybrid" },
    { key: "FBB", color: "#ff7a9a", label: "FBB" },
    { key: "RUN", color: "#7ddea0", label: "Run" },
    { key: "WALK", color: "#b8a4ff", label: "Walk" },
    { key: "HIT", color: "#ff6b4a", label: "HIT" },
    { key: "OTHER", color: "#b0a89a", label: "Other" },
  ];

  function loadManualPrs() {
    try {
      const items = JSON.parse(localStorage.getItem(MANUAL_PR_KEY) || "[]");
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  }

  function saveManualPrs() {
    localStorage.setItem(MANUAL_PR_KEY, JSON.stringify(state.manualPrs));
  }

  function loadCoachFeedback() {
    try {
      const data = JSON.parse(localStorage.getItem(COACH_FEEDBACK_KEY) || "{}");
      return {
        kinds: data.kinds || {},
        suggestionTypes: data.suggestionTypes || {},
        dismissedIds: Array.isArray(data.dismissedIds) ? data.dismissedIds : [],
      };
    } catch {
      return { kinds: {}, suggestionTypes: {}, dismissedIds: [] };
    }
  }

  function saveCoachFeedback() {
    localStorage.setItem(COACH_FEEDBACK_KEY, JSON.stringify(state.coachFeedback));
  }

  function getDefaultCalendarMonth(custom = []) {
    const workouts = [...(window.WORKOUTS || []), ...custom].sort((a, b) =>
      b.date.localeCompare(a.date)
    );
    return (workouts[0]?.date || todayIso()).slice(0, 7);
  }

  function loadPanelsUi(custom) {
    let calendarMonth = getDefaultCalendarMonth(custom);
    const panelsOpen = { ...DEFAULT_PANELS_OPEN };

    try {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_CALENDAR_UI_KEY) || "null");
      if (legacy && typeof legacy === "object") {
        panelsOpen.calendar = Boolean(legacy.open);
        if (typeof legacy.month === "string") calendarMonth = legacy.month;
      }
    } catch {
      /* ignore */
    }

    try {
      const data = JSON.parse(localStorage.getItem(PANELS_UI_KEY) || "{}");
      if (data.panels && typeof data.panels === "object") {
        for (const id of PANEL_IDS) {
          if (typeof data.panels[id] === "boolean") panelsOpen[id] = data.panels[id];
        }
      }
      if (typeof data.calendarMonth === "string") calendarMonth = data.calendarMonth;
    } catch {
      /* ignore */
    }

    return { panelsOpen, calendarMonth };
  }

  function savePanelsUi() {
    localStorage.setItem(
      PANELS_UI_KEY,
      JSON.stringify({
        panels: state.panelsOpen,
        calendarMonth: state.calendarMonth,
      })
    );
  }

  function isPanelOpen(id) {
    return Boolean(state.panelsOpen[id]);
  }

  function syncPanel(id) {
    const panel = document.querySelector(`[data-panel="${id}"]`);
    const body = document.getElementById(`${id}-panel-body`);
    const toggle = document.querySelector(`[data-panel-toggle="${id}"]`);
    if (!panel || !body || !toggle) return;

    if (id === "detail" && !state.detailExpanded) {
      panel.hidden = true;
      panel.classList.add("is-collapsed");
      body.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      return;
    }

    if (id === "detail") panel.hidden = false;

    const open = isPanelOpen(id);
    panel.classList.toggle("is-collapsed", !open);
    body.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    const hint = toggle.querySelector(".panel-collapse-hint");
    if (hint) hint.textContent = open ? "Click to collapse" : "Click to expand";
  }

  function syncAllPanels() {
    for (const id of PANEL_IDS) syncPanel(id);
  }

  function setPanelOpen(id, open) {
    if (!PANEL_IDS.includes(id)) return;
    state.panelsOpen[id] = Boolean(open);
    savePanelsUi();
    syncPanel(id);
    if (id === "calendar" && state.panelsOpen.calendar) renderCalendar();
  }

  function togglePanel(id) {
    setPanelOpen(id, !isPanelOpen(id));
  }

  function recordCoachVote(insight, direction) {
    if (!insight?.kind || !["up", "down"].includes(direction)) return;
    const key = insight.kind;
    if (!state.coachFeedback.kinds[key]) {
      state.coachFeedback.kinds[key] = { up: 0, down: 0 };
    }
    state.coachFeedback.kinds[key][direction] += 1;

    if (insight.kind === "suggestion" && insight.type) {
      if (!state.coachFeedback.suggestionTypes[insight.type]) {
        state.coachFeedback.suggestionTypes[insight.type] = { up: 0, down: 0 };
      }
      state.coachFeedback.suggestionTypes[insight.type][direction] += 1;
    }

    if (insight.id && !state.coachFeedback.dismissedIds.includes(insight.id)) {
      state.coachFeedback.dismissedIds.push(insight.id);
    }

    saveCoachFeedback();
    renderCoach();
    showBanner(
      direction === "up"
        ? "Thanks — tip hidden. Coach will show more like this later."
        : "Got it — tip hidden. Coach will adjust future tips."
    );
  }

  function ensureSeedPrs() {
    if (!window.ForgePR?.SEED_PERFORMANCES?.length) return;
    const hasBackSquat = state.manualPrs.some((p) => p.exerciseId === "back-squat");
    if (hasBackSquat) return;
    state.manualPrs.push(...window.ForgePR.SEED_PERFORMANCES);
    saveManualPrs();
  }

  function loadLogs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveLogs() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.logs));
  }

  function loadCustom() {
    try {
      const items = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
      if (!Array.isArray(items)) return [];
      const seen = new Set(
        (window.WORKOUTS || []).map((w) => workoutContentKey(w))
      );
      const deduped = [];
      for (const item of items) {
        const key = workoutContentKey(item);
        if (seen.has(key)) continue;
        seen.add(key);
        deduped.push(item);
      }
      if (deduped.length !== items.length) {
        localStorage.setItem(CUSTOM_KEY, JSON.stringify(deduped));
      }
      return deduped;
    } catch {
      return [];
    }
  }

  function showBanner(message, isError = false) {
    if (!els.banner) return;
    els.banner.hidden = !message;
    els.banner.textContent = message || "";
    els.banner.classList.toggle("is-error", Boolean(isError));
    if (message) {
      clearTimeout(showBanner._timer);
      showBanner._timer = setTimeout(() => {
        els.banner.hidden = true;
        els.banner.textContent = "";
      }, 4200);
    }
  }

  function saveCustom() {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(state.custom));
  }

  function allWorkouts() {
    return [...(window.WORKOUTS || []), ...state.custom].filter(
      (w) => !state.logs[w.id]?.deleted
    );
  }

  function formatDate(iso) {
    const d = new Date(`${iso}T12:00:00`);
    return d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function todayIso() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function badgeClass(type) {
    return type.toLowerCase();
  }

  function sessionLoad(workout) {
    const base = LOAD_WEIGHTS[workout.type] ?? 1;
    if (workout.type === "RUN" || workout.type === "WALK") {
      const km = Number(workout.activity?.distanceKm || 0);
      return base + km * (workout.type === "RUN" ? 0.28 : 0.12);
    }
    let load = base;
    const sectionNames = (workout.sections || []).map((s) => s.name);
    if (sectionNames.some((n) => /STRENGTH/.test(n))) load += 0.25;
    if (sectionNames.some((n) => /CONDITIONING|HYBRID|TEAM|PARTNER/.test(n))) {
      load += 0.35;
    }
    if (
      (workout.sections || []).some((s) =>
        /1RM|AMRAP|FOR TIME/i.test(`${s.format || ""} ${s.content || ""}`)
      )
    ) {
      load += 0.15;
    }
    return Math.round(load * 100) / 100;
  }

  function weekStartIso(isoDate) {
    const d = new Date(`${isoDate}T12:00:00`);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dayNum = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dayNum}`;
  }

  function addDaysIso(iso, days) {
    const d = new Date(`${iso}T12:00:00`);
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dayNum = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dayNum}`;
  }

  function getIntervalRange() {
    const workouts = allWorkouts().slice().sort((a, b) => a.date.localeCompare(b.date));
    const dataStart = workouts[0]?.date || todayIso();
    const dataEnd = workouts[workouts.length - 1]?.date || todayIso();
    const today = todayIso();
    // Anchor "last N days" to the latest available session so historical logs stay visible
    const anchorEnd = dataEnd > today ? dataEnd : today;

    if (state.interval === "all") {
      return { from: dataStart, to: dataEnd, label: "All time" };
    }

    if (state.interval === "custom") {
      let from = state.customFrom || addDaysIso(anchorEnd, -29);
      let to = state.customTo || anchorEnd;
      if (from > to) [from, to] = [to, from];
      return { from, to, label: "Custom interval" };
    }

    const days = Number(state.interval) || 30;
    return {
      from: addDaysIso(anchorEnd, -(days - 1)),
      to: anchorEnd,
      label: `Last ${days} days`,
    };
  }

  function emptyWeekBucket(week) {
    return {
      week,
      total: 0,
      sessions: 0,
      runKm: 0,
      byType: Object.fromEntries(WORKOUT_TYPES.map((t) => [t, 0])),
      items: [],
    };
  }

  function buildWeeklyLoad(range) {
    const byWeek = new Map();
    const from = range?.from;
    const to = range?.to;

    for (const w of allWorkouts()) {
      if (!isCompleted(w)) continue;
      if (from && w.date < from) continue;
      if (to && w.date > to) continue;
      const week = weekStartIso(w.date);
      if (!byWeek.has(week)) byWeek.set(week, emptyWeekBucket(week));
      const bucket = byWeek.get(week);
      const load = sessionLoad(w);
      bucket.total += load;
      bucket.sessions += 1;
      bucket.byType[w.type] = (bucket.byType[w.type] || 0) + load;
      bucket.items.push({ ...w, load });
      if (w.type === "RUN" && w.activity?.distanceKm != null) {
        bucket.runKm += Number(w.activity.distanceKm);
      }
    }

    if (from && to) {
      let cursor = weekStartIso(from);
      const last = weekStartIso(to);
      while (cursor <= last) {
        if (!byWeek.has(cursor)) byWeek.set(cursor, emptyWeekBucket(cursor));
        cursor = addDaysIso(cursor, 7);
      }
    }

    return [...byWeek.values()]
      .map((b) => ({
        ...b,
        total: Math.round(b.total * 100) / 100,
        runKm: Math.round(b.runKm * 100) / 100,
        items: b.items.slice().sort((a, c) => a.date.localeCompare(c.date)),
      }))
      .sort((a, b) => a.week.localeCompare(b.week));
  }

  function weekEndIso(weekStart) {
    return addDaysIso(weekStart, 6);
  }

  function isoWeekNumber(isoDate) {
    const d = new Date(`${isoDate}T12:00:00`);
    // ISO week: Thursday-based week number
    const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    return Math.ceil(((target - yearStart) / 86400000 + 1) / 7);
  }

  function weekLabel(weekStart) {
    return `W${isoWeekNumber(weekStart)}`;
  }

  function formatPeriodDate(iso) {
    const d = new Date(`${iso}T12:00:00`);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatShortDate(iso) {
    const d = new Date(`${iso}T12:00:00`);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  }

  function syncFormulaVisibility() {
    if (!els.chartFormula || !els.chartFormulaToggle) return;
    els.chartFormula.hidden = !state.formulaVisible;
    els.chartFormulaToggle.hidden = state.formulaVisible;
  }

  function syncIntervalControls() {
    if (!els.intervalPresets) return;
    els.intervalPresets.querySelectorAll("[data-interval]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.interval === state.interval);
    });
    if (els.intervalCustom) {
      els.intervalCustom.hidden = state.interval !== "custom";
    }
    const range = getIntervalRange();
    if (els.intervalFrom && !els.intervalFrom.value) els.intervalFrom.value = range.from;
    if (els.intervalTo && !els.intervalTo.value) els.intervalTo.value = range.to;
    if (state.interval === "custom") {
      if (els.intervalFrom) els.intervalFrom.value = state.customFrom || range.from;
      if (els.intervalTo) els.intervalTo.value = state.customTo || range.to;
    }
  }

  function activeTypeFilter() {
    return SERIES.some((s) => s.key === state.filter) ? state.filter : null;
  }

  function syncFilterButtons() {
    if (!els.filters) return;
    els.filters.querySelectorAll("[data-filter]").forEach((el) => {
      el.classList.toggle("is-active", el.dataset.filter === state.filter);
    });
  }

  function setTypeFilter(next) {
    state.filter = next || "ALL";
    syncFilterButtons();
    renderList();
    renderWorkload();
  }

  function weeksForChart(weeks) {
    const typeFilter = activeTypeFilter();
    if (!typeFilter) return weeks;
    return weeks.map((w) => {
      const value = Math.round((w.byType[typeFilter] || 0) * 100) / 100;
      const items = (w.items || []).filter((i) => i.type === typeFilter);
      const byType = Object.fromEntries(WORKOUT_TYPES.map((t) => [t, 0]));
      byType[typeFilter] = value;
      return {
        ...w,
        total: value,
        sessions: items.length,
        runKm:
          typeFilter === "RUN"
            ? Math.round(
                items.reduce((sum, i) => sum + Number(i.activity?.distanceKm || 0), 0) * 100
              ) / 100
            : 0,
        byType,
        items,
      };
    });
  }

  function renderWorkload() {
    const range = getIntervalRange();
    const weeks = weeksForChart(buildWeeklyLoad(range));
    if (!els.chart) return;
    syncIntervalControls();
    syncFilterButtons();

    const typeFilter = activeTypeFilter();
    const series = typeFilter ? SERIES.filter((s) => s.key === typeFilter) : SERIES;

    const inRangeSessions = allWorkouts().filter((w) => {
      if (!isCompleted(w)) return false;
      if (w.date < range.from || w.date > range.to) return false;
      if (typeFilter && w.type !== typeFilter) return false;
      return true;
    });
    const firstSession = inRangeSessions
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))[0]?.date;
    const lastSession = inRangeSessions
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))[0]?.date;
    const firstWeek = weeks[0]?.week || range.from;
    const lastWeek = weeks[weeks.length - 1]?.week || range.to;
    const periodEnd = weekEndIso(lastWeek);

    const totalLoad = weeks.reduce((s, w) => s + w.total, 0);
    const peak = weeks.reduce((m, w) => Math.max(m, w.total), 0);
    const activeWeeks = weeks.filter((w) => w.sessions > 0);
    const avg = activeWeeks.length ? totalLoad / activeWeeks.length : 0;
    const runKm = weeks.reduce((s, w) => s + w.runKm, 0);
    const weekCount = weeks.length;
    const daySpan =
      Math.round(
        (new Date(`${range.to}T12:00:00`) - new Date(`${range.from}T12:00:00`)) / 86400000
      ) + 1;

    if (els.chartCaption) {
      els.chartCaption.textContent = `${range.label}${typeFilter ? ` · ${typeFilter}` : ""} · ${weekCount} week${weekCount === 1 ? "" : "s"} · Mon–Sun buckets`;
    }

    if (els.chartPeriod) {
      els.chartPeriod.textContent = `${formatPeriodDate(range.from)} → ${formatPeriodDate(range.to)}  ·  ${daySpan} days${
        firstSession && lastSession
          ? `  ·  sessions ${formatPeriodDate(firstSession)}–${formatPeriodDate(lastSession)}`
          : "  ·  no sessions in range"
      }`;
    }

    if (els.workloadPanelMeta) {
      els.workloadPanelMeta.textContent = `${formatPeriodDate(range.from)} → ${formatPeriodDate(range.to)}`;
    }

    if (els.chartFormula) {
      els.chartFormula.textContent =
        "Load formula (completed sessions only): WOD 1.0 · Hybrid 1.25 · FBB 0.9 · HIT 1.2 · Other 0.8 · Run 0.35+0.28/km · Walk 0.2+0.12/km · +0.25 strength · +0.35 conditioning/team · +0.15 hard effort (1RM/AMRAP/For Time). Weekly total = sum of session loads. Click a legend item to filter.";
    }

    els.chartSummary.innerHTML = `
      <div class="stat"><strong>${totalLoad.toFixed(1)}</strong><span>Total load</span></div>
      <div class="stat"><strong>${avg.toFixed(1)}</strong><span>Avg / week</span></div>
      <div class="stat"><strong>${peak.toFixed(1)}</strong><span>Peak week</span></div>
      <div class="stat"><strong>${runKm.toFixed(1)}</strong><span>Run km</span></div>
    `;

    els.chartLegend.innerHTML =
      SERIES.map((s) => {
        const active = typeFilter === s.key;
        const dimmed = Boolean(typeFilter && !active);
        return `
      <button type="button" class="legend-item${active ? " is-active" : ""}${dimmed ? " is-dimmed" : ""}" data-legend-filter="${s.key}">
        <span class="legend-swatch" style="background:${s.color}"></span>${s.label}
      </button>`;
      }).join("") +
      `
      <button type="button" class="legend-item${!typeFilter ? " is-active" : ""}" data-legend-filter="ALL">
        <span class="legend-swatch" style="background:var(--accent);height:3px;width:14px;border-radius:99px"></span>Total load
      </button>`;

    els.chartLegend.querySelectorAll("[data-legend-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = btn.dataset.legendFilter;
        if (next === "ALL") {
          setTypeFilter("ALL");
          return;
        }
        setTypeFilter(state.filter === next ? "ALL" : next);
      });
    });

    const width = 920;
    const height = 280;
    const pad = { top: 28, right: 24, bottom: 54, left: 42 };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;
    const maxY = Math.max(peak * 1.15, 1);
    const barGroupW = plotW / Math.max(weeks.length, 1);
    const barW = Math.min(42, barGroupW * 0.62);

    const y = (v) => pad.top + plotH - (v / maxY) * plotH;
    const xCenter = (i) => pad.left + i * barGroupW + barGroupW / 2;

    const periodLabel = `Period: ${formatPeriodDate(range.from)} – ${formatPeriodDate(range.to)}`;

    const gridLines = [0, 0.25, 0.5, 0.75, 1]
      .map((t) => {
        const val = maxY * t;
        const yy = y(val);
        return `
          <line x1="${pad.left}" y1="${yy}" x2="${width - pad.right}" y2="${yy}" stroke="rgba(232,224,200,0.1)" />
          <text x="${pad.left - 8}" y="${yy + 4}" text-anchor="end" fill="#9a947f" font-size="11" font-family="IBM Plex Mono, monospace">${val.toFixed(1)}</text>
        `;
      })
      .join("");

    const stacks = weeks
      .map((week, i) => {
        let yCursor = 0;
        const rects = series.map((serie) => {
          const value = week.byType[serie.key] || 0;
          if (!value) return "";
          const y0 = yCursor;
          yCursor += value;
          const top = y(yCursor);
          const bottom = y(y0);
          const h = Math.max(bottom - top, 0);
          const cx = xCenter(i) - barW / 2;
          return `<rect x="${cx}" y="${top}" width="${barW}" height="${h}" fill="${serie.color}" rx="2" pointer-events="none" />`;
        }).join("");

        const labelDate = new Date(`${week.week}T12:00:00`);
        const dayMonth = labelDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        });
        const hitX = pad.left + i * barGroupW;
        const hitW = barGroupW;

        return `
          <g class="week-group" data-week-index="${i}">
            ${rects}
            <rect class="chart-hit" data-week-index="${i}" x="${hitX}" y="${pad.top}" width="${hitW}" height="${plotH}" />
            <text x="${xCenter(i)}" y="${height - 28}" text-anchor="middle" fill="#c8f04d" font-size="11" font-family="IBM Plex Mono, monospace" pointer-events="none">${weekLabel(week.week)}</text>
            <text x="${xCenter(i)}" y="${height - 14}" text-anchor="middle" fill="#9a947f" font-size="10" font-family="IBM Plex Sans, sans-serif" pointer-events="none">${dayMonth}</text>
            ${
              week.total > 0
                ? `<text x="${xCenter(i)}" y="${y(week.total) - 8}" text-anchor="middle" fill="#ebe6d6" font-size="11" font-family="IBM Plex Mono, monospace" pointer-events="none">${week.total.toFixed(1)}</text>`
                : ""
            }
            <circle cx="${xCenter(i)}" cy="${y(week.total)}" r="3.5" fill="#c8f04d" pointer-events="none" />
          </g>
        `;
      })
      .join("");

    const linePoints = weeks
      .map((week, i) => `${i === 0 ? "M" : "L"} ${xCenter(i)} ${y(week.total)}`)
      .join(" ");

    els.chart.innerHTML = `
      <rect width="${width}" height="${height}" fill="transparent" />
      ${gridLines}
      <path d="${linePoints}" fill="none" stroke="#c8f04d" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" pointer-events="none" />
      ${stacks}
      <text x="${pad.left}" y="16" fill="#9a947f" font-size="11" font-family="IBM Plex Sans, sans-serif" pointer-events="none">Load units / week · ${periodLabel}</text>
    `;

    bindChartBalloon(weeks);
  }

  function hideChartBalloon() {
    if (!els.balloon) return;
    els.balloon.hidden = true;
    els.balloon.innerHTML = "";
  }

  function firstContentLine(section) {
    if (!section) return "";
    return String(section.content || "")
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l) || "";
  }

  function clip(text, max = 42) {
    const t = String(text || "").replace(/\s+/g, " ").trim();
    if (!t) return "";
    return t.length > max ? `${t.slice(0, max - 1)}…` : t;
  }

  function sectionByName(workout, matcher) {
    return (workout.sections || []).find((s) => matcher.test(s.name || ""));
  }

  function shortSessionInfo(workout) {
    const type = workout.type;

    if (type === "RUN" || type === "WALK") {
      const a = workout.activity || {};
      const pace = paceText(a);
      return [
        a.distanceKm != null ? `${a.distanceKm} km` : null,
        a.duration || null,
        pace || null,
      ].filter(Boolean);
    }

    if (type === "HYBRID") {
      const hybrid =
        sectionByName(workout, /HYBRID|DOUBLES/) || (workout.sections || [])[0];
      return [
        clip(hybrid?.format || "Hybrid", 36),
        clip(firstContentLine(hybrid), 36),
      ].filter(Boolean);
    }

    if (type === "FBB") {
      const strength = sectionByName(workout, /^STRENGTH$/);
      const accessory = sectionByName(workout, /ACCESSORY/);
      const endurance = sectionByName(workout, /ENDURANCE/);
      return [
        strength ? clip(firstContentLine(strength) || strength.format, 36) : null,
        accessory ? clip(firstContentLine(accessory) || accessory.format, 36) : null,
        endurance ? clip(endurance.format || firstContentLine(endurance), 36) : null,
      ].filter(Boolean);
    }

    // WOD: strength lift + conditioning format
    const strength = sectionByName(workout, /STRENGTH/);
    const conditioning = sectionByName(
      workout,
      /CONDITIONING|TEAM|PARTNER|FRAN|NANCY/
    );
    return [
      strength ? clip(firstContentLine(strength) || strength.format, 36) : null,
      conditioning
        ? clip(conditioning.format || firstContentLine(conditioning), 36)
        : null,
    ].filter(Boolean);
  }

  function sessionDetailText(workout) {
    return shortSessionInfo(workout).join("\n");
  }

  function renderBalloonContent(week) {
    const weekEnd = weekEndIso(week.week);
    if (!week.items.length) {
      return `
        <div class="chart-balloon-head">
          <div>
            <strong>${weekLabel(week.week)} · ${formatPeriodDate(week.week)} – ${formatPeriodDate(weekEnd)}</strong>
            <span>No sessions this week</span>
          </div>
        </div>`;
    }

    const list = week.items
      .map((item) => {
        const isRunWalk = item.type === "RUN" || item.type === "WALK";
        const title = isRunWalk
          ? [item.activity?.distanceKm != null ? `${item.activity.distanceKm} km` : null, item.activity?.duration || null]
              .filter(Boolean)
              .join(" · ")
          : item.title;
        const details = shortSessionInfo(item).join("\n");

        return `
          <li class="chart-balloon-item" data-session-id="${escapeAttr(item.id)}">
            <div class="chart-balloon-row">
              <span class="badge ${badgeClass(item.type)}">${item.type}</span>
              <span class="title">${escapeHtml(title || item.title)}</span>
              <button type="button" class="balloon-plus" data-expand="${escapeAttr(item.id)}" aria-expanded="false" aria-label="Show session details">+</button>
            </div>
            <div class="balloon-details" data-details-for="${escapeAttr(item.id)}" hidden>${escapeHtml(details || item.title)}</div>
            <button type="button" class="balloon-open" data-open="${escapeAttr(item.id)}" hidden>Open session</button>
          </li>`;
      })
      .join("");

    return `
      <div class="chart-balloon-head">
        <div>
          <strong>${weekLabel(week.week)} · ${formatPeriodDate(week.week)} – ${formatPeriodDate(weekEnd)}</strong>
          <span>${week.sessions} session${week.sessions === 1 ? "" : "s"} · load ${week.total.toFixed(2)}</span>
        </div>
      </div>
      <ul class="chart-balloon-list">${list}</ul>`;
  }

  function positionBalloon(hitEl) {
    const wrap = els.chart.closest(".workload-chart-wrap");
    if (!wrap || !els.balloon || !hitEl) return;
    const wrapRect = wrap.getBoundingClientRect();
    const hitRect = hitEl.getBoundingClientRect();
    const balloonRect = els.balloon.getBoundingClientRect();
    let left = hitRect.left - wrapRect.left + hitRect.width / 2 - balloonRect.width / 2;
    let top = hitRect.top - wrapRect.top - balloonRect.height - 10;
    left = Math.max(8, Math.min(left, wrapRect.width - balloonRect.width - 8));
    if (top < 8) top = hitRect.bottom - wrapRect.top + 10;
    els.balloon.style.left = `${left}px`;
    els.balloon.style.top = `${top}px`;
  }

  function bindChartBalloon(weeks) {
    if (!els.chart || !els.balloon) return;
    hideChartBalloon();

    let hideTimer = null;
    const clearHide = () => {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
    };

    const showWeek = (index, hitEl) => {
      const week = weeks[index];
      if (!week) return;
      clearHide();
      els.balloon.hidden = false;
      els.balloon.innerHTML = renderBalloonContent(week);
      positionBalloon(hitEl);
    };

    els.chart.querySelectorAll(".chart-hit").forEach((hit) => {
      hit.addEventListener("mouseenter", () => {
        showWeek(Number(hit.dataset.weekIndex), hit);
      });
      hit.addEventListener("mousemove", () => {
        if (!els.balloon.hidden) positionBalloon(hit);
      });
      hit.addEventListener("mouseleave", () => {
        clearHide();
        hideTimer = setTimeout(() => {
          if (!els.balloon.matches(":hover")) hideChartBalloon();
        }, 160);
      });
    });

    els.balloon.onmouseenter = () => clearHide();
    els.balloon.onmouseleave = () => {
      clearHide();
      hideTimer = setTimeout(hideChartBalloon, 120);
    };

    els.balloon.onclick = (e) => {
      const expandBtn = e.target.closest("[data-expand]");
      if (expandBtn) {
        const id = expandBtn.dataset.expand;
        const details = els.balloon.querySelector(`[data-details-for="${CSS.escape(id)}"]`);
        const openBtn = els.balloon.querySelector(`[data-open="${CSS.escape(id)}"]`);
        if (!details) return;
        const open = details.hidden;
        details.hidden = !open;
        if (openBtn) openBtn.hidden = !open;
        expandBtn.setAttribute("aria-expanded", open ? "true" : "false");
        expandBtn.textContent = open ? "−" : "+";
        return;
      }

      const openBtn = e.target.closest("[data-open]");
      if (openBtn) {
        const id = openBtn.dataset.open;
        hideChartBalloon();
        selectWorkout(id, { open: true });
        document.getElementById("detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
  }

  function isPastDue(workout) {
    return Boolean(workout?.date && workout.date < todayIso());
  }

  function getLog(id) {
    return state.logs[id] || null;
  }

  function isCompleted(workoutOrId) {
    const workout =
      typeof workoutOrId === "string"
        ? allWorkouts().find((w) => w.id === workoutOrId)
        : workoutOrId;
    if (!workout) return false;
    const entry = getLog(workout.id);
    if (entry && typeof entry.completed === "boolean") return entry.completed;
    // Default: past-due sessions count as complete
    if (isPastDue(workout)) return true;
    if (workout.activity?.duration || workout.activity?.distanceKm != null) return true;
    return false;
  }

  function setCompleted(workout, completed) {
    const prev = getLog(workout.id) || {};
    state.logs[workout.id] = {
      ...prev,
      completed: Boolean(completed),
      completedManual: true,
      updatedAt: new Date().toISOString(),
    };
    saveLogs();
  }

  function deleteWorkoutById(id) {
    const workout = allWorkouts().find((w) => w.id === id);
    if (!workout) return false;
    if (workout.custom) {
      state.custom = state.custom.filter((w) => w.id !== id);
      saveCustom();
    } else {
      // Seeded sessions can't be removed from data file; mark deleted in logs
      const prev = getLog(id) || {};
      state.logs[id] = {
        ...prev,
        deleted: true,
        completed: true,
        completedManual: true,
        updatedAt: new Date().toISOString(),
      };
      saveLogs();
      return true;
    }
    delete state.logs[id];
    saveLogs();
    return true;
  }

  function afterWorkoutDeleted(deletedId) {
    if (state.selectedId === deletedId) {
      state.selectedId =
        allWorkouts().sort((a, b) => b.date.localeCompare(a.date))[0]?.id || null;
      state.detailExpanded = false;
    }
    hideOpenBalloon();
    renderPrs();
    renderStats();
    renderWorkload();
    renderList();
    renderDetail();
    syncDetailPanel();
    showBanner("Session deleted.");
  }

  function confirmDeleteWorkout(id) {
    const workout = allWorkouts().find((w) => w.id === id);
    if (!workout) return;
    const label = `${formatDate(workout.date)} · ${workout.title}`;
    if (!window.confirm(`Delete this session?\n\n${label}`)) return;
    if (deleteWorkoutById(id)) afterWorkoutDeleted(id);
  }

  function hideOpenBalloon() {
    if (!els.openBalloon) return;
    els.openBalloon.hidden = true;
    els.openBalloon.innerHTML = "";
  }

  function showOpenBalloon(workoutId, anchorEl) {
    const workout = allWorkouts().find((w) => w.id === workoutId);
    if (!workout || !els.openBalloon || !anchorEl) return;

    hideOpenBalloon();
    els.openBalloon.hidden = false;
    els.openBalloon.innerHTML = `
      <p class="open-balloon-title">${escapeHtml(clip(workout.title, 36))}</p>
      <button type="button" class="open-balloon-action" data-action="complete">Mark complete</button>
      <button type="button" class="open-balloon-action is-danger" data-action="delete">Delete</button>
    `;

    const rect = anchorEl.getBoundingClientRect();
    const balloonRect = els.openBalloon.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - balloonRect.width / 2;
    let top = rect.bottom + 8;
    left = Math.max(8, Math.min(left, window.innerWidth - balloonRect.width - 8));
    if (top + balloonRect.height > window.innerHeight - 8) {
      top = rect.top - balloonRect.height - 8;
    }
    els.openBalloon.style.left = `${left}px`;
    els.openBalloon.style.top = `${top}px`;

    els.openBalloon.onclick = (e) => {
      const actionBtn = e.target.closest("[data-action]");
      if (!actionBtn) return;
      const action = actionBtn.dataset.action;
      if (action === "complete") {
        setCompleted(workout, true);
        hideOpenBalloon();
        showBanner("Marked complete.");
        renderStats();
        renderList();
        if (state.selectedId === workout.id) renderDetail();
        return;
      }
      if (action === "delete") {
        if (deleteWorkoutById(workout.id)) afterWorkoutDeleted(workout.id);
      }
    };
  }

  function ensurePastDueComplete() {
    let changed = false;
    for (const w of allWorkouts()) {
      if (!isPastDue(w)) continue;
      const entry = getLog(w.id);
      if (entry && typeof entry.completed === "boolean") continue;
      state.logs[w.id] = {
        ...(entry || {}),
        completed: true,
        completedAuto: true,
        updatedAt: new Date().toISOString(),
      };
      changed = true;
    }
    if (changed) saveLogs();
  }

  function isLogged(id) {
    const entry = getLog(id);
    if (!entry || entry.deleted) return false;
    return Boolean(
      entry.score ||
        entry.strengthLoad ||
        entry.rpe ||
        entry.notes ||
        entry.avgPace
    );
  }

  function parseDate(text) {
    const patterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
      /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
      /(\d{1,2})\s+de\s+(janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+(\d{4})/i,
    ];
    const monthsPt = {
      janeiro: "01",
      fevereiro: "02",
      março: "03",
      marco: "03",
      abril: "04",
      maio: "05",
      junho: "06",
      julho: "07",
      agosto: "08",
      setembro: "09",
      outubro: "10",
      novembro: "11",
      dezembro: "12",
    };

    for (const re of patterns) {
      const m = text.match(re);
      if (!m) continue;
      if (re.source.startsWith("(\\d{1,2})[\\/\\-](\\d{1,2})")) {
        const [, dd, mm, yyyy] = m;
        return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
      }
      if (re.source.startsWith("(\\d{4})")) {
        const [, yyyy, mm, dd] = m;
        return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
      }
      const [, dd, monthName, yyyy] = m;
      const mm = monthsPt[monthName.toLowerCase()];
      if (mm) return `${yyyy}-${mm}-${dd.padStart(2, "0")}`;
    }
    return null;
  }

  function parseType(text) {
    const upper = text.toUpperCase();
    if (/\bWALK\b/.test(upper)) return "WALK";
    if (/\bRUN\b/.test(upper)) return "RUN";
    if (/\bFBB\b/.test(upper)) return "FBB";
    if (/\bHYBRID\b/.test(upper)) return "HYBRID";
    if (/\bHIT\b/.test(upper)) return "HIT";
    if (/\bOTHER\b/.test(upper)) return "OTHER";
    if (/\bWOD\b/.test(upper)) return "WOD";
    return "WOD";
  }

  function parseActivityLine(line) {
    // Run  Sun, 09/08/2026  Outdoor run  29:36  5.02 km  11 m
    const cleaned = line.replace(/\t+/g, " ").replace(/\s{2,}/g, " ").trim();
    const match = cleaned.match(
      /^(Run|Walk)\s+(?:[A-Za-z]{3},\s*)?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\s+(Outdoor (?:run|walk)|.+?)\s+(\d+:\d{2}(?::\d{2})?)\s+(\d+(?:\.\d+)?)\s*km(?:\s+(\d+(?:\.\d+)?)\s*m)?/i
    );
    if (!match) return null;

    const type = match[1].toUpperCase();
    const date = parseDate(match[2]) || todayIso();
    const title = match[3].trim();
    const duration = match[4];
    const distanceKm = Number(match[5]);
    const elevationM = match[6] != null ? Number(match[6]) : 0;
    const pace = paceText({ duration, distanceKm });

    return {
      type,
      date,
      title,
      activity: { duration, distanceKm, elevationM },
      sections: [
        {
          name: type,
          format: /outdoor/i.test(title) ? "Outdoor" : undefined,
          content: [
            `Duration: ${duration}`,
            `Distance: ${distanceKm.toFixed(2)} km`,
            pace ? `Avg pace: ${pace}` : null,
            `Elevation: ${elevationM} m`,
          ]
            .filter(Boolean)
            .join("\n"),
          scoreType: "time",
          scoreLabel: "Duration",
        },
      ],
    };
  }

  function uniqueId(date, type, extra = []) {
    const idBase = `${date}-${type.toLowerCase()}`;
    let id = idBase;
    let n = 2;
    const exists = (candidate) =>
      allWorkouts().some((w) => w.id === candidate) ||
      extra.some((w) => w.id === candidate);
    while (exists(id)) {
      id = `${idBase}-${n++}`;
    }
    return id;
  }

  function activityPreview(w) {
    if (!w.activity) return "";
    const parts = [];
    if (w.activity.duration) parts.push(w.activity.duration);
    if (w.activity.distanceKm != null) parts.push(`${w.activity.distanceKm} km`);
    const pace = paceText(w.activity);
    if (pace) parts.push(pace);
    else if (w.activity.elevationM != null) parts.push(`${w.activity.elevationM} m`);
    return parts.join(" · ");
  }

  function durationToSeconds(duration) {
    if (!duration) return 0;
    const parts = String(duration)
      .trim()
      .split(":")
      .map((p) => Number(p));
    if (parts.some((n) => Number.isNaN(n))) return 0;
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 1) return parts[0];
    return 0;
  }

  function formatPace(secondsPerKm) {
    if (!Number.isFinite(secondsPerKm) || secondsPerKm <= 0) return null;
    let total = Math.round(secondsPerKm);
    const mm = Math.floor(total / 60);
    const ss = total % 60;
    return `${mm}:${String(ss).padStart(2, "0")} /km`;
  }

  function paceText(activity) {
    const seconds = durationToSeconds(activity?.duration);
    const km = Number(activity?.distanceKm);
    if (!seconds || !km) return null;
    return formatPace(seconds / km);
  }

  function averagePaceForType(type) {
    const items = allWorkouts().filter(
      (w) => w.type === type && w.activity?.duration && Number(w.activity.distanceKm) > 0
    );
    if (!items.length) return null;
    const totalSeconds = items.reduce(
      (sum, w) => sum + durationToSeconds(w.activity.duration),
      0
    );
    const totalKm = items.reduce((sum, w) => sum + Number(w.activity.distanceKm), 0);
    if (!totalKm) return null;
    return formatPace(totalSeconds / totalKm);
  }

  function detectScoreType(block) {
    const u = block.toUpperCase();
    if (/FOR TIME|TIME CAP|CAP\s*:/.test(u)) return "time";
    if (/AMRAP|ROUNDS/.test(u)) return "rounds";
    if (/1RM|BUILD 1RM/.test(u)) return "weight";
    if (/MAX |REPS|WORST SET/.test(u)) return "reps";
    return "notes";
  }

  function parseSections(raw) {
    const lines = raw.replace(/\r\n/g, "\n").split("\n");
    const headerRe = new RegExp(
      `^\\s*(?:[•\\-\\*]\\s*)?(${SECTION_HEADERS.join("|")})\\b`,
      "i"
    );

    const sections = [];
    let current = null;

    for (const line of lines) {
      const match = line.match(headerRe);
      if (match) {
        if (current) sections.push(current);
        current = { name: match[1].toUpperCase(), contentLines: [] };
        const rest = line.slice(match[0].length).trim();
        if (rest) current.contentLines.push(rest);
        continue;
      }
      if (!current) continue;
      current.contentLines.push(line);
    }
    if (current) sections.push(current);

    if (!sections.length) {
      return [
        {
          name: "WORKOUT",
          content: raw.trim(),
          scoreType: detectScoreType(raw),
        },
      ];
    }

    return sections.map((s) => {
      const content = s.contentLines.join("\n").trim();
      const formatLine = s.contentLines.map((l) => l.trim()).find(Boolean) || "";
      const looksLikeFormat =
        /every|emom|amrap|for time|rounds|window|sets|cap|on\s*[-–]\s*off/i.test(
          formatLine
        ) && formatLine.length < 80;
      return {
        name: s.name,
        format: looksLikeFormat ? formatLine : undefined,
        content: looksLikeFormat
          ? s.contentLines.slice(1).join("\n").trim() || content
          : content,
        scoreType: detectScoreType(content),
      };
    });
  }

  function titleFromText(raw, type, sections) {
    const firstSection = sections.find((s) => s.content)?.content || raw;
    const firstLine =
      firstSection
        .split("\n")
        .map((l) => l.trim())
        .find((l) => l && !/^(for time|every|emom|amrap|buy in)/i.test(l)) ||
      type;
    return firstLine.slice(0, 72);
  }

  function normalizeContent(text) {
    return String(text || "")
      .replace(/\r\n/g, "\n")
      .replace(/\t+/g, " ")
      .split("\n")
      .map((line) => line.replace(/[ \t]+$/g, "").trimEnd())
      .join("\n")
      .trim();
  }

  function workoutContentKey(workout) {
    if (workout.activity) {
      const a = workout.activity;
      return normalizeContent(
        [
          workout.type,
          workout.date,
          workout.title,
          a.duration || "",
          a.distanceKm != null ? String(a.distanceKm) : "",
          a.elevationM != null ? String(a.elevationM) : "",
        ].join("|")
      );
    }

    const sections = (workout.sections || [])
      .map((s) =>
        normalizeContent([s.name || "", s.format || "", s.content || ""].join("\n"))
      )
      .join("\n---\n");
    return normalizeContent(`${workout.date}\n${workout.type}\n${sections}`);
  }

  function contentKeys(workout) {
    const keys = new Set();
    keys.add(workoutContentKey(workout));
    if (workout.rawText) keys.add(normalizeContent(workout.rawText));
    return keys;
  }

  function findExactDuplicate(candidate, extras = []) {
    const candidateKeys = contentKeys(candidate);
    return [...allWorkouts(), ...extras].find((existing) => {
      if (existing.id === candidate.id) return false;
      const existingKeys = contentKeys(existing);
      for (const key of candidateKeys) {
        if (existingKeys.has(key)) return true;
      }
      return false;
    });
  }

  function isSessionStartLine(line, { prevBlank = true } = {}) {
    const t = String(line || "")
      .trim()
      .replace(/^[•\-–—*]+(\s+)?/, "");
    if (!t) return false;
    if (parseActivityLine(t)) return true;
    if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/.test(t)) return true;
    if (/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/.test(t)) return true;
    // Portuguese long dates only start a session after a blank/separator line
    if (/^\d{1,2}\s+de\s+[a-zçãáéíóú]+\s+de\s+\d{4}/i.test(t)) return prevBlank;
    if (/^(WOD|HYBRID(?:\s+DOUBLES)?|FBB|HIT|OTHER)\b/i.test(t) && t.length < 40) return prevBlank;
    return false;
  }

  function splitIntoEntryBlocks(text) {
    const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
    const blocks = [];
    let current = [];

    const flush = () => {
      const block = current.join("\n").trim();
      if (block) blocks.push(block);
      current = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const prev = i > 0 ? lines[i - 1].trim() : "";
      const prevBlank = i === 0 || !prev || /^[_—\-]+$/.test(prev);
      if (isSessionStartLine(line, { prevBlank }) && current.some((l) => l.trim())) {
        flush();
      }
      current.push(line);
    }
    flush();
    return blocks.length ? blocks : [];
  }

  function parseSingleWorkoutBlock(block, pending = []) {
    const text = block.trim();
    if (!text) return [];

    const lines = text
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);
    const activityParsed = lines.map((line) => ({ line, parsed: parseActivityLine(line) }));
    const activityHits = activityParsed.filter((x) => x.parsed);

    // Block is only run/walk lines → one entry per line
    if (activityHits.length && activityHits.length === lines.length) {
      return activityHits.map(({ line, parsed }) => {
        const id = uniqueId(parsed.date, parsed.type, [...pending]);
        const entry = {
          id,
          date: parsed.date,
          type: parsed.type,
          title: parsed.title,
          activity: parsed.activity,
          rawText: line,
          custom: true,
          sections: parsed.sections,
        };
        pending.push(entry);
        return entry;
      });
    }

    // Mixed: keep activity lines as their own entries, rest as one gym block
    if (activityHits.length) {
      const entries = [];
      const gymLines = [];
      for (const { line, parsed } of activityParsed) {
        if (parsed) {
          const id = uniqueId(parsed.date, parsed.type, [...pending, ...entries]);
          const entry = {
            id,
            date: parsed.date,
            type: parsed.type,
            title: parsed.title,
            activity: parsed.activity,
            rawText: line,
            custom: true,
            sections: parsed.sections,
          };
          entries.push(entry);
          pending.push(entry);
        } else {
          gymLines.push(line);
        }
      }
      if (gymLines.length) {
        const gymText = gymLines.join("\n");
        const date = parseDate(gymText) || todayIso();
        const type = parseType(gymText);
        const sections = parseSections(gymText);
        const id = uniqueId(date, type, [...pending, ...entries]);
        const entry = {
          id,
          date,
          type,
          title: titleFromText(gymText, type, sections),
          rawText: gymText,
          custom: true,
          sections,
        };
        entries.push(entry);
        pending.push(entry);
      }
      return entries;
    }

    const date = parseDate(text) || todayIso();
    const type = parseType(text);
    const sections = parseSections(text);
    const id = uniqueId(date, type, pending);
    const entry = {
      id,
      date,
      type,
      title: titleFromText(text, type, sections),
      rawText: text,
      custom: true,
      sections,
    };
    pending.push(entry);
    return [entry];
  }

  function parseWorkoutText(raw) {
    const text = raw.trim();
    if (!text) return null;

    const blocks = splitIntoEntryBlocks(text);
    if (!blocks.length) return null;

    const results = [];
    for (const block of blocks) {
      results.push(...parseSingleWorkoutBlock(block, results));
    }
    return results.length ? results : null;
  }

  function detectEntryCount(raw) {
    const parsed = parseWorkoutText(raw);
    return parsed ? parsed.length : 0;
  }

  function filteredWorkouts() {
    const q = state.query.trim().toLowerCase();
    return allWorkouts()
      .filter((w) => {
        const completed = isCompleted(w);
        if (WORKOUT_TYPES.includes(state.filter) && w.type !== state.filter) return false;
        if (state.filter === "LOGGED" && !completed) return false;
        if (!q) return true;
        const hay = [
          w.title,
          w.type,
          w.date,
          w.rawText,
          activityPreview(w),
          ...(w.sections || []).flatMap((s) => [s.name, s.content, s.format]),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  function initCalendarMonth() {
    return getDefaultCalendarMonth(state.custom);
  }

  function renderCalendar() {
    if (!els.calendarGrid || !window.ForgeCalendar) return;
    const cal = window.ForgeCalendar;
    const byDate = cal.groupByDate(allWorkouts());
    const cells = cal.getMonthCells(state.calendarMonth);
    const today = todayIso();
    const monthLabel = cal.monthLabel(state.calendarMonth);

    if (els.calendarTitle) {
      els.calendarTitle.textContent = monthLabel;
    }
    if (els.calendarPanelMeta) {
      els.calendarPanelMeta.textContent = monthLabel;
    }

    if (!isPanelOpen("calendar")) return;

    els.calendarGrid.innerHTML = cells
      .map((iso) => {
        if (!iso) return `<div class="calendar-cell is-empty"></div>`;
        const sessions = byDate.get(iso) || [];
        const counts = cal.countsByType(sessions);
        const gradient = cal.donutGradient(counts);
        const dayNum = Number(iso.slice(-2));
        const letters = cal.dayLetters(sessions);
        const isToday = iso === today;
        const hasSessions = sessions.length > 0;
        const donutStyle = gradient
          ? `style="background:${gradient}"`
          : `style="background:color-mix(in srgb, var(--line) 55%, transparent)"`;

        return `
          <button type="button" class="calendar-cell${isToday ? " is-today" : ""}${hasSessions ? " has-sessions" : ""}" data-date="${escapeAttr(iso)}" title="${hasSessions ? escapeAttr(sessions.map((w) => w.title).join(" · ")) : "Rest day"}">
            <div class="calendar-donut" ${donutStyle}>
              <span class="calendar-donut-hole">${dayNum}</span>
            </div>
            <span class="calendar-letters">${escapeHtml(letters)}</span>
          </button>`;
      })
      .join("");

    if (els.calendarLegend) {
      els.calendarLegend.innerHTML = cal.TYPE_ORDER.map(
        (type) =>
          `<span class="calendar-key"><span class="calendar-key-swatch" style="background:${cal.TYPE_COLORS[type]}"></span>${cal.TYPE_LETTERS[type]} ${type}</span>`
      ).join("");
    }

    els.calendarGrid.querySelectorAll("[data-date]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const iso = btn.dataset.date;
        const sessions = (byDate.get(iso) || []).slice().sort((a, b) => a.title.localeCompare(b.title));
        if (!sessions.length) return;
        highlightSession(sessions[0].id);
      });
    });
  }

  function renderCoach() {
    if (!els.coachInsights || !window.ForgeCoach) return;
    const insights = window.ForgeCoach.buildInsights({
      workouts: allWorkouts(),
      isCompleted,
      prBoard: getPrBoard(),
      today: todayIso(),
      feedback: state.coachFeedback,
    });

    if (!insights.length) {
      els.coachInsights.innerHTML =
        `<p class="coach-empty">No recommendations right now. Complete sessions to unlock new tips.</p>`;
      if (els.coachPanelMeta) els.coachPanelMeta.textContent = "No tips";
      return;
    }

    if (els.coachPanelMeta) {
      els.coachPanelMeta.textContent = `${insights.length} tip${insights.length === 1 ? "" : "s"}`;
    }

    els.coachInsights.innerHTML = insights
      .map((item) => {
        const warn = item.severity === "warn" ? " is-warn" : "";
        const action =
          item.kind === "suggestion" && item.workoutId
            ? `<button type="button" class="coach-action" data-coach-workout="${escapeAttr(item.workoutId)}">Open suggested session</button>`
            : "";
        const sub =
          item.kind === "suggestion" && item.reason
            ? `<p class="coach-reason">${escapeHtml(item.reason)}</p>`
            : "";
        return `
          <article class="coach-card${warn}" data-kind="${escapeAttr(item.kind)}" data-insight-id="${escapeAttr(item.id)}">
            <span class="coach-icon" aria-hidden="true">${item.icon}</span>
            <div class="coach-body">
              <p class="coach-text">${escapeHtml(item.text).replace(/\n/g, "<br>")}</p>
              ${sub}
              ${action}
            </div>
            <div class="coach-feedback" aria-label="Rate this tip">
              <button type="button" class="coach-vote" data-vote="up" data-insight-id="${escapeAttr(item.id)}" title="Helpful" aria-label="Helpful">↑</button>
              <button type="button" class="coach-vote" data-vote="down" data-insight-id="${escapeAttr(item.id)}" title="Not helpful" aria-label="Not helpful">↓</button>
            </div>
          </article>`;
      })
      .join("");

    els.coachInsights.querySelectorAll("[data-coach-workout]").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectWorkout(btn.dataset.coachWorkout, { open: true });
      });
    });

    els.coachInsights.querySelectorAll("[data-vote]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const insight = insights.find((item) => item.id === btn.dataset.insightId);
        if (!insight) return;
        recordCoachVote(insight, btn.dataset.vote);
      });
    });
  }

  function renderStats() {
    const workouts = allWorkouts();
    const total = workouts.length;
    const completedCount = workouts.filter((w) => isCompleted(w)).length;
    const openCount = total - completedCount;
    const runKm = workouts
      .filter((w) => w.type === "RUN" && w.activity?.distanceKm != null)
      .reduce((sum, w) => sum + Number(w.activity.distanceKm), 0);
    const avgRunPace = averagePaceForType("RUN");
    const avgWalkPace = averagePaceForType("WALK");
    const byType = WORKOUT_TYPES.map((t) => ({
      t,
      n: workouts.filter((w) => w.type === t).length,
    }));

    const statCard = (value, label, tone = "") =>
      `<div class="stat${tone ? ` is-${tone}` : ""}"><strong>${value}</strong><span>${label}</span></div>`;

    const statGroup = (title, cards) =>
      `<div class="stat-group${title ? "" : " stat-group-plain"}">
        ${title ? `<p class="stat-group-label">${title}</p>` : ""}
        <div class="stat-group-cards">${cards}</div>
      </div>`;

    els.stats.innerHTML = `
      ${statGroup(
        "Overview",
        [
          statCard(total, "Sessions", "accent"),
          statCard(completedCount, "Complete", "ok"),
          statCard(openCount, "Open", "open"),
        ].join("")
      )}
      ${statGroup(
        "Running",
        [
          statCard(runKm.toFixed(1), "Run km", "run"),
          avgRunPace ? statCard(avgRunPace.replace(" /km", ""), "Run pace", "run") : "",
          avgWalkPace ? statCard(avgWalkPace.replace(" /km", ""), "Walk pace", "walk") : "",
        ]
          .filter(Boolean)
          .join("")
      )}
      ${statGroup(
        "",
        byType
          .filter((x) => x.n > 0)
          .map((x) => statCard(x.n, x.t, badgeClass(x.t)))
          .join("")
      )}
    `;
    renderWorkload();
    renderCoach();
    renderCalendar();
  }

  function renderList() {
    const items = filteredWorkouts();
    if (els.sessionsPanelMeta) {
      const n = items.length;
      els.sessionsPanelMeta.textContent = `${n} session${n === 1 ? "" : "s"}`;
    }
    if (!items.length) {
      els.list.innerHTML = `<li style="padding:1rem;color:var(--muted)">No sessions match.</li>`;
      return;
    }

    els.list.innerHTML = items
      .map((w) => {
        const entry = state.logs[w.id] || {};
        const selected =
          state.mode === "detail" && w.id === state.selectedId ? "is-selected" : "";
        const completed = isCompleted(w);
        const logged = isLogged(w.id) ? "is-logged" : "";
        const previewText = (() => {
          if (w.activity) {
            const pace = paceText(w.activity) || entry.avgPace;
            const parts = [];
            if (w.activity.duration || entry.score) parts.push(entry.score || w.activity.duration);
            if (w.activity.distanceKm != null) parts.push(`${w.activity.distanceKm} km`);
            if (pace) parts.push(pace);
            return parts.join(" · ");
          }
          return entry.score || "";
        })();
        const preview = previewText
          ? `<div class="score-preview">${escapeHtml(previewText)}</div>`
          : "";
        const status = completed
          ? ""
          : `<button type="button" class="status-pill is-open" data-open-menu="${escapeAttr(w.id)}" aria-haspopup="true">Open</button>`;
        return `
          <li>
            <div class="workout-item-wrap">
              <button class="workout-item ${selected} ${logged}" data-id="${w.id}" type="button" title="Double-click to open details">
                <div class="meta-row">
                  <span class="date">${formatDate(w.date)}</span>
                  <span class="badge ${badgeClass(w.type)}">${w.type}</span>
                </div>
                <div class="title">${escapeHtml(w.title)}</div>
                ${preview}
              </button>
              ${status}
            </div>
          </li>
        `;
      })
      .join("");

    els.list.querySelectorAll("[data-open-menu]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        showOpenBalloon(btn.dataset.openMenu, btn);
      });
    });
  }

  function primaryScoreMeta(workout) {
    const withScore = [...(workout.sections || [])]
      .reverse()
      .find((s) => s.scoreType);
    if (!withScore) {
      return { scoreType: "notes", scoreLabel: "Score / result" };
    }
    const labels = {
      time: "Time (mm:ss)",
      weight: withScore.scoreLabel || "Load (kg)",
      reps: withScore.scoreLabel || "Reps",
      rounds: withScore.scoreLabel || "Rounds + reps",
      notes: withScore.scoreLabel || "Result",
    };
    return {
      scoreType: withScore.scoreType,
      scoreLabel: labels[withScore.scoreType] || "Score",
      timeCap: withScore.timeCap,
    };
  }

  function entryLabel(workout) {
    if (!workout) return "Unknown";
    if (workout.activity) {
      const bits = [
        workout.type,
        workout.activity.distanceKm != null ? `${workout.activity.distanceKm} km` : null,
        workout.activity.duration || null,
      ].filter(Boolean);
      return `${workout.date} · ${bits.join(" · ")}`;
    }
    return `${workout.date} · ${workout.type} · ${clip(workout.title, 40)}`;
  }

  function importWorkoutsFromText(raw) {
    const text = String(raw || "").trim();
    const result = { accepted: [], failed: [] };
    if (!text) {
      result.failed.push({ label: "Paste", reason: "Nothing to import — paste is empty." });
      return result;
    }

    const blocks = splitIntoEntryBlocks(text);
    if (!blocks.length) {
      result.failed.push({
        label: "Paste",
        reason: "Could not detect any workout entries.",
      });
      return result;
    }

    const pending = [];
    for (const block of blocks) {
      const firstLine = block.split("\n").map((l) => l.trim()).find(Boolean) || "Entry";
      const entries = parseSingleWorkoutBlock(block, pending);
      if (!entries.length) {
        result.failed.push({
          label: clip(firstLine, 52),
          reason: "Could not parse this block.",
        });
        continue;
      }

      for (const entry of entries) {
        // parseSingleWorkoutBlock already pushed into pending; remove and re-check dups
        const idx = pending.findIndex((p) => p.id === entry.id);
        if (idx >= 0) pending.splice(idx, 1);

        const duplicate = findExactDuplicate(entry, [...result.accepted, ...pending]);
        if (duplicate) {
          result.failed.push({
            label: entryLabel(entry),
            reason: `Duplicate — same content as ${entryLabel(duplicate)}`,
          });
          continue;
        }
        result.accepted.push(entry);
        pending.push(entry);
      }
    }

    return result;
  }

  function renderImportFeedback(report) {
    const added = report.accepted || [];
    const failed = report.failed || [];
    state.mode = "import-result";

    els.detail.innerHTML = `
      <div class="import-report">
        <h1>Import result</h1>
        <p class="hint">${added.length} added · ${failed.length} failed</p>

        <section class="report-block report-ok">
          <h2>Added (${added.length})</h2>
          ${
            added.length
              ? `<ul class="report-list">${added
                  .map(
                    (w) =>
                      `<li><span class="badge ${badgeClass(w.type)}">${w.type}</span><span>${escapeHtml(entryLabel(w))}</span></li>`
                  )
                  .join("")}</ul>`
              : `<p class="report-empty">No workouts were added.</p>`
          }
        </section>

        <section class="report-block report-fail">
          <h2>Failed (${failed.length})</h2>
          ${
            failed.length
              ? `<ul class="report-list">${failed
                  .map(
                    (f) =>
                      `<li><strong>${escapeHtml(f.label)}</strong><span>${escapeHtml(f.reason)}</span></li>`
                  )
                  .join("")}</ul>`
              : `<p class="report-empty">No failures.</p>`
          }
        </section>

        <div class="actions">
          <button class="btn btn-primary" type="button" id="import-done">Done</button>
          <button class="btn btn-ghost" type="button" id="import-again">Add more</button>
        </div>
      </div>
    `;

    document.getElementById("import-done").addEventListener("click", () => {
      state.mode = "detail";
      if (added.length) state.selectedId = added[added.length - 1].id;
      renderList();
      renderDetail();
    });

    document.getElementById("import-again").addEventListener("click", () => {
      state.mode = "add";
      renderList();
      renderAddForm();
    });
  }

  function renderAddForm() {
    state.mode = "add";
    els.detail.innerHTML = `
      <form class="add-form" id="add-form">
        <div>
          <h1>Add workout</h1>
          <p class="hint">Paste one or many sessions. Multiple WODs/Hybrids (date headers) or Run/Walk lines are split into separate entries.</p>
        </div>
        <label class="field full">
          <span class="sr-only">Workout text</span>
          <textarea
            class="full-text"
            id="workout-text"
            placeholder="22/06/2026 - WOD&#10;STRENGTH&#10;...&#10;&#10;24/06/2026 - HYBRID&#10;...&#10;&#10;Run&#9;Sun, 09/08/2026&#9;Outdoor run&#9;29:36&#9;5.02 km&#9;11 m"
            autofocus
          ></textarea>
        </label>
        <p class="add-detect" id="add-detect">Detected 0 entries</p>
        <p class="add-error" id="add-error"></p>
        <div class="actions">
          <button class="btn btn-primary" type="submit" id="add-submit">Save workout</button>
          <button class="btn btn-ghost" type="button" id="cancel-add">Cancel</button>
        </div>
      </form>
    `;

    const form = document.getElementById("add-form");
    const textarea = document.getElementById("workout-text");
    const errorEl = document.getElementById("add-error");
    const detectEl = document.getElementById("add-detect");
    const submitBtn = document.getElementById("add-submit");

    function refreshDetect() {
      const count = detectEntryCount(textarea.value);
      detectEl.textContent =
        count === 0
          ? "Detected 0 entries"
          : count === 1
            ? "Detected 1 entry"
            : `Detected ${count} entries`;
      submitBtn.textContent = count > 1 ? `Save ${count} workouts` : "Save workout";
    }

    textarea.addEventListener("input", refreshDetect);
    refreshDetect();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      errorEl.textContent = "";
      const report = importWorkoutsFromText(textarea.value);

      if (!report.accepted.length && !report.failed.length) {
        errorEl.textContent = "Paste one or more workouts / run-walk lines first.";
        return;
      }

      if (report.accepted.length) {
        state.custom.push(...report.accepted);
        saveCustom();
        state.selectedId = report.accepted[report.accepted.length - 1].id;
        renderStats();
        renderList();
      }

      showBanner(
        `${report.accepted.length} added · ${report.failed.length} failed`
      );
      renderImportFeedback(report);
    });

    document.getElementById("cancel-add").addEventListener("click", () => {
      state.mode = "detail";
      renderList();
      renderDetail();
    });

    textarea.focus();
  }

  function slugifyExercise(name) {
    return String(name || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "custom";
  }

  function catalogExercises() {
    if (!window.ForgePR) return [];
    return [
      ...window.ForgePR.LIFTS.map((l) => ({ id: l.id, name: l.name, kind: "lift" })),
      ...window.ForgePR.RUNS.map((r) => ({ id: r.id, name: r.name, kind: "run" })),
    ];
  }

  function resolveExerciseMeta(exerciseId, customName, kindHint) {
    const known = catalogExercises().find((e) => e.id === exerciseId);
    if (known) return known;
    const name = (customName || "").trim() || "Custom";
    return {
      id: exerciseId && exerciseId !== "custom" ? exerciseId : slugifyExercise(name),
      name,
      kind: kindHint === "run" ? "run" : "lift",
    };
  }

  function getPrBoard() {
    if (!window.ForgePR) return [];
    const performances = [
      ...window.ForgePR.collectPerformances(allWorkouts(), state.logs),
      ...state.manualPrs,
    ];
    return window.ForgePR.buildPrBoard(performances);
  }

  function openPrForm(presetExerciseId = null) {
    state.mode = "pr-form";
    state.prFormPreset = presetExerciseId;
    state.selectedExerciseId = null;
    expandDetail();
    renderPrs();
    renderPrForm();
  }

  function renderPrs() {
    if (!els.prsGrid || !window.ForgePR) return;
    const board = getPrBoard();
    state.lastPrBoard = board;

    if (els.prsPanelMeta) {
      els.prsPanelMeta.textContent = `${board.length} PR${board.length === 1 ? "" : "s"}`;
    }

    const cards = board
      .map((item) => {
        const selected =
          state.mode === "exercise" && state.selectedExerciseId === item.exerciseId
            ? "is-selected"
            : "";
        const manualBest = item.best?.source === "manual";
        return `
          <button type="button" class="pr-card ${selected}" data-exercise="${escapeAttr(item.exerciseId)}">
            <div class="pr-card-name">
              <span>${escapeHtml(item.name)}</span>
              <span>${item.kind === "run" ? "🏃" : "🏆"}</span>
            </div>
            <div class="pr-card-value">${escapeHtml(window.ForgePR.formatPerf(item.best))}</div>
            <div class="pr-card-date">${formatPeriodDate(item.best.date)}${manualBest ? " · manual" : ""}</div>
          </button>`;
      })
      .join("");

    const empty = !board.length
      ? `<p class="pr-empty">No PRs yet. Click a card after logging loads, or add one manually.</p>`
      : "";

    els.prsGrid.innerHTML =
      empty +
      cards +
      `<button type="button" class="pr-card pr-card-add" id="prs-add-card">
        <div class="pr-card-name"><span>Add PR</span><span>+</span></div>
        <div class="pr-card-value">Manual entry</div>
        <div class="pr-card-date">Lift or run mark</div>
      </button>`;

    els.prsGrid.querySelectorAll("[data-exercise]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.mode = "exercise";
        state.selectedExerciseId = btn.dataset.exercise;
        expandDetail();
        renderPrs();
        renderProgression(btn.dataset.exercise);
        syncDetailPanel();
      });
    });

    document.getElementById("prs-add-card")?.addEventListener("click", () => openPrForm());
  }

  function renderPrForm() {
    const catalog = catalogExercises();
    const preset = state.prFormPreset;
    const options = catalog
      .map(
        (e) =>
          `<option value="${escapeAttr(e.id)}" data-kind="${e.kind}" ${
            preset === e.id ? "selected" : ""
          }>${escapeHtml(e.name)}</option>`
      )
      .join("");

    els.detail.innerHTML = `
      <div class="progression-panel">
        <div class="meta-row">
          <span class="badge hybrid">MANUAL PR</span>
        </div>
        <h1>Add personal record</h1>
        <p class="progression-best">Save a lift or run mark without tying it to a session.</p>
        <form class="log-form" id="manual-pr-form">
          <div class="form-grid">
            <div class="field">
              <label for="pr-exercise">Exercise</label>
              <select id="pr-exercise" name="exercise" required>
                ${options}
                <option value="custom" data-kind="lift">Other (custom)…</option>
              </select>
            </div>
            <div class="field" id="pr-custom-wrap" hidden>
              <label for="pr-custom-name">Custom name</label>
              <input id="pr-custom-name" name="customName" placeholder="e.g. Strict Press" />
            </div>
            <div class="field">
              <label for="pr-date">Date</label>
              <input id="pr-date" name="date" type="date" value="${escapeAttr(todayIso())}" required />
            </div>
            <div class="field" id="pr-weight-wrap">
              <label for="pr-weight">Weight (kg)</label>
              <input id="pr-weight" name="weight" inputmode="decimal" placeholder="95" />
            </div>
            <div class="field" id="pr-time-wrap" hidden>
              <label for="pr-time">Time (mm:ss)</label>
              <input id="pr-time" name="time" placeholder="27:30" />
            </div>
            <div class="field full">
              <label for="pr-notes">Notes (optional)</label>
              <input id="pr-notes" name="notes" placeholder="Gym, conditions…" />
            </div>
          </div>
          <div class="actions">
            <button class="btn btn-primary" type="submit">Save PR</button>
            <button class="btn btn-ghost" type="button" id="pr-form-cancel">Cancel</button>
          </div>
        </form>
      </div>
    `;

    const exerciseEl = document.getElementById("pr-exercise");
    const customWrap = document.getElementById("pr-custom-wrap");
    const weightWrap = document.getElementById("pr-weight-wrap");
    const timeWrap = document.getElementById("pr-time-wrap");

    function syncKindFields() {
      const opt = exerciseEl.selectedOptions[0];
      const kind = opt?.dataset.kind || "lift";
      const isCustom = exerciseEl.value === "custom";
      customWrap.hidden = !isCustom;
      const isRun = kind === "run" && !isCustom;
      weightWrap.hidden = isRun;
      timeWrap.hidden = !isRun;
    }

    exerciseEl.addEventListener("change", syncKindFields);
    syncKindFields();

    document.getElementById("pr-form-cancel").addEventListener("click", () => {
      state.mode = state.prFormPreset ? "exercise" : "detail";
      state.selectedExerciseId = state.prFormPreset;
      state.prFormPreset = null;
      renderPrs();
      if (state.mode === "exercise" && state.selectedExerciseId) {
        renderProgression(state.selectedExerciseId);
      } else {
        renderDetail();
      }
    });

    document.getElementById("manual-pr-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const exerciseValue = exerciseEl.value;
      const opt = exerciseEl.selectedOptions[0];
      const kindHint = opt?.dataset.kind || "lift";
      const customName = document.getElementById("pr-custom-name").value.trim();
      const meta = resolveExerciseMeta(
        exerciseValue === "custom" ? slugifyExercise(customName) : exerciseValue,
        customName,
        kindHint
      );
      if (exerciseValue === "custom" && !customName) {
        showBanner("Enter a custom exercise name.", true);
        return;
      }

      const date = document.getElementById("pr-date").value;
      const notes = document.getElementById("pr-notes").value.trim();
      let entry;

      if (meta.kind === "run") {
        const time = document.getElementById("pr-time").value.trim();
        const seconds = window.ForgePR.durationToSeconds(time);
        if (!date || !seconds) {
          showBanner("Enter a valid date and time (mm:ss).", true);
          return;
        }
        entry = {
          id: `manual-${Date.now()}`,
          exerciseId: meta.id,
          name: meta.name,
          kind: "run",
          date,
          seconds,
          notes: notes || undefined,
          source: "manual",
        };
      } else {
        const weightRaw = document.getElementById("pr-weight").value.trim().replace(",", ".");
        const weightKg = Number(weightRaw);
        if (!date || !weightKg || Number.isNaN(weightKg)) {
          showBanner("Enter a valid date and weight (kg).", true);
          return;
        }
        entry = {
          id: `manual-${Date.now()}`,
          exerciseId: meta.id,
          name: meta.name,
          kind: "lift",
          date,
          weightKg,
          notes: notes || undefined,
          source: "manual",
        };
      }

      const before = state.lastPrBoard || [];
      state.manualPrs.push(entry);
      saveManualPrs();
      const after = getPrBoard();
      const news = window.ForgePR.detectNewPrs(before, after);
      state.lastPrBoard = after;
      state.mode = "exercise";
      state.selectedExerciseId = entry.exerciseId;
      state.prFormPreset = null;
      renderPrs();
      renderProgression(entry.exerciseId);
      if (news.length) showNewPrToasts(news);
      else showBanner(`Saved ${entry.name} mark.`);
    });
  }

  function renderProgression(exerciseId) {
    const board = getPrBoard();
    const item = board.find((b) => b.exerciseId === exerciseId);
    if (!item) {
      state.mode = "detail";
      state.selectedExerciseId = null;
      renderDetail();
      return;
    }

    state.mode = "exercise";
    state.selectedExerciseId = exerciseId;

    els.detail.innerHTML = `
      <div class="progression-panel">
        <div class="meta-row">
          <span class="badge wod">PROGRESSION</span>
        </div>
        <h1>${escapeHtml(item.name.toUpperCase())}</h1>
        <p class="progression-best">Best: <strong>${escapeHtml(window.ForgePR.formatPerf(item.best))}</strong> · ${formatPeriodDate(item.best.date)}</p>
        <ul class="progression-list">
          ${item.timeline
            .map((row) => {
              const manualId = row.source === "manual" ? row.id : "";
              return `
            <li class="${row.isPr ? "is-pr" : ""}">
              <span class="date">${formatShortDate(row.date)}</span>
              <span>${escapeHtml(window.ForgePR.formatPerf(row))}${
                row.source === "manual" ? ` <em class="pr-manual-tag">manual</em>` : ""
              }</span>
              <span class="trophy-actions">
                <span class="trophy">${row.isPr ? "🏆" : ""}</span>
                ${
                  manualId
                    ? `<button type="button" class="btn btn-ghost btn-tiny" data-delete-manual="${escapeAttr(manualId)}" title="Delete manual mark">✕</button>`
                    : ""
                }
              </span>
            </li>`;
            })
            .join("")}
        </ul>
        <div class="actions" style="margin-top:1rem">
          <button type="button" class="btn btn-primary" id="progression-add">Add mark</button>
          <button type="button" class="btn btn-ghost" id="progression-back">Back to session</button>
        </div>
      </div>
    `;

    document.getElementById("progression-back").addEventListener("click", () => {
      state.mode = "detail";
      state.selectedExerciseId = null;
      renderPrs();
      renderDetail();
    });

    document.getElementById("progression-add").addEventListener("click", () => {
      openPrForm(exerciseId);
    });

    els.detail.querySelectorAll("[data-delete-manual]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.deleteManual;
        state.manualPrs = state.manualPrs.filter((p) => p.id !== id);
        saveManualPrs();
        renderPrs();
        const still = getPrBoard().find((b) => b.exerciseId === exerciseId);
        if (still) renderProgression(exerciseId);
        else {
          state.mode = "detail";
          state.selectedExerciseId = null;
          renderDetail();
        }
        showBanner("Manual mark deleted.");
      });
    });
  }

  function showNewPrToasts(news) {
    if (!news?.length || !window.ForgePR) return;
    const first = news[0];
    const more = news.length > 1 ? ` (+${news.length - 1} more)` : "";
    const body = `
      <div class="pr-toast" id="pr-toast">
        <strong>🔥 Novo PR — ${escapeHtml(first.name)}${more}</strong>
        <div class="pr-line">${escapeHtml(window.ForgePR.formatPerf(first.best))}</div>
        ${
          first.delta
            ? `<div class="pr-delta">${escapeHtml(first.delta)}</div>`
            : `<div class="pr-delta">First recorded mark</div>`
        }
      </div>`;
    const existing = document.getElementById("pr-toast");
    if (existing) existing.remove();
    const host = document.querySelector(".prs-panel") || document.querySelector(".app");
    if (host) host.insertAdjacentHTML("beforeend", body);
    showBanner(`Novo PR — ${first.name}${more}`);
    setTimeout(() => document.getElementById("pr-toast")?.remove(), 6000);
  }

  function evaluatePrsAfterLog() {
    if (!window.ForgePR) return [];
    const before = state.lastPrBoard || [];
    const after = getPrBoard();
    const news = window.ForgePR.detectNewPrs(before, after);
    state.lastPrBoard = after;
    renderPrs();
    return news;
  }

  function renderDetail() {
    syncDetailPanel();

    if (state.mode === "add") {
      renderAddForm();
      return;
    }
    if (state.mode === "import-result") {
      return;
    }
    if (state.mode === "pr-form") {
      renderPrForm();
      return;
    }
    if (state.mode === "exercise" && state.selectedExerciseId) {
      renderProgression(state.selectedExerciseId);
      return;
    }

    const workout = allWorkouts().find((w) => w.id === state.selectedId);
    if (!workout) {
      els.detail.innerHTML = `
        <div class="empty-detail">
          <p class="empty-kicker">Select a session</p>
          <p>Pick a workout to log strength loads, conditioning scores, and notes.</p>
        </div>`;
      return;
    }

    const entry = state.logs[workout.id] || {
      completed: false,
      score: "",
      strengthLoad: "",
      rpe: "",
      notes: "",
    };
    const completed = isCompleted(workout);
    const pastDue = isPastDue(workout);
    const meta = primaryScoreMeta(workout);
    const subBits = [formatDate(workout.date)];
    if (workout.classTime) subBits.push(workout.classTime);
    if (workout.box) subBits.push(workout.box);
    if (meta.timeCap) subBits.push(`Cap ${meta.timeCap}`);
    const pace = paceText(workout.activity);
    if (pace) subBits.push(pace);
    if (pastDue) subBits.push("Past due");

    const metrics = workout.activity
      ? `
      <div class="activity-metrics">
        <div class="metric"><strong>${escapeHtml(workout.activity.duration || "—")}</strong><span>Duration</span></div>
        <div class="metric"><strong>${workout.activity.distanceKm != null ? `${workout.activity.distanceKm} km` : "—"}</strong><span>Distance</span></div>
        <div class="metric"><strong>${escapeHtml(pace || "—")}</strong><span>Avg pace</span></div>
        <div class="metric"><strong>${workout.activity.elevationM != null ? `${workout.activity.elevationM} m` : "—"}</strong><span>Elevation</span></div>
      </div>`
      : "";

    const defaultScore = entry.score || workout.activity?.duration || "";
    const openPill = completed
      ? ""
      : `<button type="button" class="status-pill is-open" id="detail-open-menu" aria-haspopup="true">Open</button>`;

    els.detail.innerHTML = `
      <div class="detail-header">
        <div>
          <div class="meta-row">
            <span class="badge ${badgeClass(workout.type)}">${workout.type}</span>
            ${openPill}
          </div>
          <h1>${escapeHtml(workout.title)}</h1>
          <p class="detail-sub">${escapeHtml(subBits.join(" · "))}</p>
        </div>
      </div>

      ${metrics}

      <div class="sections">
        ${workout.sections
          .map(
            (s) => `
          <article class="section-card">
            <h3>${escapeHtml(s.name)}</h3>
            ${s.format ? `<p class="section-format">${escapeHtml(s.format)}</p>` : ""}
            <pre class="section-content">${escapeHtml(s.content || "")}</pre>
          </article>`
          )
          .join("")}
      </div>

      <form class="log-form" id="log-form">
        <h2>Your log</h2>
        <div class="form-grid">
          <div class="field">
            <label for="score">${escapeHtml(workout.activity ? "Duration" : meta.scoreLabel)}</label>
            <input id="score" name="score" value="${escapeAttr(defaultScore)}" placeholder="${meta.scoreType === "time" || workout.activity ? "12:34" : ""}" />
          </div>
          <div class="field">
            <label for="strengthLoad">${workout.activity ? "Distance (km)" : "Strength load / 1RM"}</label>
            <input id="strengthLoad" name="strengthLoad" value="${escapeAttr(entry.strengthLoad || (workout.activity && workout.activity.distanceKm != null ? String(workout.activity.distanceKm) : ""))}" placeholder="${workout.activity ? "5.02" : "e.g. 120kg / 4x5 @80%"}" />
          </div>
          ${
            workout.activity
              ? `<div class="field">
            <label for="avg-pace">Avg pace</label>
            <input id="avg-pace" name="avgPace" value="${escapeAttr(entry.avgPace || pace || "")}" readonly />
          </div>
          <div class="field">
            <label for="elevation">Elevation (m)</label>
            <input id="elevation" name="elevation" value="${escapeAttr(entry.elevation != null ? String(entry.elevation) : workout.activity.elevationM != null ? String(workout.activity.elevationM) : "")}" placeholder="11" />
          </div>`
              : ""
          }
          <div class="field">
            <label for="rpe">Session RPE</label>
            <input id="rpe" name="rpe" value="${escapeAttr(entry.rpe || "")}" placeholder="1–10" />
          </div>
          <div class="field full">
            <label for="notes">Notes</label>
            <textarea id="notes" name="notes" placeholder="Scaling, feels, partner, Rx/Scaled…">${escapeHtml(entry.notes || "")}</textarea>
          </div>
        </div>
        <div class="actions">
          <button class="btn btn-primary" type="submit">Save log</button>
          <button class="btn btn-ghost" type="button" id="clear-log">Clear</button>
          <button class="btn btn-danger" type="button" id="delete-workout">Delete workout</button>
          <span class="save-flash" id="save-flash">Saved</span>
        </div>
      </form>
    `;

    const openMenuBtn = document.getElementById("detail-open-menu");
    if (openMenuBtn) {
      openMenuBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        showOpenBalloon(workout.id, openMenuBtn);
      });
    }

    const form = document.getElementById("log-form");
    const scoreInput = document.getElementById("score");
    const distanceInput = document.getElementById("strengthLoad");
    const paceInput = document.getElementById("avg-pace");

    function refreshLogPace() {
      if (!paceInput || !workout.activity) return;
      const duration = scoreInput.value.trim();
      const distanceRaw = distanceInput.value.trim().replace(/,/g, ".");
      const distanceMatch = distanceRaw.match(/(\d+(?:\.\d+)?)/);
      const distanceKm = distanceMatch ? Number(distanceMatch[1]) : 0;
      const nextPace = paceText({ duration, distanceKm });
      paceInput.value = nextPace || "";
    }

    if (workout.activity) {
      scoreInput.addEventListener("input", refreshLogPace);
      distanceInput.addEventListener("input", refreshLogPace);
      refreshLogPace();
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const payload = {
        completed: isCompleted(workout),
        completedManual: getLog(workout.id)?.completedManual || false,
        score: document.getElementById("score").value.trim(),
        strengthLoad: document.getElementById("strengthLoad").value.trim(),
        rpe: document.getElementById("rpe").value.trim(),
        notes: document.getElementById("notes").value.trim(),
        updatedAt: new Date().toISOString(),
      };
      if (typeof getLog(workout.id)?.completed === "boolean") {
        payload.completed = getLog(workout.id).completed;
      }
      if (workout.activity) {
        payload.avgPace = document.getElementById("avg-pace")?.value.trim() || "";
        payload.elevation = document.getElementById("elevation")?.value.trim() || "";
      }
      state.logs[workout.id] = {
        ...(getLog(workout.id) || {}),
        ...payload,
      };
      saveLogs();
      const newPrs = evaluatePrsAfterLog();
      renderStats();
      renderList();
      const flash = document.getElementById("save-flash");
      flash.classList.add("is-on");
      setTimeout(() => flash.classList.remove("is-on"), 1200);
      renderDetail();
      if (newPrs.length) showNewPrToasts(newPrs);
    });

    document.getElementById("clear-log").addEventListener("click", () => {
      const prev = getLog(workout.id) || {};
      if (prev.deleted) return;
      if (typeof prev.completed === "boolean") {
        state.logs[workout.id] = {
          completed: prev.completed,
          completedManual: prev.completedManual,
          updatedAt: new Date().toISOString(),
        };
      } else {
        delete state.logs[workout.id];
      }
      saveLogs();
      renderPrs();
      renderStats();
      renderList();
      renderDetail();
    });

    document.getElementById("delete-workout").addEventListener("click", () => {
      confirmDeleteWorkout(workout.id);
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replaceAll("'", "&#39;");
  }

  function selectWorkout(id, { open = false } = {}) {
    state.mode = "detail";
    state.selectedExerciseId = null;
    state.selectedId = id;
    state.detailExpanded = Boolean(open);
    if (open) state.panelsOpen.detail = true;
    renderPrs();
    renderList();
    renderDetail();
    syncDetailPanel();
    if (open && els.detailPanel) {
      els.detailPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function highlightSession(id) {
    state.mode = "detail";
    state.selectedExerciseId = null;
    state.selectedId = id;
    if (!els.list) return;
    els.list.querySelectorAll(".workout-item[data-id]").forEach((el) => {
      el.classList.toggle("is-selected", el.dataset.id === id);
    });
  }

  function csvEscape(value) {
    const text = value == null ? "" : String(value);
    if (/[",\n\r]/.test(text)) {
      return `"${text.replaceAll('"', '""')}"`;
    }
    return text;
  }

  function workoutDetail(workout) {
    const entry = getLog(workout.id) || {};
    const parts = [];

    if (workout.type === "RUN" || workout.type === "WALK") {
      parts.push(workout.title || workout.type);
      if (workout.activity?.duration) parts.push(`Duration: ${workout.activity.duration}`);
      if (workout.activity?.distanceKm != null) {
        parts.push(`Distance: ${workout.activity.distanceKm} km`);
      }
      const pace = paceText(workout.activity) || entry.avgPace;
      if (pace) parts.push(`Avg pace: ${pace}`);
      if (workout.activity?.elevationM != null) {
        parts.push(`Elevation: ${workout.activity.elevationM} m`);
      }
    } else {
      if (workout.title) parts.push(workout.title);
      for (const section of workout.sections || []) {
        const block = [
          section.name || null,
          section.format || null,
          section.content || null,
        ]
          .filter(Boolean)
          .join(" | ");
        if (block) parts.push(block);
      }
    }

    const logBits = [
      entry.score ? `Score: ${entry.score}` : null,
      entry.strengthLoad ? `Strength load: ${entry.strengthLoad}` : null,
      entry.rpe ? `RPE: ${entry.rpe}` : null,
      entry.avgPace && !(workout.type === "RUN" || workout.type === "WALK")
        ? `Avg pace: ${entry.avgPace}`
        : null,
      entry.elevation ? `Elevation: ${entry.elevation} m` : null,
      entry.notes ? `Notes: ${entry.notes}` : null,
      typeof entry.completed === "boolean"
        ? `Completed: ${entry.completed ? "yes" : "no"}`
        : null,
    ].filter(Boolean);

    if (logBits.length) parts.push(logBits.join(" | "));

    return parts.join(" | ");
  }

  function buildCsvRows(workouts) {
    const headers = ["Date", "type", "detail"];
    const byDate = new Map();

    for (const w of workouts) {
      if (!byDate.has(w.date)) byDate.set(w.date, []);
      byDate.get(w.date).push(w);
    }

    const dates = [...byDate.keys()].sort((a, b) => a.localeCompare(b));
    const rows = dates.map((date) => {
      const daySessions = byDate.get(date);
      const types = [...new Set(daySessions.map((w) => w.type))].join(" + ");
      const detail = daySessions
        .map((w) => `[${w.type}] ${workoutDetail(w)}`)
        .join(" || ");
      return [date, types, detail].map(csvEscape);
    });

    return [headers.map(csvEscape).join(","), ...rows.map((r) => r.join(","))].join(
      "\r\n"
    );
  }

  function exportCsv() {
    const workouts = filteredWorkouts().slice().sort((a, b) => a.date.localeCompare(b.date));
    if (!workouts.length) {
      showBanner("Nothing to export for the current filter.", true);
      return;
    }

    const csv = buildCsvRows(workouts);
    const dayCount = new Set(workouts.map((w) => w.date)).size;
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const stamp = todayIso();
    const filterPart = state.filter === "ALL" ? "all" : state.filter.toLowerCase();
    const a = document.createElement("a");
    a.href = url;
    a.download = `forge-log-${filterPart}-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showBanner(`Exported ${dayCount} day${dayCount === 1 ? "" : "s"} to CSV.`);
  }

  els.addBtn.addEventListener("click", () => {
    state.mode = "add";
    expandDetail();
    renderList();
    renderAddForm();
  });

  if (els.exportBtn) {
    els.exportBtn.addEventListener("click", exportCsv);
  }

  if (els.prsRefresh) {
    els.prsRefresh.addEventListener("click", () => {
      renderPrs();
      if (state.mode === "exercise" && state.selectedExerciseId) {
        renderProgression(state.selectedExerciseId);
      }
      showBanner("PRs refreshed.");
    });
  }

  if (els.prsAdd) {
    els.prsAdd.addEventListener("click", () => openPrForm());
  }

  function syncDetailPanel() {
    if (!els.detailPanel) return;

    const workout = state.selectedId
      ? allWorkouts().find((w) => w.id === state.selectedId)
      : null;
    let title = "Session details";
    let meta = "";
    if (state.mode === "add") title = "Add workout";
    else if (state.mode === "pr-form") title = "Add PR";
    else if (state.mode === "exercise") title = "Progression";
    else if (workout) {
      title = workout.title;
      meta = `${formatDate(workout.date)} · ${workout.type}`;
    }

    if (els.detailPanelTitle) els.detailPanelTitle.textContent = title;
    if (els.detailPanelMeta) els.detailPanelMeta.textContent = meta;
    els.detailPanel.setAttribute("aria-expanded", state.detailExpanded ? "true" : "false");
    syncPanel("detail");
  }

  function expandDetail() {
    state.detailExpanded = true;
    state.panelsOpen.detail = true;
    savePanelsUi();
    syncDetailPanel();
  }

  document.querySelectorAll("[data-panel-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.panelToggle;
      if (!id) return;
      if (id === "detail" && !state.detailExpanded) return;
      togglePanel(id);
    });
  });

  if (els.detailPanelClose) {
    els.detailPanelClose.addEventListener("click", (e) => {
      e.stopPropagation();
      state.detailExpanded = false;
      syncDetailPanel();
    });
  }

  let listClickTimer = null;
  let listClickId = null;

  els.list.addEventListener("click", (e) => {
    if (e.target.closest("[data-open-menu]")) return;
    const btn = e.target.closest("[data-id]");
    if (!btn) return;
    const id = btn.dataset.id;

    // Detect double-click without rebuilding the list on the first click
    // (a full re-render was killing the native dblclick event).
    if (listClickTimer && listClickId === id) {
      clearTimeout(listClickTimer);
      listClickTimer = null;
      listClickId = null;
      selectWorkout(id, { open: true });
      return;
    }

    highlightSession(id);
    listClickId = id;
    listClickTimer = setTimeout(() => {
      listClickTimer = null;
      listClickId = null;
    }, 320);
  });

  if (els.chartFormulaToggle) {
    els.chartFormulaToggle.addEventListener("click", () => {
      state.formulaVisible = true;
      syncFormulaVisibility();
    });
  }

  if (els.chartFormula) {
    els.chartFormula.addEventListener("dblclick", () => {
      state.formulaVisible = false;
      syncFormulaVisibility();
    });
  }

  if (els.calendarPrev) {
    els.calendarPrev.addEventListener("click", () => {
      if (!window.ForgeCalendar) return;
      state.calendarMonth = window.ForgeCalendar.shiftMonth(state.calendarMonth, -1);
      savePanelsUi();
      renderCalendar();
    });
  }

  if (els.calendarNext) {
    els.calendarNext.addEventListener("click", () => {
      if (!window.ForgeCalendar) return;
      state.calendarMonth = window.ForgeCalendar.shiftMonth(state.calendarMonth, 1);
      savePanelsUi();
      renderCalendar();
    });
  }

  els.filters.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    setTypeFilter(btn.dataset.filter);
  });

  if (els.intervalPresets) {
    els.intervalPresets.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-interval]");
      if (!btn) return;
      state.interval = btn.dataset.interval;
      if (state.interval === "custom") {
        const range = getIntervalRange();
        state.customFrom = state.customFrom || range.from;
        state.customTo = state.customTo || range.to;
        if (els.intervalFrom) els.intervalFrom.value = state.customFrom;
        if (els.intervalTo) els.intervalTo.value = state.customTo;
      }
      renderWorkload();
    });
  }

  if (els.intervalApply) {
    els.intervalApply.addEventListener("click", () => {
      state.interval = "custom";
      state.customFrom = els.intervalFrom?.value || addDaysIso(todayIso(), -29);
      state.customTo = els.intervalTo?.value || todayIso();
      if (state.customFrom > state.customTo) {
        const swap = state.customFrom;
        state.customFrom = state.customTo;
        state.customTo = swap;
        if (els.intervalFrom) els.intervalFrom.value = state.customFrom;
        if (els.intervalTo) els.intervalTo.value = state.customTo;
      }
      renderWorkload();
    });
  }

  els.search.addEventListener("input", () => {
    state.query = els.search.value;
    renderList();
  });

  document.addEventListener("click", (e) => {
    if (!els.openBalloon || els.openBalloon.hidden) return;
    if (e.target.closest("#open-balloon") || e.target.closest("[data-open-menu], #detail-open-menu")) {
      return;
    }
    hideOpenBalloon();
  });

  const newest = allWorkouts().sort((a, b) => b.date.localeCompare(a.date))[0];
  if (newest) state.selectedId = newest.id;

  ensurePastDueComplete();
  ensureSeedPrs();
  syncFormulaVisibility();
  syncAllPanels();
  syncDetailPanel();
  renderPrs();
  renderStats();
  renderWorkload();
  renderList();
  renderDetail();
})();
