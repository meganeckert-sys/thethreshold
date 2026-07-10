import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Sun, Snowflake, Leaf, Flower2, LogOut, Check, Droplet, Footprints,
  Sparkles, PlayCircle, Plus, Trash2, ShieldCheck, ChevronRight, X,
  ChevronDown, BookOpen, Wind, DoorOpen, TrendingUp
} from "lucide-react";

const ADMIN_CODE = "MEGADMIN";
const BRAND_NAME = "The Threshold";
const BRAND_TAGLINE = "What feels like it will never end — isn't permanent.";

/* ---------------- Design tokens (warm & botanical, refined) ---------------- */
const TOKENS = `
  :root {
    --linen: #F3EEE2;
    --linen-deep: #E8DFC9;
    --paper: #FBF8F1;
    --ink: #24231F;
    --ink-soft: #5B5646;
    --sage: #8A9678;
    --sage-deep: #57654A;
    --sage-pale: #DCE2D1;
    --clay: #A85C32;
    --clay-pale: #EADBC9;
    --gold: #B8912E;
    --dusk: #6B5E71;
    --white: #FFFDF9;
    --line: rgba(36,35,31,0.11);
    --shadow-soft: 0 2px 10px rgba(87,101,74,0.08);
    --shadow-lift: 0 6px 24px rgba(87,101,74,0.14);
  }
  * { box-sizing: border-box; }
  body, .threshold-root { -webkit-font-smoothing: antialiased; }
  input[type="range"] { accent-color: var(--sage-deep); }
  button { font-family: inherit; }
  button:hover { opacity: 0.92; }
  button:active { opacity: 0.8; }
  input:focus, textarea:focus, select:focus { border-color: var(--sage-deep) !important; box-shadow: 0 0 0 3px var(--sage-pale); }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-thumb { background: var(--line); border-radius: 3px; }
  .brand-mark { font-family: 'Fraunces', serif; letter-spacing: 0.14em; text-transform: uppercase; font-size: 13px; color: var(--sage-deep); }
  .fade-in { animation: fadeIn 0.35s ease both; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
`;

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&display=swap";

/* ---------------- Signature motif: an arch / threshold line drawing ---------------- */
function ThresholdArch({ tint = "var(--sage-deep)", width = 120 }) {
  return (
    <svg width={width} height={width * 0.9} viewBox="0 0 120 108" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 106V56C14 27.8 36.8 5 65 5H55C83.2 5 106 27.8 106 56V106" stroke={tint} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M28 106V58C28 35.9 45.9 18 68 18H52C74.1 18 92 35.9 92 58V106" stroke={tint} strokeWidth="1" strokeOpacity="0.5" strokeLinecap="round" />
      <line x1="60" y1="30" x2="60" y2="106" stroke={tint} strokeWidth="0.75" strokeOpacity="0.3" />
    </svg>
  );
}

