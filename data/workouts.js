/** Seed programming from June-August 2026 log */
window.WORKOUTS = [
  {
    id: "2026-06-22-wod",
    date: "2026-06-22",
    type: "WOD",
    title: "Deadlift + Power Clean / Rope Climb",
    sections: [
      {
        name: "STRENGTH",
        format: "Every 2:30 x 3 Sets",
        content: "Deadlift\n6 @70% | RPE 7-8 | RIR 2\n5 @75% | RPE 7-8 | RIR 2\n4 @80% | RPE 8-9 | RIR 1",
      },
      {
        name: "CONDITIONING",
        format: "For Time",
        content: "10-8-6-4-2\nPower Clean @60/40kg\n2-2-2-2-2\nRope Climb",
        scoreType: "time",
      },
    ],
  },
  {
    id: "2026-06-24-hybrid",
    date: "2026-06-24",
    type: "HYBRID",
    title: "Hybrid Doubles — Run / Carry / Lunges",
    sections: [
      {
        name: "HYBRID DOUBLES",
        format: "For Time",
        content:
          "Buy In:\n800m Run\n\n5 Rounds:\n20m Burpee Broad Jumps\n60m Farmer Carry\n20m Walking Lunges\n30 Wallballs\n\nBuy Out:\n800m Run",
        scoreType: "time",
      },
    ],
  },
  {
    id: "2026-06-25-wod",
    date: "2026-06-25",
    type: "WOD",
    title: "Front Squat + 2KB Thrusters / T2B",
    sections: [
      {
        name: "STRENGTH",
        format: "Every 2:00 x 3 Sets",
        content: "Front Squat\n4 @85% | RPE 8-9\n3 @90% | RPE 8-9\n2 @95% | RPE 9",
      },
      {
        name: "CONDITIONING",
        format: "For Time · Cap 10:00",
        content: "21-15-9\n2KB Thrusters\nT2B / T2Ring",
        scoreType: "time",
        timeCap: "10:00",
      },
    ],
  },
  {
    id: "2026-06-30-wod",
    date: "2026-06-30",
    type: "WOD",
    title: "HSPU Skill + Erg / Deadlift / HSPU",
    sections: [
      {
        name: "SKILL",
        content: "HSPU",
      },
      {
        name: "CONDITIONING",
        format: "5 Rounds · Cap 25:00",
        content: "300m Erg\n12 Deadlifts @90/65kg\n6 HSPU or 2 Wall Walks\nRest 1:00 / set",
        scoreType: "time",
        timeCap: "25:00",
      },
    ],
  },
  {
    id: "2026-07-02-wod",
    date: "2026-07-02",
    type: "WOD",
    title: "Bench Press + Run / KB / Box / Slamball",
    sections: [
      {
        name: "STRENGTH",
        format: "Every 2:00 x 3 Sets",
        content: "Bench Press\n4 @85% | RPE 8-9\n3 @90% | RPE 8-9\n2 @95% | RPE 9",
      },
      {
        name: "CONDITIONING",
        format: "For Time",
        content:
          "800m Run\ninto...\n3 Rounds:\n21 KB Swings\n15 Box Jump Overs\n9 Slamball Clean\ninto...\n800m Run",
        scoreType: "time",
      },
    ],
  },
  {
    id: "2026-07-03-wod",
    date: "2026-07-03",
    type: "WOD",
    title: "Deadlift + EMOM Burpees / T2B",
    classTime: "17:40–18:35",
    sections: [
      {
        name: "STRENGTH",
        format: "Every 2:00 x 3 Sets",
        content: "Deadlift\n4 @85% | RPE 8-9\n3 @90% | RPE 8-9\n2 @95% | RPE 9",
      },
      {
        name: "CONDITIONING",
        format: "EMOM to Finish · Cap 16:00",
        content:
          "1:00 On – 1:00 Off\n6 Burpees Over Bar\nMax Toes to Bar\n\n*EMOM ends when athlete completes 60–80 T2B.\nMax 8 minutes to finish.",
        scoreType: "reps",
        scoreLabel: "Total T2B",
        timeCap: "16:00",
      },
    ],
  },
  {
    id: "2026-07-06-wod",
    date: "2026-07-06",
    type: "WOD",
    title: "Push Press 1RM + DB Step Overs / Burpees / HSPU",
    sections: [
      {
        name: "STRENGTH",
        format: "In 12:00 Window",
        content: "Build 1RM\nPush Press",
        scoreType: "weight",
        scoreLabel: "1RM Push Press (kg)",
      },
      {
        name: "CONDITIONING",
        format: "4 Rounds, For Time",
        content: "12 2DB Box Step Overs\n10 Burpee Over Line\n6 HSPU or 3 Wall Walks",
        scoreType: "time",
      },
    ],
  },
  {
    id: "2026-07-07-wod",
    date: "2026-07-07",
    type: "WOD",
    title: "Front Squat 1RM + DU / Thrusters",
    sections: [
      {
        name: "STRENGTH",
        format: "In 12:00 Window",
        content: "Build 1RM\nFront Squat",
        scoreType: "weight",
        scoreLabel: "1RM Front Squat (kg)",
      },
      {
        name: "CONDITIONING",
        format: "5 Rounds · Score = Worst Set",
        content: "50 Double Unders\n10 Thrusters @43/30kg\nRest 1:00 / round",
        scoreType: "time",
        scoreLabel: "Worst set time",
      },
    ],
  },
  {
    id: "2026-07-09-hybrid",
    date: "2026-07-09",
    type: "HYBRID",
    title: "Hybrid Doubles — 3 Blocks",
    sections: [
      {
        name: "HYBRID DOUBLES",
        format: "3 Blocks · 12:00 ON / 2:00 OFF",
        content:
          "Bloco A:\n500m Run\n20m Sled Pull\n\nBloco B:\n500m Run\n20m Sandbag Walking Lunges\n\nBloco C:\n500m Run\n20m Burpee Broad Jumps",
        scoreType: "time",
        scoreLabel: "Notes / block times",
      },
    ],
  },
  {
    id: "2026-07-13-wod",
    date: "2026-07-13",
    type: "WOD",
    title: "Bench Press 1RM + Fran",
    sections: [
      {
        name: "STRENGTH",
        format: "In 12:00 Window",
        content: "Build 1RM\nBench Press",
        scoreType: "weight",
        scoreLabel: "1RM Bench Press (kg)",
      },
      {
        name: "CONDITIONING",
        format: "Fran · For Time · Cap 9:00",
        content: "21-15-9\nThruster @43/30kg\nPull-ups",
        scoreType: "time",
        timeCap: "09:00",
      },
    ],
  },
  {
    id: "2026-07-14-wod",
    date: "2026-07-14",
    type: "WOD",
    title: "Deadlift 1RM + Nancy",
    sections: [
      {
        name: "STRENGTH",
        format: "In 12:00 Window",
        content: "Build 1RM\nDeadlift",
        scoreType: "weight",
        scoreLabel: "1RM Deadlift (kg)",
      },
      {
        name: "CONDITIONING",
        format: "Nancy · 5 Rounds For Time · Cap 20:00",
        content: "400m Run\n15 Overhead Squats @43/30kg",
        scoreType: "time",
        timeCap: "20:00",
      },
    ],
  },
  {
    id: "2026-07-16-wod",
    date: "2026-07-16",
    type: "WOD",
    title: "Team Workout — Run + Partner Deadlift AMRAP",
    box: "Box 1",
    sections: [
      {
        name: "TEAM WORKOUT",
        format: "0:00–36:00",
        content:
          "0:00 – 8:00\n800–1200m Run Together\n\n8:00 – 28:00\nAMRAP 20:\n500m Erg (1) | Partner Deadlift Hold (2)\n30 Partner Deadlift (2) | Hanging Hold (1)\n10 Burpees Over Bar Sync. (2) | Rest (1)\n\n28:00 – 36:00\n800–1200m Run Together",
        scoreType: "rounds",
        scoreLabel: "AMRAP rounds + notes",
      },
    ],
  },
  {
    id: "2026-07-20-wod",
    date: "2026-07-20",
    type: "WOD",
    title: "Back Squat 4x5 + Front Squats / T2B / DU",
    sections: [
      {
        name: "STRENGTH",
        format: "Every 2:30 x 5 Sets",
        content: "5 Back Squats\n@70–75% | RPE 7-8",
      },
      {
        name: "CONDITIONING",
        format: "For Time · Cap 15:00",
        content: "21-15-9\nFront Squats @60/40kg\nToes to Bar\n75-50-25\nDouble Unders",
        scoreType: "time",
        timeCap: "15:00",
      },
    ],
  },
  {
    id: "2026-07-21-wod",
    date: "2026-07-21",
    type: "WOD",
    title: "Chin / Rings + Devil Press / Step Overs / Swings",
    sections: [
      {
        name: "STRENGTH ENDURANCE",
        format: "EMOM 12:00",
        content: "A: 4–6 Negative Chin Ups\nB: 20\" Rings Hold on Top + 5 Box Dips\nC: Rest",
      },
      {
        name: "CONDITIONING",
        format: "3 Rounds, For Time",
        content: "10 Devil Press\n20 2DB Box Step Overs\n30 KB Swings",
        scoreType: "time",
      },
    ],
  },
  {
    id: "2026-07-24-wod",
    date: "2026-07-24",
    type: "WOD",
    title: "Push Jerk 4x5 + Team Erg / Barbell",
    sections: [
      {
        name: "STRENGTH",
        format: "Every 2:30 x 5 Sets",
        content: "5 Push Jerks\n@70–75% | RPE 7-8",
      },
      {
        name: "TEAM CONDITIONING",
        format: "3 Rounds, For Time · Cap 20:00",
        content:
          "12 Cals Erg\n15 Deadlifts @60/40kg\n12 Cals Erg\n12 Hang Cleans @60/40kg\n12 Cals Erg\n9 Push Jerk @60/40kg",
        scoreType: "time",
        timeCap: "20:00",
      },
    ],
  },
  {
    id: "2026-07-27-wod",
    date: "2026-07-27",
    type: "WOD",
    title: "Power Snatch Complex + DU / HPS / Burpees",
    sections: [
      {
        name: "STRENGTH",
        format: "Every 1:30 x 6 Sets",
        content: "1 Power Snatch\n1 Hang Power Snatch",
      },
      {
        name: "CONDITIONING",
        format: "For Time",
        content: "75-50-25\nDouble Unders\n21-15-9\nHang Power Snatch\nBurpees Over Bar",
        scoreType: "time",
      },
    ],
  },
  {
    id: "2026-07-28-wod",
    date: "2026-07-28",
    type: "WOD",
    title: "Back Squat 4x5 + Erg / Carry / Slamball",
    sections: [
      {
        name: "STRENGTH",
        format: "Every 2:00 x 5 Sets",
        content: "5 Back Squats\n@75–80% | RPE 8",
      },
      {
        name: "CONDITIONING",
        format: "4 Sets · 2:00 ON – 2:00 OFF · Score = Worst Set",
        content: "12/10 Cals Erg\n20m Bear Hug Carry\nIn remaining time, max Slamball Squats",
        scoreType: "reps",
        scoreLabel: "Worst set (slamball squats)",
      },
    ],
  },
  {
    id: "2026-07-30-wod",
    date: "2026-07-30",
    type: "WOD",
    title: "Partner AMRAP + Push Press / Jerk",
    sections: [
      {
        name: "PARTNER CONDITIONING",
        format: "AMRAP 20:00",
        content:
          "500m Run Together\n40 Box Jumps\n30 DB Thrusters\n20 Burpees\n10 Sit Ups Sync.\n5 Wall Walks",
        scoreType: "rounds",
      },
      {
        name: "STRENGTH",
        format: "Every 2:00 x 5 Sets",
        content: "5 Push Press\nor\n5 Push Jerk\n\n@75–80% | RPE 7-8 | RIR 2",
      },
    ],
  },
  {
    id: "2026-07-31-wod",
    date: "2026-07-31",
    type: "WOD",
    title: "Hip Thrust Supersets + EMOM Erg / Slamball / T2B",
    sections: [
      {
        name: "STRENGTH ENDURANCE",
        format: "3 Super-Sets",
        content: "12 Hip Thrust\n20 Sandbag Walking Lunges\nRest 1:30 / set",
      },
      {
        name: "CONDITIONING",
        format: "EMOM 18:00",
        content: "A: 200m Erg\nB: 5–8 Slamball Clean\nC: 10–16 T2B",
        scoreType: "notes",
        scoreLabel: "Rounds completed / notes",
      },
    ],
  },
  {
    id: "2026-08-03-wod",
    date: "2026-08-03",
    type: "WOD",
    title: "Push Jerk 4x5 + Partner Erg / KB",
    sections: [
      {
        name: "STRENGTH",
        format: "Every 2:00 x 5 Sets",
        content: "5 Push Jerks\n@75–80% | RPE 8",
      },
      {
        name: "PARTNER CONDITIONING",
        format: "For Time",
        content: "Buy In:\n1000m Erg\nInto...\n10 Rounds:\n7 Burpees Over KB\n14 2KB STOH",
        scoreType: "time",
      },
    ],
  },
  {
    id: "2026-08-04-hybrid",
    date: "2026-08-04",
    type: "HYBRID",
    title: "Hybrid Doubles — Erg / Sled / Farmer",
    sections: [
      {
        name: "HYBRID DOUBLES",
        format: "Every 6:00 x 5 Sets",
        content: "400m Erg\n20m Sled Pull\n60m Farmer Carry",
        scoreType: "notes",
        scoreLabel: "Set notes / finishes",
      },
    ],
  },
  {
    id: "2026-08-05-wod",
    date: "2026-08-05",
    type: "WOD",
    title: "Back Squat 4x5 + Erg / Thrusters / Wall Walks",
    sections: [
      {
        name: "STRENGTH",
        format: "Every 2:00 x 5 Sets",
        content: "5 Back Squats\n@80–85% | RPE 8-9",
      },
      {
        name: "CONDITIONING",
        format: "For Time",
        content: "50 Cals Erg\n30 Thrusters @40/25kg\n10 Wall Walks",
        scoreType: "time",
      },
    ],
  },
  {
    id: "2026-08-06-wod",
    date: "2026-08-06",
    type: "WOD",
    title: "Chin / Rings + DU / T2Ring / Slamball",
    sections: [
      {
        name: "STRENGTH ENDURANCE",
        format: "EMOM 12:00",
        content: "A: 4–6 Negative Chin Ups\nB: 20\" Rings Hold on Top + 5 Box Dips\nC: Rest",
      },
      {
        name: "CONDITIONING",
        format: "4 Sets · 2:00 ON – 2:00 OFF",
        content:
          "40 Double Unders\n10 T2Ring\nWorkout finishes when you perform 20–30 Slamball Cleans",
        scoreType: "reps",
        scoreLabel: "Slamball cleans",
      },
    ],
  },
  {
    id: "2026-08-07-fbb",
    date: "2026-08-07",
    type: "FBB",
    title: "Sumo DL / Pull-ups + L-Sit + EMOM Accessories",
    sections: [
      {
        name: "STRENGTH",
        format: "Every 2:30 x 5 Sets",
        content: "7 Barbell Sumo Deadlift @10/30\nor\n7 Negative Pull Ups @3\" Down",
      },
      {
        name: "ACCESSORY",
        content: "Accumulate 3:00 In Hanging L-Sit*\n*Every break complete 10 V-Ups",
        scoreType: "notes",
        scoreLabel: "L-Sit notes",
      },
      {
        name: "STRENGTH ENDURANCE",
        format: "EMOM 12:00",
        content:
          "A: 10 1DB Floor Press\nB: 8 Glute Bridge\nC: 10 1DB Bent Over Row\nD: 8 (1 Squat + 1 Reverse Lunge)",
      },
    ],
  },
  {
    id: "2026-08-10-wod",
    date: "2026-08-10",
    type: "WOD",
    title: "Hip Thrust Supersets + Run / Devil Press / Box",
    sections: [
      {
        name: "STRENGTH ENDURANCE",
        format: "3 Super-Sets",
        content: "12 Hip Thrust\n20 2DB Walking Lunges\nRest 1:30 / set",
      },
      {
        name: "CONDITIONING",
        format: "For Time · Cap 16:00",
        content: "800m Run\n20 Devil Presses\n40 Box Jump Overs\n800m Run",
        scoreType: "time",
        timeCap: "16:00",
      },
    ],
  },
  {
    id: "2026-08-11-hybrid",
    date: "2026-08-11",
    type: "HYBRID",
    title: "Hybrid Doubles — 4x AMRAP 8",
    sections: [
      {
        name: "HYBRID DOUBLES",
        format: "4 × AMRAP 8:00 · Rest 2:00",
        content:
          "AMRAP 8:\n200m Run\n2× 10m Sled Pull + 10m Sled Push\n\nRest 2:\n\nAMRAP 8:\n200m Run\n40m Farmer Carry\n\nRest 2:\n\nAMRAP 8:\n200m Run\n20 G2OH\n\nRest 2:\n\nAMRAP 8:\n200m Run\n20 Wallballs",
        scoreType: "rounds",
        scoreLabel: "Rounds per block",
      },
    ],
  },
  {
    id: "2026-03-22-walk",
    date: "2026-03-22",
    type: "WALK",
    title: "Outdoor walk",
    activity: {
      duration: "50:52",
      distanceKm: 4.18,
      elevationM: 56,
    },
    sections: [
      {
        name: "WALK",
        format: "Outdoor",
        content: "Duration: 50:52\nDistance: 4.18 km\nAvg pace: 12:10 /km\nElevation: 56 m",
        scoreType: "time",
        scoreLabel: "Duration",
      },
    ],
  },
  {
    id: "2026-03-29-run",
    date: "2026-03-29",
    type: "RUN",
    title: "Outdoor run",
    activity: {
      duration: "4:06",
      distanceKm: 0.7,
      elevationM: 0,
    },
    sections: [
      {
        name: "RUN",
        format: "Outdoor",
        content: "Duration: 4:06\nDistance: 0.70 km\nAvg pace: 5:51 /km\nElevation: 0 m",
        scoreType: "time",
        scoreLabel: "Duration",
      },
    ],
  },
  {
    id: "2026-08-09-run",
    date: "2026-08-09",
    type: "RUN",
    title: "Outdoor run",
    activity: {
      duration: "29:36",
      distanceKm: 5.02,
      elevationM: 11,
    },
    sections: [
      {
        name: "RUN",
        format: "Outdoor",
        content: "Duration: 29:36\nDistance: 5.02 km\nAvg pace: 5:54 /km\nElevation: 11 m",
        scoreType: "time",
        scoreLabel: "Duration",
      },
    ],
  },
];
