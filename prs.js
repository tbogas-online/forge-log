(() => {
  const LIFTS = [
    {
      id: "back-squat",
      name: "Back Squat",
      aliases: ["back squat", "back squats", "bsquat"],
    },
    {
      id: "front-squat",
      name: "Front Squat",
      aliases: ["front squat", "front squats"],
    },
    {
      id: "deadlift",
      name: "Deadlift",
      aliases: ["deadlift", "deadlifts", "dl"],
    },
    {
      id: "sumo-deadlift",
      name: "Sumo Deadlift",
      aliases: ["sumo deadlift", "barbell sumo deadlift"],
    },
    {
      id: "bench-press",
      name: "Bench Press",
      aliases: ["bench press", "bench"],
    },
    {
      id: "push-press",
      name: "Push Press",
      aliases: ["push press"],
    },
    {
      id: "push-jerk",
      name: "Push Jerk",
      aliases: ["push jerk", "push jerks"],
    },
    {
      id: "hip-thrust",
      name: "Hip Thrust",
      aliases: ["hip thrust", "hip thrusts"],
    },
    {
      id: "power-clean",
      name: "Power Clean",
      aliases: ["power clean", "power cleans"],
    },
    {
      id: "hang-clean",
      name: "Hang Clean",
      aliases: ["hang clean", "hang cleans"],
    },
    {
      id: "hang-power-snatch",
      name: "Hang Power Snatch",
      aliases: ["hang power snatch"],
    },
    {
      id: "power-snatch",
      name: "Power Snatch",
      aliases: ["power snatch"],
    },
    {
      id: "overhead-squat",
      name: "Overhead Squat",
      aliases: ["overhead squat", "overhead squats", "ohs"],
    },
    {
      id: "thruster",
      name: "Thruster",
      aliases: ["thruster", "thrusters"],
    },
  ];

  const RUNS = [
    { id: "run-1k", name: "1 km Run", km: 1, tolerance: 0.2 },
    { id: "run-5k", name: "5 km Run", km: 5, tolerance: 0.4 },
  ];

  const SEED_PERFORMANCES = [
    {
      id: "seed-back-squat-2026-06-22",
      exerciseId: "back-squat",
      name: "Back Squat",
      kind: "lift",
      date: "2026-06-22",
      weightKg: 80,
      source: "manual",
    },
    {
      id: "seed-back-squat-2026-07-20",
      exerciseId: "back-squat",
      name: "Back Squat",
      kind: "lift",
      date: "2026-07-20",
      weightKg: 90,
      source: "manual",
    },
    {
      id: "seed-back-squat-2026-07-28",
      exerciseId: "back-squat",
      name: "Back Squat",
      kind: "lift",
      date: "2026-07-28",
      weightKg: 92.5,
      source: "manual",
    },
    {
      id: "seed-back-squat-2026-08-05",
      exerciseId: "back-squat",
      name: "Back Squat",
      kind: "lift",
      date: "2026-08-05",
      weightKg: 95,
      source: "manual",
    },
  ];

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[×x]/gi, "x")
      .replace(/\s+/g, " ")
      .trim();
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
    return 0;
  }

  function formatDuration(seconds) {
    if (!seconds || seconds <= 0) return "";
    const total = Math.round(seconds);
    const mm = Math.floor(total / 60);
    const ss = String(total % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  function findLift(text) {
    const n = normalize(text);
    let best = null;
    let bestLen = 0;
    for (const lift of LIFTS) {
      for (const alias of lift.aliases) {
        if (n.includes(alias) && alias.length > bestLen) {
          best = lift;
          bestLen = alias.length;
        }
      }
    }
    return best;
  }

  function parseWeightReps(chunk) {
    const text = normalize(chunk);
    // 95 kg x 5 | 95kg×5 | 95 x 5 | 110kg
    let m = text.match(/(\d+(?:[.,]\d+)?)\s*(?:kg|kgs)?\s*[x*]\s*(\d{1,3})\b/);
    if (m) {
      return { weightKg: Number(m[1].replace(",", ".")), reps: Number(m[2]) };
    }
    m = text.match(/(\d{1,3})\s*[x*]\s*(\d+(?:[.,]\d+)?)\s*(?:kg|kgs)\b/);
    if (m) {
      return { weightKg: Number(m[2].replace(",", ".")), reps: Number(m[1]) };
    }
    m = text.match(/(\d+(?:[.,]\d+)?)\s*(?:kg|kgs)\b/);
    if (m) {
      return { weightKg: Number(m[1].replace(",", ".")), reps: null };
    }
    m = text.match(/\b(\d+(?:[.,]\d+)?)\b/);
    if (m && /1rm|pr|kg/i.test(chunk)) {
      return { weightKg: Number(m[1].replace(",", ".")), reps: 1 };
    }
    return null;
  }

  function parseMaleKg(text) {
    const m = String(text).match(/@\s*(\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)\s*kg/i);
    if (m) return Number(m[1].replace(",", "."));
    const single = String(text).match(/@\s*(\d+(?:[.,]\d+)?)\s*kg/i);
    if (single) return Number(single[1].replace(",", "."));
    return null;
  }

  function parseRepsNear(text, liftName) {
    const n = normalize(text);
    const alias = liftName.toLowerCase();
    // 5 back squats | 12 hip thrust | 4x5
    let m = n.match(new RegExp(`(\\d{1,3})\\s*${alias.replace(/\s+/g, "\\s+")}`));
    if (m) return Number(m[1]);
    m = n.match(/(\d{1,3})\s*[x*]\s*(\d{1,3})/);
    if (m) return Number(m[2]);
    m = n.match(/\b(\d{1,3})\s*@/);
    if (m) return Number(m[1]);
    return null;
  }

  function performanceLabel(p) {
    if (p.kind === "run") {
      return `${p.name} → ${formatDuration(p.seconds)}`;
    }
    return `${p.weightKg} kg`;
  }

  function betterLift(a, b) {
    if (!a) return b;
    if (!b) return a;
    // PR = heaviest mark only (reps ignored)
    if (a.weightKg === b.weightKg) return a;
    return a.weightKg > b.weightKg ? a : b;
  }

  function betterRun(a, b) {
    if (!a) return b;
    if (!b) return a;
    return a.seconds <= b.seconds ? a : b;
  }

  function extractFromLog(workout, entry) {
    const out = [];
    if (!entry) return out;
    const blob = [entry.strengthLoad, entry.score, entry.notes].filter(Boolean).join(" | ");
    if (!blob) return out;

    // Explicit "Back Squat 95kg x 5"
    for (const lift of LIFTS) {
      for (const alias of lift.aliases) {
        const re = new RegExp(
          `${alias.replace(/\s+/g, "\\s+")}[^\\d]{0,12}(\\d+(?:[.,]\\d+)?)\\s*(?:kg|kgs)?(?:\\s*[x*]\\s*(\\d{1,3}))?`,
          "i"
        );
        const m = blob.match(re);
        if (m) {
          out.push({
            exerciseId: lift.id,
            name: lift.name,
            kind: "lift",
            date: workout.date,
            workoutId: workout.id,
            weightKg: Number(m[1].replace(",", ".")),
            reps: m[2] ? Number(m[2]) : parseRepsNear(workout.title + " " + sectionText(workout), lift.name) || null,
          });
        }
      }
    }

    // Generic weight in strengthLoad on a lift-focused day
    if (entry.strengthLoad || entry.score) {
      const lift =
        findLift(workout.title) ||
        findLift(sectionText(workout)) ||
        findLift(entry.strengthLoad);
      const parsed = parseWeightReps(entry.strengthLoad || entry.score);
      if (lift && parsed?.weightKg) {
        out.push({
          exerciseId: lift.id,
          name: lift.name,
          kind: "lift",
          date: workout.date,
          workoutId: workout.id,
          weightKg: parsed.weightKg,
          reps:
            parsed.reps ||
            parseRepsNear(sectionText(workout) + " " + workout.title, lift.name),
        });
      }
    }

    return out;
  }

  function sectionText(workout) {
    return (workout.sections || [])
      .map((s) => [s.name, s.format, s.content].filter(Boolean).join("\n"))
      .join("\n");
  }

  function extractFromProgramming(workout) {
    const out = [];
    const text = sectionText(workout);
    if (!text) return out;

    for (const lift of LIFTS) {
      // Look for lift mentions with absolute kg nearby
      for (const alias of lift.aliases) {
        const re = new RegExp(
          `(\\d{1,3})?\\s*${alias.replace(/\s+/g, "\\s+")}[^\\n]{0,40}?@\\s*(\\d+(?:[.,]\\d+)?)\\s*(?:\\/\\s*\\d+(?:[.,]\\d+)?)?\\s*kg`,
          "ig"
        );
        let m;
        while ((m = re.exec(text))) {
          out.push({
            exerciseId: lift.id,
            name: lift.name,
            kind: "lift",
            date: workout.date,
            workoutId: workout.id,
            weightKg: Number(m[2].replace(",", ".")),
            reps: m[1] ? Number(m[1]) : parseRepsNear(m[0], lift.name),
            source: "program",
          });
        }
      }
    }

    // Lines like "Deadlift\n...@85%" skipped (no absolute)
    // "12 Hip Thrust" without weight skipped unless logged
    return out;
  }

  function extractRuns(workout, entry) {
    const out = [];
    if (workout.type !== "RUN") return out;

    const duration =
      (entry && entry.score) ||
      workout.activity?.duration ||
      "";
    const distanceRaw =
      (entry && entry.strengthLoad) ||
      (workout.activity?.distanceKm != null ? String(workout.activity.distanceKm) : "");
    const kmMatch = String(distanceRaw).replace(",", ".").match(/(\d+(?:\.\d+)?)/);
    const km = kmMatch ? Number(kmMatch[1]) : Number(workout.activity?.distanceKm) || 0;
    const seconds = durationToSeconds(duration);
    if (!km || !seconds) return out;

    for (const run of RUNS) {
      if (Math.abs(km - run.km) <= run.tolerance) {
        const scaled = seconds * (run.km / km);
        out.push({
          exerciseId: run.id,
          name: run.name,
          kind: "run",
          date: workout.date,
          workoutId: workout.id,
          seconds: scaled,
          distanceKm: km,
          actualSeconds: seconds,
        });
      }
    }
    return out;
  }

  function collectPerformances(workouts, logs) {
    const all = [];
    for (const w of workouts) {
      const entry = logs[w.id] || {};
      all.push(...extractFromLog(w, entry));
      all.push(...extractFromProgramming(w));
      all.push(...extractRuns(w, entry));
    }

    // Dedupe similar same-day lift entries (prefer logged over program)
    const keyed = new Map();
    for (const p of all) {
      const key = `${p.exerciseId}|${p.date}|${p.kind}|${p.weightKg || ""}|${p.reps || ""}|${p.seconds || ""}`;
      const prev = keyed.get(key);
      if (!prev || (prev.source === "program" && p.source !== "program")) {
        keyed.set(key, p);
      }
    }
    return [...keyed.values()].sort((a, b) => a.date.localeCompare(b.date));
  }

  function buildPrBoard(performances) {
    const byExercise = new Map();
    for (const p of performances) {
      if (!byExercise.has(p.exerciseId)) byExercise.set(p.exerciseId, []);
      byExercise.get(p.exerciseId).push(p);
    }

    const board = [];
    for (const [exerciseId, list] of byExercise) {
      const sorted = list.slice().sort((a, b) => a.date.localeCompare(b.date));
      let best = null;
      const timeline = [];
      for (const p of sorted) {
        const prev = best;
        const next =
          p.kind === "run" ? betterRun(best, p) === p ? p : best : betterLift(best, p) === p ? p : best;
        const isPr = next === p && (!prev || next !== prev);
        if (isPr) best = p;
        timeline.push({
          ...p,
          isPr,
          previous: isPr ? prev : null,
        });
      }
      if (!best) continue;
      board.push({
        exerciseId,
        name: best.name,
        kind: best.kind,
        best,
        timeline,
        previousBest: timeline.filter((t) => t.isPr).slice(-2, -1)[0] || null,
      });
    }

    board.sort((a, b) => a.name.localeCompare(b.name));
    return board;
  }

  function detectNewPrs(beforeBoard, afterBoard) {
    const beforeMap = new Map(beforeBoard.map((b) => [b.exerciseId, b.best]));
    const news = [];
    for (const item of afterBoard) {
      const prev = beforeMap.get(item.exerciseId);
      const cur = item.best;
      if (!prev) {
        news.push({ ...item, delta: null, isFirst: true });
        continue;
      }
      if (cur.kind === "run") {
        if (cur.seconds < prev.seconds - 0.5) {
          news.push({
            ...item,
            delta: `-${formatDuration(prev.seconds - cur.seconds)} vs anterior`,
            isFirst: false,
          });
        }
      } else if (cur.weightKg > prev.weightKg) {
        const diff = Math.round((cur.weightKg - prev.weightKg) * 10) / 10;
        news.push({
          ...item,
          delta: `+${diff} kg vs anterior`,
          isFirst: false,
        });
      }
    }
    return news;
  }

  function formatPerf(p) {
    if (!p) return "—";
    if (p.kind === "run") return formatDuration(p.seconds);
    return `${p.weightKg} kg`;
  }

  window.ForgePR = {
    LIFTS,
    RUNS,
    SEED_PERFORMANCES,
    collectPerformances,
    buildPrBoard,
    detectNewPrs,
    formatPerf,
    performanceLabel,
    formatDuration,
    durationToSeconds,
  };
})();