/* ---------------- Season logic ---------------- */
const SEASONS = {
  spring: { label: "Spring", Icon: Flower2, tint: "#7C8B6F", produce: "asparagus, peas, radishes, spinach, strawberries, rhubarb" },
  summer: { label: "Summer", Icon: Sun, tint: "#C9A227", produce: "tomatoes, zucchini, corn, berries, peaches, cucumber, leafy greens" },
  fall:   { label: "Fall",   Icon: Leaf, tint: "#A85C32", produce: "squash, sweet potato, apples, pears, beets, brussels sprouts" },
  winter: { label: "Winter", Icon: Snowflake, tint: "#6B5E71", produce: "root vegetables, citrus, cabbage, leeks, dark leafy greens, stored grains" },
};
function getSeason(date) {
  const m = date.getMonth();
  if (m >= 2 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  if (m >= 8 && m <= 10) return "fall";
  return "winter";
}

/* ---------------- Program phase (weeks 1-12) ---------------- */
const FOUNDATION = {
  title: "Foundation — weeks 1–4",
  body: "Right now the only job is rest without guilt. No alarm. No productivity metric. If your body wants twelve hours of sleep, that isn't laziness — it's your nervous system finally being allowed to catch up. Alongside rest, we're learning what dysregulation actually feels like in your body, and a few simple tools to come back to yourself when it hits.",
};
const SEASON_CONTENT = {
  spring: { focus: "Re-entry", body: "Let sunlight hit your skin early in the day. Start moving outside — walking counts. Ease food back toward balance, not restriction. Reconnect with one person at a time, slowly." },
  summer: { focus: "Momentum", body: "Keep outdoor movement going, ideally enough to sweat. Watch hydration and don't let caffeine creep back in to cover fatigue. A good season to test a little more structure — carefully, not all at once." },
  fall:   { focus: "Guarding the transition", body: "Your body will try to warn you before a dip, not after. Get ahead of it: more light exposure now, keep movement going as it gets colder, and support your microbiome and mood before the low hits." },
  winter: { focus: "Protection", body: "This is the season that took you down before — we treat it differently this time. Prioritize light, keep some form of movement even indoors, and watch for sugar and caffeine sliding in as coping tools. Withdrawing is the signal to reach out, not wait it out." },
};

/* ---------------- Cycle logic ---------------- */
const PHASES = {
  menstrual:  { label: "Menstrual", tint: "#A85C32", energy: "Low — rest is the priority",
    food: "Warming, iron-rich foods: lentils, dark leafy greens, bone broth, beef or plant iron paired with vitamin C. Avoid pushing fasting or restriction this week.",
    movement: "Gentle only — walking, stretching, restorative yoga. Strength and high intensity can wait a few days.",
    supplement: "Magnesium bisglycinate in the evening helps with cramping. Consider extra B6 if PMS symptoms carried in from last week." },
  follicular: { label: "Follicular", tint: "#7C8B6F", energy: "Rising — this is your building phase",
    food: "Lighter, fresh foods — sprouted grains, fresh vegetables, lean proteins. Your body handles new foods and slightly more variety well right now.",
    movement: "Good window to add movement back in — brisker walks, light strength, trying something new.",
    supplement: "Magnesium bisglycinate daily as your baseline. No extra additions typically needed this week." },
  ovulatory:  { label: "Ovulatory", tint: "#C9A227", energy: "Peak — highest capacity of the month",
    food: "Fresh, raw, colourful foods — salads, fruit, foods with antioxidants. Your body can handle more social eating and variety here.",
    movement: "Highest-capacity window — if you're going to do more intense movement this month, this is the week.",
    supplement: "Magnesium bisglycinate baseline, plus antioxidant-rich foods (berries, colourful vegetables) over supplements." },
  luteal:     { label: "Luteal", tint: "#6B5E71", energy: "Winding down — protect your energy",
    food: "Complex carbs and grounding foods — sweet potato, oats, squash. This is not the week to restrict carbs; your body needs them.",
    movement: "Moderate movement — strength training or steady walks. Let intensity taper as the week goes on.",
    supplement: "Magnesium bisglycinate baseline, increase slightly if PMS symptoms appear (cramping, irritability, low mood)." },
};
function getPhase(cycleDay, cycleLength) {
  const len = cycleLength || 28;
  const menstrualEnd = 5;
  const follicularEnd = Math.round(len * 0.46); // ~day13 of 28
  const ovulatoryEnd = Math.round(len * 0.57);  // ~day16 of 28
  if (cycleDay <= menstrualEnd) return "menstrual";
  if (cycleDay <= follicularEnd) return "follicular";
  if (cycleDay <= ovulatoryEnd) return "ovulatory";
  return "luteal";
}

const SYMPTOM_OPTIONS = ["Brain fog", "Oversleeping", "Appetite change", "Anxiety", "Disconnection", "Irritability", "Cramping", "None today"];
const MOVEMENT_TYPES = ["Walk", "Yoga / stretch", "Strength", "Rest day", "Other"];

const NERVOUS_STATES = [
  { key: "safe", label: "Safe", regulated: true },
  { key: "calm", label: "Calm", regulated: true },
  { key: "focused", label: "Focused", regulated: true },
  { key: "alert", label: "Alert", regulated: true },
  { key: "fight", label: "Fight", regulated: false },
  { key: "flight", label: "Flight", regulated: false },
  { key: "freeze", label: "Freeze", regulated: false },
  { key: "shutdown", label: "Shutdown", regulated: false },
  { key: "overwhelmed", label: "Overwhelmed", regulated: false },
];
const CAPACITY_OPTIONS = [10, 20, 40, 60, 80, 100];
const ENERGY_LEAK_OPTIONS = ["A person/relationship", "Housework", "Childcare", "Work / client demands", "Phone / notifications", "Traffic / commute", "Conflict", "Uncertainty", "None today"];
const BOUNDARY_OPTIONS = ["Said yes, meant no", "Worked after hours", "Skipped a meal", "Ignored pain or a need", "Canceled my own plans", "Apologized unnecessarily", "None today"];

/* ---------------- Education content (Learn tab) ---------------- */
const EDUCATION_CONTENT = [
  {
    key: "b-vitamins",
    title: "B Vitamins",
    summary: "Energy production and the raw materials for your calming neurotransmitters.",
    body: "Every B vitamin acts as a helper molecule your body needs to produce energy and build neurotransmitters — including serotonin, dopamine, and melatonin. When any single B vitamin runs low, it can show up as real neurological or mood symptoms. B6, B9 (folate), and B12 also work together to keep homocysteine levels in a healthy range, which matters for long-term brain health.",
    foods: ["Baker's yeast", "Sunflower seeds", "Wheat germ", "Rice bran", "Shiitake mushrooms", "Spirulina", "Eggs", "Leafy greens", "Chickpeas & lentils", "Avocado"],
  },
  {
    key: "choline-inositol",
    title: "Choline & Inositol",
    summary: "The 'lipotropic' B vitamins — they help your body use fat and build every cell membrane.",
    body: "Choline and inositol help emulsify fat throughout the nervous system, including the myelin sheath that insulates your nerves. Choline specifically builds acetylcholine, the neurotransmitter behind focus and mood, and supports healthy fat transport through the bloodstream.",
    foods: ["Egg yolks", "Beef liver", "Fish roe", "Eggs", "Wheat germ", "Turkey giblets", "Watercress", "Shrimp", "Dark leafy greens", "Broccoli / rapini", "Cauliflower"],
  },
  {
    key: "calcium-magnesium",
    title: "Calcium & Magnesium",
    summary: "The minerals behind every nerve impulse — thought, memory, and perception all run on them.",
    body: "Calcium and magnesium are required for nerve conduction itself — the electrical signalling that underlies every thought, memory, and perception. This is part of why magnesium is so central to nervous-system recovery work.",
    foods: ["Hard cheeses (parmesan, romano)", "Sesame seeds", "Chia seeds", "Tahini", "Sardines", "Almonds", "Dark leafy greens", "Yogurt", "Broccoli"],
  },
  {
    key: "zinc",
    title: "Zinc",
    summary: "Balances copper, supports detox, and steadies mood.",
    body: "Zinc helps keep copper levels balanced, supports the body's detoxification of heavy metals, and plays a real role in stabilizing emotional regulation and mood.",
    foods: ["Oysters", "Wheat germ", "Beef", "Veal liver", "Tahini", "Pumpkin & squash seeds", "Sesame seeds", "Hemp seeds", "Cashews", "Chickpeas", "Spinach"],
  },
  {
    key: "iron",
    title: "Iron",
    summary: "Low iron is linked to anxiety and fatigue — but more isn't always better.",
    body: "Iron supports energy metabolism and is a cofactor in dopamine production; low iron status has been linked to anxiety-driven behaviour in human studies. Iron is also needed for myelination of nerve cells. That said, elevated iron levels are associated with neurodegenerative disease progression — this is a nutrient worth testing rather than guessing on.",
    foods: ["Spirulina", "Dark chocolate (85%+)", "Dark turkey meat", "Green peas", "Lentils", "Lamb", "Lean beef", "Shellfish (oysters, mussels, clams)", "Asparagus", "Spinach", "Pumpkin seeds", "Quinoa"],
  },
  {
    key: "electrolytes",
    title: "Electrolytes",
    summary: "Calcium, magnesium, potassium, sodium — the charge behind your nervous system's wiring.",
    body: "Electrolytes are the water-soluble charged minerals your nervous system runs its electrical impulses on. An imbalance — often from prolonged sweating, vomiting, or diarrhea — can show up mildly as fatigue, muscle weakness, and trouble concentrating, or, in acute cases, become medically serious. Balance across all of them matters more than maximizing any single one.",
  },
  {
    key: "antioxidants",
    title: "Antioxidants",
    summary: "Vitamins A, C, E and selenium — protection against everyday cellular damage.",
    body: "Oxidation naturally produces free radicals in the body, which can chain-react and damage cells over time. Antioxidants neutralize that process. Any diet rich in fruits, nuts, and vegetables is doing this work daily.",
  },
  {
    key: "vitamin-d",
    title: "Vitamin D",
    summary: "Your main protection against oxidative stress and neuroinflammation — and it comes from sunlight.",
    body: "Vitamin D protects against oxidative stress and neuroinflammation and supports neurotransmitter synthesis. Sunlight is the primary source, and the body stores reserves in the liver, spleen, bones, and even the brain — which is part of why seasonal sunlight exposure is built into this program.",
  },
  {
    key: "l-theanine",
    title: "L-Theanine",
    summary: "Calm without sedation — found in tea.",
    body: "L-theanine is an amino acid that promotes relaxation without dulling alertness. Research shows it's especially effective for people running higher-than-normal anxiety. Green and black tea are the natural dietary sources.",
  },
  {
    key: "omega-3",
    title: "Omega-3 (DHA)",
    summary: "The fat your brain is quite literally made of.",
    body: "DHA omega-3 makes up roughly 97% of the total omega-3s in the brain and about 30% of the structural fat in grey matter. It supports mood regulation and cognitive function across the lifespan.",
  },
  {
    key: "probiotics",
    title: "Probiotics",
    summary: "The gut-brain connection is real, and measurable.",
    body: "Certain probiotic strains have been shown to lower stress-induced cortisol-family hormones and reduce depressive behaviour in research settings. Clinical evidence supports probiotics reducing anxiety and stress response and improving mood, particularly in IBS and chronic fatigue populations — the gut and nervous system are in constant conversation.",
  },
  {
    key: "stress-response",
    title: "Counteracting the Stress Response",
    summary: "Fight-or-flight is natural — the relaxation response is what repairs it.",
    body: "Fight-or-flight is a survival mechanism, and the relaxation response (parasympathetic activation) is what counterbalances it, creating physiological calm and allowing the body to repair stress-response damage. Dr. Herbert Benson's research found only two components were truly necessary to trigger it: a repeated mental focus point (a word, phrase, or mantra) and a passive, non-judgmental attitude toward whatever arises. Practices like yoga, qigong, walking, swimming, or even knitting with a mantra can all elicit this response. When the body craves relaxation and doesn't get a healthy outlet, it often reaches for unhealthy ones instead — alcohol, tobacco, overeating — which only compounds the original stress.",
  },
  {
    key: "body-mind-balance",
    title: "Body/Mind Balance — Daily Practices",
    summary: "Small, repeatable practices that keep the nervous system regulated.",
    body: "Everyday stressors shape how the mind perceives past, present, and future events — and unexamined, that perception itself becomes a stressor. A few grounded daily practices help interrupt that cycle:",
    list: [
      "Relax on purpose, not just when collapse forces it",
      "Meditate, even briefly",
      "Practice deep-breathing exercises",
      "Commit to regular physical movement",
      "Express thoughts and fears in timely, appropriate ways rather than stockpiling them",
      "Listen to your inner self for clarity on how to handle stressors",
      "Spend time in nature — it genuinely helps ground the nervous system's electrical activity",
    ],
  },
];

/* ---------------- Storage helpers ---------------- */
const CLIENT_PREFIX = "client:";
const LIBRARY_KEY = "meditation-library";

async function loadClient(code) {
  try {
    const res = await window.storage.get(CLIENT_PREFIX + code, true);
    return res ? JSON.parse(res.value) : null;
  } catch { return null; }
}
async function saveClient(code, data) {
  try { await window.storage.set(CLIENT_PREFIX + code, JSON.stringify(data), true); }
  catch (e) { console.error("save failed", e); }
}
async function listClientCodes() {
  try {
    const res = await window.storage.list(CLIENT_PREFIX, true);
    return res ? res.keys.map((k) => k.replace(CLIENT_PREFIX, "")) : [];
  } catch { return []; }
}
async function loadLibrary() {
  try {
    const res = await window.storage.get(LIBRARY_KEY, true);
    return res ? JSON.parse(res.value) : [];
  } catch { return []; }
}
async function saveLibrary(items) {
  try { await window.storage.set(LIBRARY_KEY, JSON.stringify(items), true); }
  catch (e) { console.error("save failed", e); }
}

/* ---------------- AI food recognition ---------------- */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(file);
  });
}

