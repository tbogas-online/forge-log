(() => {
  const LEG_PATTERNS = [
    { re: /squat|deadlift|lunge|thruster|hip thrust|sumo/i, score: 3 },
    { re: /wall ball|box jump|step.?up|pistol|wall walk/i, score: 2 },
    { re: /run|carry|erg|burpee|jump|farmer|walk/i, score: 2 },
  ];

  function addDaysIso(iso, days) {
    const d = new Date(`${iso}T12:00:00`);
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function workoutText(workout) {
    return [
      workout.title,
      workout.type,
      ...(workout.sections || []).flatMap((s) => [s.name, s.format, s.content]),
    ]
      .filter(Boolean)
      .join("\n")
      .toLowerCase();
  }

  function legScore(workout) {
    if (workout.type === "RUN" || workout.type === "WALK") return 8;
    const text = workoutText(workout);
    let score = 0;
    for (const { re, score: pts } of LEG_PATTERNS) {
      if (re.test(text)) score += pts;
    }
    if (/strength/i.test(text) && /squat|deadlift|thrust/i.test(text)) score += 1;
    return Math.min(score, 10);
  }

  function completedInRange(workouts, isCompleted, from, to) {
    return workouts
      .filter((w) => w.date >= from && w.date <= to && isCompleted(w))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  function countByType(sessions) {
    const counts = {};
    for (const w of sessions) {
      counts[w.type] = (counts[w.type] || 0) + 1;
    }
    return counts;
  }

  function formatList(parts) {
    if (!parts.length) return "";
    if (parts.length === 1) return parts[0];
    return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
  }

  function isDismissed(feedback, insightId) {
    return (feedback?.dismissedIds || []).includes(insightId);
  }

  function avoidedSuggestionTypes(feedback) {
    const types = feedback?.suggestionTypes || {};
    return Object.entries(types)
      .filter(([, votes]) => (votes.up || 0) - (votes.down || 0) <= -1)
      .map(([type]) => type);
  }

  function volumeInsight(workouts, isCompleted, today) {
    const from = addDaysIso(today, -27);
    const sessions = completedInRange(workouts, isCompleted, from, today);
    if (!sessions.length) {
      return {
        id: "volume",
        kind: "volume",
        icon: "📊",
        text: "No completed sessions in the last 4 weeks to analyze yet.",
      };
    }

    const counts = countByType(sessions);
    const parts = [];
    if (counts.WOD) parts.push(`${counts.WOD} WOD${counts.WOD === 1 ? "" : "s"}`);
    if (counts.HYBRID) parts.push(`${counts.HYBRID} Hybrid`);
    if (counts.FBB) parts.push(`${counts.FBB} FBB`);
    if (counts.RUN) parts.push(`${counts.RUN} run${counts.RUN === 1 ? "" : "s"}`);
    if (counts.WALK) parts.push(`${counts.WALK} walk${counts.WALK === 1 ? "" : "s"}`);
    if (counts.HIT) parts.push(`${counts.HIT} HIT`);
    if (counts.OTHER) parts.push(`${counts.OTHER} Other`);

    return {
      id: "volume",
      kind: "volume",
      icon: "📊",
      text: `In the last 4 weeks you completed ${formatList(parts)}.`,
    };
  }

  function prDeltaInWindow(board, exerciseId, today, days) {
    const item = board.find((b) => b.exerciseId === exerciseId);
    if (!item?.timeline?.length) return null;
    const from = addDaysIso(today, -(days - 1));
    const inWindow = item.timeline.filter((t) => t.date >= from && t.date <= today);
    if (!inWindow.length) return null;

    const best = item.best;
    const baseline = inWindow[0];
    if (!best || !baseline) return null;

    if (best.kind === "run") {
      const diff = baseline.seconds - best.seconds;
      if (diff < 5) return null;
      return { name: item.name, kind: "run", diff, best, baseline };
    }

    const diff = Math.round((best.weightKg - baseline.weightKg) * 10) / 10;
    if (diff <= 0) return null;
    return { name: item.name, kind: "lift", diff, best, baseline };
  }

  function formatRunDelta(seconds) {
    const total = Math.round(seconds);
    const mm = Math.floor(total / 60);
    const ss = total % 60;
    if (mm > 0) return `${mm}:${String(ss).padStart(2, "0")}`;
    return `${total} seconds`;
  }

  function progressInsight(board, today) {
    const squat = prDeltaInWindow(board, "back-squat", today, 56);
    const run5k = prDeltaInWindow(board, "run-5k", today, 56);

    if (!squat && !run5k) {
      return {
        id: "progress",
        kind: "progress",
        icon: "📈",
        text: "Keep logging lifts and runs to see PR progress here.",
      };
    }

    if (squat?.kind === "lift" && run5k?.kind === "run") {
      return {
        id: "progress",
        kind: "progress",
        icon: "📈",
        text: `Back Squat is up ${squat.diff} kg while your 5K improved by ${formatRunDelta(run5k.diff)}.`,
      };
    }

    if (squat?.kind === "lift") {
      return {
        id: "progress",
        kind: "progress",
        icon: "📈",
        text: `${squat.name} is up ${squat.diff} kg over the last 8 weeks.`,
      };
    }

    return {
      id: "progress",
      kind: "progress",
      icon: "📈",
      text: `Your 5K improved by ${formatRunDelta(run5k.diff)} over the last 8 weeks.`,
    };
  }

  function recoveryInsight(workouts, isCompleted) {
    const recent = workouts
      .filter((w) => isCompleted(w))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);

    let streak = 0;
    for (const w of recent) {
      if (legScore(w) >= 5) streak += 1;
      else break;
    }

    if (streak < 3) return null;

    return {
      id: "recovery",
      kind: "recovery",
      icon: "🦵",
      text: `You have ${streak} consecutive sessions with high leg volume. A recovery day is recommended.`,
      severity: "warn",
    };
  }

  const SUGGESTION_RULES = [
    {
      type: "FBB",
      title: "Upper Body + posterior chain",
      reason: "Recover legs after high lower-body volume",
      when: (ctx) => ctx.legStreak >= 3,
    },
    {
      type: "RUN",
      title: "Aerobic run",
      reason: "Low run volume in the last 4 weeks",
      when: (ctx) =>
        (ctx.counts4w.RUN || 0) < 2 &&
        (ctx.counts4w.WOD || 0) + (ctx.counts4w.HYBRID || 0) >= 4,
    },
    {
      type: "FBB",
      title: "Upper Body + posterior chain",
      reason: "Balance high WOD volume",
      when: (ctx) => (ctx.counts4w.FBB || 0) < 2 && (ctx.counts4w.WOD || 0) >= 6,
    },
    {
      type: "WOD",
      title: "Strength + conditioning",
      reason: "More Hybrid than WOD recently",
      when: (ctx) => (ctx.counts4w.HYBRID || 0) >= 4 && (ctx.counts4w.WOD || 0) < 3,
    },
    {
      type: "HYBRID",
      title: "Engine + mixed modal",
      reason: "Add variety to your weekly plan",
      when: () => true,
    },
  ];

  function suggestNext(ctx, avoidTypes = []) {
    for (const rule of SUGGESTION_RULES) {
      if (avoidTypes.includes(rule.type)) continue;
      if (rule.when(ctx)) {
        return { type: rule.type, title: rule.title, reason: rule.reason };
      }
    }
    const fallback = SUGGESTION_RULES.find((r) => !avoidTypes.includes(r.type));
    return fallback
      ? { type: fallback.type, title: fallback.title, reason: fallback.reason }
      : { type: "WOD", title: "Strength + conditioning", reason: "General training balance" };
  }

  function suggestionInsight(workouts, isCompleted, legStreak, counts4w, avoidTypes) {
    const suggestion = suggestNext({ legStreak, counts4w }, avoidTypes);
    const open = workouts
      .filter((w) => w.type === suggestion.type && !isCompleted(w))
      .sort((a, b) => a.date.localeCompare(b.date))[0];

    return {
      id: `suggestion-${suggestion.type}`,
      kind: "suggestion",
      icon: "🎯",
      type: suggestion.type,
      title: suggestion.title,
      reason: suggestion.reason,
      workoutId: open?.id || null,
      text: `Suggested next session:\n${suggestion.type} — ${suggestion.title}`,
    };
  }

  function buildInsights({ workouts, isCompleted, prBoard, today, feedback = {} }) {
    const from4w = addDaysIso(today, -27);
    const sessions4w = completedInRange(workouts, isCompleted, from4w, today);
    const counts4w = countByType(sessions4w);

    const recent = workouts
      .filter((w) => isCompleted(w))
      .sort((a, b) => b.date.localeCompare(a.date));
    let legStreak = 0;
    for (const w of recent) {
      if (legScore(w) >= 5) legStreak += 1;
      else break;
    }

    const avoidTypes = avoidedSuggestionTypes(feedback);
    const candidates = [
      volumeInsight(workouts, isCompleted, today),
      progressInsight(prBoard, today),
      recoveryInsight(workouts, isCompleted),
      suggestionInsight(workouts, isCompleted, legStreak, counts4w, avoidTypes),
    ].filter(Boolean);

    return candidates.filter((item) => !isDismissed(feedback, item.id));
  }

  window.ForgeCoach = {
    buildInsights,
    legScore,
  };
})();