async function analyzeFoodImage(file) {
  const base64 = await fileToBase64(file);
  const mediaType = file.type || "image/jpeg";
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            {
              type: "text",
              text: "Identify the food(s) in this photo and estimate nutrition for the visible portion size. Respond with ONLY raw JSON, no markdown fences, no preamble, in exactly this shape: {\"items\":\"short description\",\"calories\":number,\"protein_g\":number,\"carbs_g\":number,\"fat_g\":number,\"fiber_g\":number}. These are rough estimates from a photo, not a lab measurement.",
            },
          ],
        },
      ],
    }),
  });
  const data = await response.json();
  const textBlock = (data.content || []).find((b) => b.type === "text");
  if (!textBlock) throw new Error("No response from analysis");
  const clean = textBlock.text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

function emptyClient(name) {
  return {
    name,
    startDate: new Date().toISOString(),
    cycleStartDate: null,
    cycleLength: 28,
    adminNotes: "",
    extraSupplements: [],
    checkins: [],
  };
}

/* ---------------- Shared UI bits ---------------- */
const inputStyle = {
  width: "100%", boxSizing: "border-box", marginTop: 6, padding: "10px 12px",
  fontSize: 15, border: "1px solid var(--line)", borderRadius: 3,
  background: "var(--linen)", color: "var(--ink)", outline: "none", fontFamily: "inherit",
};
const label = { fontSize: 12, letterSpacing: 0.4, textTransform: "uppercase", color: "var(--ink-soft)" };
const card = {
  background: "var(--white)", border: "1px solid var(--line)", borderRadius: 6, padding: "24px 28px",
  boxShadow: "0 1px 3px rgba(43,42,37,0.05)",
};
const primaryBtn = {
  padding: "11px 20px", background: "var(--sage-deep)", color: "var(--white)",
  border: "none", borderRadius: 4, fontSize: 14, cursor: "pointer", transition: "opacity 0.15s ease",
};
const ghostBtn = {
  background: "var(--white)", border: "1px solid var(--line)", color: "var(--ink-soft)",
  fontSize: 13, borderRadius: 4, padding: "7px 14px", cursor: "pointer", transition: "border-color 0.15s ease",
};

/* ================= LOGIN ================= */
function Login({ onEnter }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const submit = () => {
    if (!code.trim()) { setError("Enter your access code."); return; }
    if (code.trim().toUpperCase() !== ADMIN_CODE && !name.trim()) {
      setError("Enter your name and the access code you were given."); return;
    }
    onEnter(name.trim(), code.trim().toUpperCase());
  };
  return (
    <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="fade-in" style={{ maxWidth: 400, width: "100%", ...card, padding: "44px 36px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <ThresholdArch width={72} />
        </div>
        <p className="brand-mark" style={{ marginBottom: 18 }}>{BRAND_NAME}</p>
        <p style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontWeight: 500, fontSize: 26, color: "var(--ink)", margin: "0 0 8px", lineHeight: 1.2 }}>
          Welcome back to yourself.
        </p>
        <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: "0 0 30px" }}>
          Enter your name and the access code from your welcome message.
        </p>
        <label style={{ ...label, textAlign: "left", display: "block" }}>Your name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="First name" />
        <label style={{ ...label, marginTop: 16, display: "block", textAlign: "left" }}>Access code</label>
        <input value={code} onChange={(e) => setCode(e.target.value)} style={inputStyle} placeholder="e.g. MAYA24"
          onKeyDown={(e) => e.key === "Enter" && submit()} />
        {error && <p style={{ color: "var(--clay)", fontSize: 13, marginTop: 10 }}>{error}</p>}
        <button onClick={submit} style={{ ...primaryBtn, width: "100%", marginTop: 26 }}>Enter</button>
      </div>
    </div>
  );
}

/* ================= Cycle setup prompt ================= */
function CycleSetup({ onSet }) {
  const [date, setDate] = useState("");
  const [length, setLength] = useState(28);
  return (
    <div style={{ ...card, background: "var(--linen-deep)" }}>
      <p style={{ fontFamily: "Fraunces, serif", fontSize: 18, margin: "0 0 8px" }}>Sync your cycle</p>
      <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Enter the first day of your last period so your food, movement, and supplement guidance can follow your body — not just the calendar.
      </p>
      <label style={label}>First day of last period</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
      <label style={{ ...label, marginTop: 14, display: "block" }}>Typical cycle length (days)</label>
      <input type="number" min={20} max={40} value={length} onChange={(e) => setLength(Number(e.target.value))} style={inputStyle} />
      <button
        style={{ ...primaryBtn, marginTop: 16 }}
        onClick={() => date && onSet(new Date(date).toISOString(), length)}
      >
        Save
      </button>
      <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 12, opacity: 0.8 }}>
        You can skip this and update it any time — it just won't personalize by cycle until it's set.
      </p>
    </div>
  );
}

/* ================= Guidance card (season + phase combined) ================= */
function GuidanceCard({ season, week, phaseKey }) {
  const s = SEASONS[season];
  const Icon = s.Icon;
  const inFoundation = week <= 4;
  const phase = phaseKey ? PHASES[phaseKey] : null;

  return (
    <div style={{ ...card, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -14, right: -10, opacity: 0.06 }}>
        <ThresholdArch tint={s.tint} width={160} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <Icon size={18} color={s.tint} strokeWidth={1.75} />
        <span style={{ fontSize: 12, letterSpacing: 0.6, textTransform: "uppercase", color: "var(--ink-soft)" }}>
          {s.label} · Week {week} of 12
        </span>
        {phase && (
          <span style={{ fontSize: 12, letterSpacing: 0.6, textTransform: "uppercase", color: phase.tint, border: `1px solid ${phase.tint}`, borderRadius: 20, padding: "2px 10px" }}>
            {phase.label} phase
          </span>
        )}
      </div>

      {inFoundation ? (
        <>
          <p style={{ fontFamily: "Fraunces, serif", fontSize: 22, margin: "0 0 10px" }}>{FOUNDATION.title}</p>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink-soft)", margin: "0 0 16px" }}>{FOUNDATION.body}</p>
        </>
      ) : (
        <>
          <p style={{ fontFamily: "Fraunces, serif", fontSize: 22, margin: "0 0 10px" }}>
            {s.label} focus — {SEASON_CONTENT[season].focus}
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink-soft)", margin: "0 0 16px" }}>{SEASON_CONTENT[season].body}</p>
        </>
      )}

      <p style={{ fontSize: 12, color: "var(--ink-soft)", margin: "0 0 4px" }}>
        <strong>In season near you right now:</strong> {s.produce}
      </p>

      {phase && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
          <p style={{ fontSize: 13, color: phase.tint, fontWeight: 600, margin: "0 0 8px" }}>{phase.energy}</p>
          <p style={{ fontSize: 14, margin: "0 0 8px" }}><strong>Food:</strong> {phase.food}</p>
          <p style={{ fontSize: 14, margin: "0 0 8px" }}><strong>Movement:</strong> {phase.movement}</p>
          <p style={{ fontSize: 14, margin: 0 }}><strong>Supplement:</strong> {phase.supplement}</p>
        </div>
      )}

      <p style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 14, opacity: 0.75 }}>
        This is general holistic guidance, not medical advice — check any new supplement with your doctor, especially if you're on medication.
      </p>
    </div>
  );
}

/* ================= Meal photo logger (AI nutrition estimate) ================= */
function MealLogger({ meals, setMeals }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [pending, setPending] = useState(null); // parsed AI result awaiting confirm
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(""); setAnalyzing(true); setPending(null);
    try {
      const result = await analyzeFoodImage(file);
      setPending({
        items: result.items || "Unknown food",
        calories: Number(result.calories) || 0,
        protein_g: Number(result.protein_g) || 0,
        carbs_g: Number(result.carbs_g) || 0,
        fat_g: Number(result.fat_g) || 0,
        fiber_g: Number(result.fiber_g) || 0,
      });
    } catch {
      setError("Couldn't read that photo — try again, or enter it manually below.");
    } finally {
      setAnalyzing(false);
      e.target.value = "";
    }
  };

  const startManual = () => {
    setError("");
    setPending({ items: "", calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 });
  };

  const updatePending = (field, val) => setPending({ ...pending, [field]: val });

  const confirmAdd = () => {
    if (!pending.items.trim()) { setError("Give the food a name before adding it."); return; }
    setMeals([...meals, pending]);
    setPending(null);
  };
  const removeMeal = (i) => setMeals(meals.filter((_, idx) => idx !== i));

  const totals = meals.reduce((acc, m) => ({
    calories: acc.calories + (m.calories || 0),
    protein_g: acc.protein_g + (m.protein_g || 0),
    carbs_g: acc.carbs_g + (m.carbs_g || 0),
    fat_g: acc.fat_g + (m.fat_g || 0),
    fiber_g: acc.fiber_g + (m.fiber_g || 0),
  }), { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 });

  return (
    <div>
      <Divider icon={<Sparkles size={14} />} text="Log a meal" />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <label style={{ ...ghostBtn, display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <Plus size={14} /> {analyzing ? "Reading your photo..." : "Add a food photo"}
          <input type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} disabled={analyzing} />
        </label>
        <button onClick={startManual} style={{ ...ghostBtn, display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Plus size={14} /> Type it in manually
        </button>
      </div>
      {error && <p style={{ fontSize: 12, color: "var(--clay)", marginTop: 8 }}>{error}</p>}

      {pending && (
        <div style={{ marginTop: 12, padding: 14, background: "var(--linen)", borderRadius: 4, border: "1px solid var(--line)" }}>
          <input value={pending.items} onChange={(e) => updatePending("items", e.target.value)} placeholder="Food name (e.g. Greek yogurt with berries)" style={{ ...inputStyle, marginTop: 0, marginBottom: 8, fontWeight: 500 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 8 }}>
            {[["calories", "kcal"], ["protein_g", "protein g"], ["carbs_g", "carbs g"], ["fat_g", "fat g"], ["fiber_g", "fiber g"]].map(([f, l]) => (
              <div key={f}>
                <span style={{ fontSize: 10, color: "var(--ink-soft)" }}>{l}</span>
                <input type="number" value={pending[f]} onChange={(e) => updatePending(f, Number(e.target.value))} style={{ ...inputStyle, marginTop: 2, padding: "6px 8px" }} />
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "var(--ink-soft)", margin: "8px 0" }}>Estimate from photo — adjust anything that looks off, then confirm.</p>
          <button onClick={confirmAdd} style={{ ...primaryBtn, padding: "8px 16px", fontSize: 13 }}>Add to today's log</button>
        </div>
      )}

      {meals.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {meals.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
              <span style={{ fontSize: 13 }}>{m.items} — {m.calories} kcal</span>
              <button onClick={() => removeMeal(i)} style={{ background: "none", border: "none", cursor: "pointer" }}><Trash2 size={13} color="var(--clay)" /></button>
            </div>
          ))}
          <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 8 }}>
            Today so far: {Math.round(totals.calories)} kcal · {Math.round(totals.protein_g)}g protein · {Math.round(totals.carbs_g)}g carbs · {Math.round(totals.fat_g)}g fat · {Math.round(totals.fiber_g)}g fiber
          </p>
        </div>
      )}
    </div>
  );
}

/* ================= Daily check-in ================= */
function CheckIn({ onSave, extraSupplements, customSupplements, onAddCustomSupplement }) {
  const [newSuppInput, setNewSuppInput] = useState("");
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [symptoms, setSymptoms] = useState([]);
  const [note, setNote] = useState("");
  const [gratitude, setGratitude] = useState(["", "", ""]);
  const [movements, setMovements] = useState([]);
  const [movementType, setMovementType] = useState("Walk");
  const [movementDetail, setMovementDetail] = useState("");
  const [hydration, setHydration] = useState(0);
  const [suppsTaken, setSuppsTaken] = useState([]);
  const [mindfulness, setMindfulness] = useState(false);
  const [nervousState, setNervousState] = useState(null);
  const [capacity, setCapacity] = useState(null);
  const [energyLeaks, setEnergyLeaks] = useState([]);
  const [boundaryHits, setBoundaryHits] = useState([]);
  const [cupFillers, setCupFillers] = useState("");
  const [meals, setMeals] = useState([]);
  const [saved, setSaved] = useState(false);

  const allSupplements = ["Magnesium bisglycinate", ...extraSupplements, ...(customSupplements || [])];

  const submitNewSupp = () => {
    if (!newSuppInput.trim()) return;
    onAddCustomSupplement(newSuppInput.trim());
    setNewSuppInput("");
  };

  const toggle = (list, setList, item) =>
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  const addMovement = () => {
    if (!movementDetail.trim()) return;
    setMovements([...movements, { type: movementType, detail: movementDetail.trim() }]);
    setMovementDetail("");
  };
  const removeMovement = (i) => setMovements(movements.filter((_, idx) => idx !== i));

  const submit = () => {
    onSave({
      date: new Date().toISOString(), mood, energy, symptoms, note,
      gratitude: gratitude.filter((g) => g.trim()),
      movements,
      hydration, supplementsTaken: suppsTaken, mindfulness,
      nervousState, capacity, energyLeaks, boundaryHits, cupFillers, meals,
    });
    setSymptoms([]); setNote(""); setGratitude(["", "", ""]);
    setMovements([]); setMovementDetail(""); setHydration(0); setSuppsTaken([]); setMindfulness(false);
    setNervousState(null); setCapacity(null); setEnergyLeaks([]); setBoundaryHits([]); setCupFillers(""); setMeals([]);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={card}>
      <p style={{ fontFamily: "Fraunces, serif", fontSize: 20, margin: "0 0 18px" }}>Today's check-in</p>

      <SliderRow label="Mood" value={mood} onChange={setMood} lowLabel="heavy" highLabel="light" />
      <SliderRow label="Energy" value={energy} onChange={setEnergy} lowLabel="depleted" highLabel="steady" />

      <Divider icon={<Sparkles size={14} />} text="Nervous system state" />
      <ChipRow options={NERVOUS_STATES.map((n) => n.label)} selected={nervousState ? [nervousState] : []}
        onToggle={(s) => setNervousState(nervousState === s ? null : s)} />

      <Divider icon={<Sparkles size={14} />} text="Capacity today — how much did you actually have?" />
      <ChipRow options={CAPACITY_OPTIONS.map((c) => `${c}%`)} selected={capacity ? [`${capacity}%`] : []}
        onToggle={(s) => setCapacity(capacity === Number(s.replace("%", "")) ? null : Number(s.replace("%", "")))} />

      <p style={{ ...label, margin: "18px 0 8px" }}>Anything showing up today?</p>
      <ChipRow options={SYMPTOM_OPTIONS} selected={symptoms} onToggle={(s) => toggle(symptoms, setSymptoms, s)} />

      <Divider icon={<Sparkles size={14} />} text="What stole your energy today?" />
      <ChipRow options={ENERGY_LEAK_OPTIONS} selected={energyLeaks} onToggle={(s) => toggle(energyLeaks, setEnergyLeaks, s)} />

      <Divider icon={<Sparkles size={14} />} text="Boundaries today" />
      <ChipRow options={BOUNDARY_OPTIONS} selected={boundaryHits} onToggle={(s) => toggle(boundaryHits, setBoundaryHits, s)} />

      <Divider icon={<Sparkles size={14} />} text="What actually filled your cup today?" />
      <input value={cupFillers} onChange={(e) => setCupFillers(e.target.value)} placeholder="e.g. sunshine, a quiet morning, a good conversation" style={inputStyle} />

      <Divider icon={<Sparkles size={14} />} text="Three things you're grateful for" />
      {gratitude.map((g, i) => (
        <input key={i} value={g} onChange={(e) => {
          const copy = [...gratitude]; copy[i] = e.target.value; setGratitude(copy);
        }} placeholder={`${i + 1}.`} style={{ ...inputStyle, marginBottom: 6 }} />
      ))}

      <MealLogger meals={meals} setMeals={setMeals} />

      <Divider icon={<Footprints size={14} />} text="Movement — add as many as apply" />
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <select value={movementType} onChange={(e) => setMovementType(e.target.value)} style={{ ...inputStyle, width: "auto", marginTop: 0 }}>
          {MOVEMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <input value={movementDetail} onChange={(e) => setMovementDetail(e.target.value)} placeholder="e.g. 30 min or 8,000 steps"
          onKeyDown={(e) => e.key === "Enter" && addMovement()}
          style={{ ...inputStyle, width: 180, marginTop: 0 }} />
        <button onClick={addMovement} style={{ ...ghostBtn, display: "flex", alignItems: "center", gap: 6 }}><Plus size={14} /> Add</button>
      </div>
      {movements.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
          {movements.map((m, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, background: "var(--linen)", padding: "5px 10px", borderRadius: 20 }}>
              {m.type} · {m.detail} <Trash2 size={12} style={{ cursor: "pointer" }} onClick={() => removeMovement(i)} color="var(--clay)" />
            </span>
          ))}
        </div>
      )}

      <Divider icon={<Droplet size={14} />} text="Hydration" />
      <div style={{ display: "flex", gap: 6 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <button key={n} onClick={() => setHydration(n)} style={{
            width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--sage-deep)",
            background: hydration >= n ? "var(--sage-deep)" : "transparent", cursor: "pointer",
          }} />
        ))}
        <span style={{ fontSize: 12, color: "var(--ink-soft)", marginLeft: 8, alignSelf: "center" }}>{hydration}/8 glasses</span>
      </div>

      <Divider icon={<Check size={14} />} text="Supplements taken" />
      <ChipRow options={allSupplements} selected={suppsTaken} onToggle={(s) => toggle(suppsTaken, setSuppsTaken, s)} />
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input value={newSuppInput} onChange={(e) => setNewSuppInput(e.target.value)} placeholder="Add a supplement not listed"
          onKeyDown={(e) => e.key === "Enter" && submitNewSupp()}
          style={{ ...inputStyle, marginTop: 0, flex: 1 }} />
        <button onClick={submitNewSupp} style={ghostBtn}><Plus size={14} /></button>
      </div>

      <Divider icon={<Sparkles size={14} />} text="Mindfulness" />
      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
        <input type="checkbox" checked={mindfulness} onChange={(e) => setMindfulness(e.target.checked)} />
        Did a mindfulness practice today (meditation, breathwork, journaling)
      </label>

      <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything else you want to remember from today (optional)"
        style={{ ...inputStyle, marginTop: 16, minHeight: 60, resize: "vertical" }} />

      <button onClick={submit} style={{ ...primaryBtn, marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
        {saved ? <><Check size={15} /> Saved</> : "Save check-in"}
      </button>
    </div>
  );
}

function Divider({ icon, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "18px 0 8px", color: "var(--ink-soft)" }}>
      {icon}<span style={label}>{text}</span>
    </div>
  );
}
function ChipRow({ options, selected, onToggle }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((s) => (
        <button key={s} onClick={() => onToggle(s)} style={{
          padding: "6px 12px", borderRadius: 20, fontSize: 13,
          border: `1px solid ${selected.includes(s) ? "var(--sage-deep)" : "var(--line)"}`,
          background: selected.includes(s) ? "var(--sage)" : "var(--linen)",
          color: selected.includes(s) ? "var(--white)" : "var(--ink-soft)", cursor: "pointer",
        }}>{s}</button>
      ))}
    </div>
  );
}
function SliderRow({ label: l, value, onChange, lowLabel, highLabel }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--ink-soft)", marginBottom: 4 }}>
        <span>{l}</span><span>{value}/5</span>
      </div>
      <input type="range" min={1} max={5} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-soft)", opacity: 0.7 }}>
        <span>{lowLabel}</span><span>{highLabel}</span>
      </div>
    </div>
  );
}

/* ================= Meditation library (client-facing) ================= */
function MeditationLibrary({ items }) {
  return (
    <div style={card}>
      <p style={{ fontFamily: "Fraunces, serif", fontSize: 20, margin: "0 0 16px" }}>Meditations & practices</p>
      {items.length === 0 && <p style={{ fontSize: 13, color: "var(--ink-soft)", fontStyle: "italic" }}>Your practitioner hasn't added any links yet — check back soon.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((m, i) => (
          <a key={i} href={m.url} target="_blank" rel="noreferrer" style={{
            display: "flex", alignItems: "center", gap: 10, textDecoration: "none",
            color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 4, padding: "10px 14px",
          }}>
            <PlayCircle size={18} color="var(--sage-deep)" />
            <div>
              <p style={{ margin: 0, fontSize: 14 }}>{m.title}</p>
              {m.note && <p style={{ margin: 0, fontSize: 12, color: "var(--ink-soft)" }}>{m.note}</p>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ================= Patterns ================= */
function topTag(list) {
  const counts = {};
  list.forEach((t) => { if (t && t !== "None today") counts[t] = (counts[t] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted.length ? `${sorted[0][0]} (${sorted[0][1]}x)` : "Nothing recurring yet";
}

function Patterns({ checkins }) {
  if (checkins.length < 3) {
    return (
      <div style={card}>
        <p style={{ fontFamily: "Fraunces, serif", fontSize: 20, margin: "0 0 8px" }}>Your patterns</p>
        <p style={{ fontSize: 13, color: "var(--ink-soft)", fontStyle: "italic" }}>
          Log a few more check-ins and this will start showing you what's actually driving things — not just how you feel, but why.
        </p>
      </div>
    );
  }

  const withCapacity = checkins.filter((c) => c.capacity != null);
  const avgCapacity = withCapacity.length ? Math.round(withCapacity.reduce((s, c) => s + c.capacity, 0) / withCapacity.length) : null;
  const avgEnergy = Math.round((checkins.reduce((s, c) => s + (c.energy || 0), 0) / checkins.length) * 10) / 10;

  const allLeaks = checkins.flatMap((c) => c.energyLeaks || []);
  const allBoundaries = checkins.flatMap((c) => c.boundaryHits || []);

  const regulatedCount = checkins.filter((c) => {
    const s = NERVOUS_STATES.find((n) => n.label === c.nervousState);
    return s?.regulated;
  }).length;
  const dysregulatedCount = checkins.filter((c) => {
    const s = NERVOUS_STATES.find((n) => n.label === c.nervousState);
    return s && !s.regulated;
  }).length;

  return (
    <div style={card}>
      <p style={{ fontFamily: "Fraunces, serif", fontSize: 20, margin: "0 0 16px" }}>Your patterns</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 11, color: "var(--ink-soft)", margin: 0, textTransform: "uppercase", letterSpacing: 0.4 }}>Avg capacity</p>
          <p style={{ fontSize: 22, margin: 0, fontFamily: "Fraunces, serif" }}>{avgCapacity != null ? `${avgCapacity}%` : "—"}</p>
        </div>
        <div>
          <p style={{ fontSize: 11, color: "var(--ink-soft)", margin: 0, textTransform: "uppercase", letterSpacing: 0.4 }}>Avg energy</p>
          <p style={{ fontSize: 22, margin: 0, fontFamily: "Fraunces, serif" }}>{avgEnergy}/5</p>
        </div>
      </div>

      <p style={{ fontSize: 14, margin: "0 0 8px" }}><strong>Most common energy leak:</strong> {topTag(allLeaks)}</p>
      <p style={{ fontSize: 14, margin: "0 0 8px" }}><strong>Most common boundary break:</strong> {topTag(allBoundaries)}</p>
      <p style={{ fontSize: 14, margin: 0 }}>
        <strong>Nervous system:</strong> regulated {regulatedCount} of {regulatedCount + dysregulatedCount} logged days
      </p>

      {avgCapacity != null && avgEnergy < 3 && avgCapacity < 50 && (
        <p style={{ fontSize: 13, color: "var(--clay)", marginTop: 12, fontStyle: "italic" }}>
          Your capacity and energy are both running low — this is worth bringing to your next call rather than pushing through alone.
        </p>
      )}
    </div>
  );
}

/* ================= Learn tab (education accordion) ================= */
function AccordionItem({ item, open, onToggle }) {
  return (
    <div style={{ borderBottom: "1px solid var(--line)" }}>
      <button onClick={onToggle} style={{
        width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "none", border: "none", cursor: "pointer", padding: "16px 0", textAlign: "left",
      }}>
        <div>
          <p style={{ fontFamily: "Fraunces, serif", fontSize: 17, margin: 0, color: "var(--ink)" }}>{item.title}</p>
          <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "3px 0 0" }}>{item.summary}</p>
        </div>
        <ChevronDown size={18} color="var(--ink-soft)" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0, marginLeft: 12 }} />
      </button>
      {open && (
        <div style={{ paddingBottom: 18 }}>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--ink-soft)", margin: "0 0 12px" }}>{item.body}</p>
          {item.list && (
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {item.list.map((l, i) => (
                <li key={i} style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 6 }}>{l}</li>
              ))}
            </ul>
          )}
          {item.foods && (
            <>
              <p style={{ fontSize: 11, letterSpacing: 0.4, textTransform: "uppercase", color: "var(--ink-soft)", margin: "10px 0 8px" }}>
                Top food sources (highest concentration first)
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {item.foods.map((f) => (
                  <span key={f} style={{ fontSize: 12, background: "var(--linen)", border: "1px solid var(--line)", borderRadius: 20, padding: "4px 10px", color: "var(--ink)" }}>{f}</span>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function LearnTab() {
  const [openKey, setOpenKey] = useState(null);
  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <BookOpen size={18} color="var(--sage-deep)" />
        <p style={{ fontFamily: "Fraunces, serif", fontSize: 20, margin: 0 }}>Nutrients for a healthy nervous system</p>
      </div>
      <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "6px 0 8px" }}>
        Tap any nutrient to expand it. This is educational, not a prescription — check anything new with your doctor.
      </p>
      <div>
        {EDUCATION_CONTENT.map((item) => (
          <AccordionItem key={item.key} item={item} open={openKey === item.key} onToggle={() => setOpenKey(openKey === item.key ? null : item.key)} />
        ))}
      </div>
    </div>
  );
}

/* ================= History ================= */
function History({ checkins }) {
  const chartData = checkins.slice().reverse().map((c, i) => ({ idx: i + 1, mood: c.mood, energy: c.energy }));
  return (
    <div style={card}>
      <p style={{ fontFamily: "Fraunces, serif", fontSize: 20, margin: "0 0 16px" }}>Your pattern</p>
      {chartData.length > 1 ? (
        <div style={{ height: 160, marginBottom: 20 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="var(--line)" vertical={false} />
              <XAxis dataKey="idx" tick={{ fontSize: 11, fill: "var(--ink-soft)" }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
              <YAxis domain={[1, 5]} tick={{ fontSize: 11, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} width={20} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: "1px solid var(--line)" }} />
              <Line type="monotone" dataKey="mood" stroke="var(--sage-deep)" strokeWidth={2} dot={false} name="Mood" />
              <Line type="monotone" dataKey="energy" stroke="var(--gold)" strokeWidth={2} dot={false} name="Energy" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p style={{ fontSize: 13, color: "var(--ink-soft)", fontStyle: "italic" }}>Your trend line will appear once you've logged a few check-ins.</p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 280, overflowY: "auto" }}>
        {checkins.length === 0 && <p style={{ fontSize: 13, color: "var(--ink-soft)", fontStyle: "italic" }}>No check-ins yet.</p>}
        {checkins.slice().reverse().map((c, i) => (
          <div key={i} style={{ borderLeft: "2px solid var(--sage)", paddingLeft: 12 }}>
            <p style={{ fontSize: 12, color: "var(--ink-soft)", margin: 0 }}>
              {new Date(c.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · mood {c.mood}/5 · energy {c.energy}/5
              {c.capacity ? ` · ${c.capacity}% capacity` : ""}
              {c.nervousState ? ` · ${c.nervousState}` : ""}
              {c.hydration ? ` · ${c.hydration}/8 water` : ""}
            </p>
            {c.movements?.length > 0 && (
              <p style={{ fontSize: 12, color: "var(--sage-deep)", margin: "2px 0 0" }}>
                Movement: {c.movements.map((m) => `${m.type} (${m.detail})`).join(", ")}
              </p>
            )}
            {c.symptoms?.length > 0 && <p style={{ fontSize: 12, color: "var(--dusk)", margin: "2px 0 0" }}>{c.symptoms.join(", ")}</p>}
            {c.energyLeaks?.length > 0 && <p style={{ fontSize: 12, color: "var(--clay)", margin: "2px 0 0" }}>Drained by: {c.energyLeaks.join(", ")}</p>}
            {c.boundaryHits?.length > 0 && <p style={{ fontSize: 12, color: "var(--clay)", margin: "2px 0 0" }}>Boundaries: {c.boundaryHits.join(", ")}</p>}
            {c.cupFillers && <p style={{ fontSize: 12, color: "var(--sage-deep)", margin: "2px 0 0" }}>Filled cup: {c.cupFillers}</p>}
            {c.meals?.length > 0 && (
              <p style={{ fontSize: 12, color: "var(--ink-soft)", margin: "2px 0 0" }}>
                Meals: {c.meals.map((m) => m.items).join(", ")} — {Math.round(c.meals.reduce((s, m) => s + (m.calories || 0), 0))} kcal total
              </p>
            )}
            {c.gratitude?.length > 0 && <p style={{ fontSize: 13, color: "var(--ink)", margin: "4px 0 0", fontStyle: "italic" }}>Grateful for: {c.gratitude.join(" · ")}</p>}
            {c.note && <p style={{ fontSize: 13, color: "var(--ink)", margin: "4px 0 0" }}>"{c.note}"</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= CLIENT PORTAL ================= */
function ClientPortal({ session, client, setClient, library, onLogout }) {
  const today = new Date();
  const season = getSeason(today);

  const week = useMemo(() => {
    const start = new Date(client.startDate);
    const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    return Math.min(12, Math.max(1, Math.floor(diffDays / 7) + 1));
  }, [client.startDate]);

  const phaseKey = useMemo(() => {
    if (!client.cycleStartDate) return null;
    const start = new Date(client.cycleStartDate);
    const len = client.cycleLength || 28;
    const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    const cycleDay = ((diffDays % len) + len) % len + 1;
    return getPhase(cycleDay, len);
  }, [client.cycleStartDate, client.cycleLength]);

  const setCycle = async (isoDate, length) => {
    const updated = { ...client, cycleStartDate: isoDate, cycleLength: length };
    setClient(updated);
    await saveClient(session.code, updated);
  };
  const addCheckin = async (entry) => {
    const updated = { ...client, checkins: [...client.checkins, entry] };
    setClient(updated);
    await saveClient(session.code, updated);
  };
  const addCustomSupplement = async (name) => {
    if ((client.customSupplements || []).includes(name)) return;
    const updated = { ...client, customSupplements: [...(client.customSupplements || []), name] };
    setClient(updated);
    await saveClient(session.code, updated);
  };

  const [tab, setTab] = useState("today");
  const TABS = [
    { key: "today", label: "Today", Icon: DoorOpen },
    { key: "patterns", label: "Patterns", Icon: TrendingUp },
    { key: "library", label: "Library", Icon: PlayCircle },
    { key: "learn", label: "Learn", Icon: BookOpen },
  ];

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "36px 24px 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <p className="brand-mark" style={{ margin: 0 }}>{BRAND_NAME}</p>
          <p style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: 25, margin: "6px 0 0", color: "var(--ink)" }}>Hi, {session.name}.</p>
        </div>
        <button onClick={onLogout} style={{ ...ghostBtn, display: "flex", alignItems: "center", gap: 6, border: "none", background: "none" }}>
          <LogOut size={13} /> Log out
        </button>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 22, background: "var(--linen-deep)", padding: 5, borderRadius: 30 }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            background: tab === t.key ? "var(--white)" : "transparent", border: "none", cursor: "pointer",
            padding: "9px 10px", borderRadius: 24, fontSize: 13,
            color: tab === t.key ? "var(--sage-deep)" : "var(--ink-soft)",
            boxShadow: tab === t.key ? "var(--shadow-soft)" : "none",
            fontWeight: tab === t.key ? 600 : 400, transition: "all 0.15s ease",
          }}>
            <t.Icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {tab === "today" && (
          <>
            {!client.cycleStartDate && <CycleSetup onSet={setCycle} />}
            <GuidanceCard season={season} week={week} phaseKey={phaseKey} />
            <CheckIn onSave={addCheckin} extraSupplements={client.extraSupplements || []}
              customSupplements={client.customSupplements || []} onAddCustomSupplement={addCustomSupplement} />
          </>
        )}
        {tab === "patterns" && (
          <>
            <Patterns checkins={client.checkins} />
            <History checkins={client.checkins} />
          </>
        )}
        {tab === "library" && <MeditationLibrary items={library} />}
        {tab === "learn" && <LearnTab />}
      </div>

      <p style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: 13, color: "var(--sage-deep)", textAlign: "center", marginTop: 32, opacity: 0.85 }}>
        {BRAND_TAGLINE}
      </p>
    </div>
  );
}

/* ================= ADMIN DASHBOARD ================= */
function AdminDashboard({ onLogout }) {
  const [codes, setCodes] = useState([]);
  const [selectedCode, setSelectedCode] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [library, setLibraryState] = useState([]);
  const [newMedTitle, setNewMedTitle] = useState("");
  const [newMedUrl, setNewMedUrl] = useState("");
  const [newSupp, setNewSupp] = useState("");
  const [notesDraft, setNotesDraft] = useState("");

  const refreshCodes = async () => setCodes(await listClientCodes());

  useEffect(() => { refreshCodes(); loadLibrary().then(setLibraryState); }, []);

  const openClient = async (code) => {
    const data = await loadClient(code);
    setSelectedCode(code);
    setSelectedClient(data);
    setNotesDraft(data?.adminNotes || "");
  };

  const createClient = async () => {
    if (!newCode.trim() || !newName.trim()) return;
    const code = newCode.trim().toUpperCase();
    const data = emptyClient(newName.trim());
    await saveClient(code, data);
    setNewCode(""); setNewName("");
    await refreshCodes();
  };

  const saveNotes = async () => {
    const updated = { ...selectedClient, adminNotes: notesDraft };
    await saveClient(selectedCode, updated);
    setSelectedClient(updated);
  };

  const addSupplement = async () => {
    if (!newSupp.trim()) return;
    const updated = { ...selectedClient, extraSupplements: [...(selectedClient.extraSupplements || []), newSupp.trim()] };
    await saveClient(selectedCode, updated);
    setSelectedClient(updated);
    setNewSupp("");
  };
  const removeSupplement = async (s) => {
    const updated = { ...selectedClient, extraSupplements: selectedClient.extraSupplements.filter((x) => x !== s) };
    await saveClient(selectedCode, updated);
    setSelectedClient(updated);
  };

  const addMeditation = async () => {
    if (!newMedTitle.trim() || !newMedUrl.trim()) return;
    const updated = [...library, { title: newMedTitle.trim(), url: newMedUrl.trim() }];
    await saveLibrary(updated);
    setLibraryState(updated);
    setNewMedTitle(""); setNewMedUrl("");
  };
  const removeMeditation = async (i) => {
    const updated = library.filter((_, idx) => idx !== i);
    await saveLibrary(updated);
    setLibraryState(updated);
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 24px 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ShieldCheck size={18} color="var(--sage-deep)" />
          <div>
            <p className="brand-mark" style={{ margin: 0 }}>{BRAND_NAME}</p>
            <p style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: 22, margin: "4px 0 0" }}>Practitioner dashboard</p>
          </div>
        </div>
        <button onClick={onLogout} style={{ ...ghostBtn, display: "flex", alignItems: "center", gap: 6, border: "none" }}>
          <LogOut size={13} /> Log out
        </button>
      </div>

      {!selectedCode ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={card}>
            <p style={{ fontFamily: "Fraunces, serif", fontSize: 18, margin: "0 0 12px" }}>Add a new client</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Client name" style={{ ...inputStyle, flex: 1, marginTop: 0 }} />
              <input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="Access code e.g. MAYA24" style={{ ...inputStyle, flex: 1, marginTop: 0 }} />
              <button onClick={createClient} style={{ ...primaryBtn, display: "flex", alignItems: "center", gap: 6 }}><Plus size={15} /> Add</button>
            </div>
          </div>

          <div style={card}>
            <p style={{ fontFamily: "Fraunces, serif", fontSize: 18, margin: "0 0 12px" }}>Your clients</p>
            {codes.length === 0 && <p style={{ fontSize: 13, color: "var(--ink-soft)", fontStyle: "italic" }}>No clients yet — add one above.</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {codes.map((c) => (
                <button key={c} onClick={() => openClient(c)} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 16px", border: "1px solid var(--line)", borderRadius: 4,
                  background: "var(--linen)", cursor: "pointer", fontSize: 14, color: "var(--ink)",
                }}>
                  {c} <ChevronRight size={16} />
                </button>
              ))}
            </div>
          </div>

          <div style={card}>
            <p style={{ fontFamily: "Fraunces, serif", fontSize: 18, margin: "0 0 12px" }}>Meditation library (shared with all clients)</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
              <input value={newMedTitle} onChange={(e) => setNewMedTitle(e.target.value)} placeholder="Title" style={{ ...inputStyle, flex: 1, marginTop: 0 }} />
              <input value={newMedUrl} onChange={(e) => setNewMedUrl(e.target.value)} placeholder="Link URL" style={{ ...inputStyle, flex: 1, marginTop: 0 }} />
              <button onClick={addMeditation} style={{ ...primaryBtn, display: "flex", alignItems: "center", gap: 6 }}><Plus size={15} /> Add</button>
            </div>
            {library.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
                <span style={{ fontSize: 13 }}>{m.title}</span>
                <button onClick={() => removeMeditation(i)} style={{ background: "none", border: "none", cursor: "pointer" }}><Trash2 size={14} color="var(--clay)" /></button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <button onClick={() => setSelectedCode(null)} style={{ ...ghostBtn, alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6 }}>
            <X size={13} /> Back to all clients
          </button>

          <div style={card}>
            <p style={{ fontFamily: "Fraunces, serif", fontSize: 20, margin: "0 0 4px" }}>{selectedClient.name}</p>
            <p style={{ fontSize: 12, color: "var(--ink-soft)", margin: 0 }}>Code: {selectedCode} · Started {new Date(selectedClient.startDate).toLocaleDateString()}</p>
          </div>

          <div style={card}>
            <p style={{ fontFamily: "Fraunces, serif", fontSize: 18, margin: "0 0 10px" }}>Extra supplements for this client</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input value={newSupp} onChange={(e) => setNewSupp(e.target.value)} placeholder="e.g. Vitamin B6" style={{ ...inputStyle, flex: 1, marginTop: 0 }} />
              <button onClick={addSupplement} style={ghostBtn}><Plus size={14} /></button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(selectedClient.extraSupplements || []).map((s) => (
                <span key={s} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, background: "var(--linen)", padding: "5px 10px", borderRadius: 20 }}>
                  {s} <Trash2 size={12} style={{ cursor: "pointer" }} onClick={() => removeSupplement(s)} color="var(--clay)" />
                </span>
              ))}
            </div>
          </div>

          <div style={card}>
            <p style={{ fontFamily: "Fraunces, serif", fontSize: 18, margin: "0 0 10px" }}>Private notes (client never sees this)</p>
            <textarea value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} />
            <button onClick={saveNotes} style={{ ...primaryBtn, marginTop: 10 }}>Save notes</button>
          </div>

          <Patterns checkins={selectedClient.checkins || []} />
          <History checkins={selectedClient.checkins || []} />
        </div>
      )}
    </div>
  );
}

/* ================= ROOT ================= */
export default function RecoveryPortal() {
  const [session, setSession] = useState(null);
  const [client, setClient] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [library, setLibrary] = useState([]);

  const enter = async (name, code) => {
    if (code === ADMIN_CODE) {
      setIsAdmin(true);
      setSession({ name: "Admin", code });
      return;
    }
    let data = await loadClient(code);
    if (!data) {
      data = emptyClient(name);
      await saveClient(code, data);
    }
    setClient(data);
    setSession({ name: data.name, code });
    setLibrary(await loadLibrary());
  };

  const logout = () => { setSession(null); setClient(null); setIsAdmin(false); };

  return (
    <div style={{ minHeight: 640, background: "var(--linen)", fontFamily: "'Inter', sans-serif", color: "var(--ink)" }}>
      <style>{TOKENS}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href={FONT_LINK} rel="stylesheet" />

      {!session ? (
        <Login onEnter={enter} />
      ) : isAdmin ? (
        <AdminDashboard onLogout={logout} />
      ) : (
        <ClientPortal session={session} client={client} setClient={setClient} library={library} onLogout={logout} />
      )}
    </div>
  );
}
