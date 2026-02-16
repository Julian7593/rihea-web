
import { useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Cloud,
  Handshake,
  HeartPulse,
  LayoutDashboard,
  Leaf,
  Play,
  Settings,
  ShieldCheck,
  Smile,
  Sparkles,
  X,
} from "lucide-react";

const moodEmoji = ["😭☁️", "🌧️", "☁️", "⛅", "☀️😊"];
const sectionAnim = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };
const presets = {
  morandi: {
    bg: "radial-gradient(circle at 16% 12%, rgba(230,170,196,.16), transparent 38%), radial-gradient(circle at 85% 18%, rgba(156,176,163,.2), transparent 42%), linear-gradient(180deg, #fcf9f2 0%, #f8f4ea 100%)",
    header: "rgba(252,249,242,.86)",
    panel: "rgba(248,245,236,.92)",
    card: "rgba(247,244,236,.9)",
    side: "rgba(242,239,227,.88)",
    tabBg: "rgba(156,176,163,.2)",
    tabText: "#6E7F75",
    pillBg: "rgba(156,176,163,.15)",
    pillText: "#6E7F75",
    primaryBg: "#E6AAC4",
    primaryText: "#5F4652",
    greetFrom: "rgba(156,176,163,.28)",
    greetTo: "rgba(230,170,196,.3)",
  },
  nature: {
    bg: "radial-gradient(circle at 12% 10%, rgba(140,170,146,.16), transparent 36%), radial-gradient(circle at 86% 16%, rgba(176,197,173,.25), transparent 44%), linear-gradient(180deg, #f5f8f1 0%, #edf4ea 100%)",
    header: "rgba(245,248,241,.9)",
    panel: "rgba(236,243,232,.92)",
    card: "rgba(239,246,234,.9)",
    side: "rgba(227,238,221,.88)",
    tabBg: "rgba(126,157,135,.22)",
    tabText: "#4E6C5D",
    pillBg: "rgba(126,157,135,.18)",
    pillText: "#567363",
    primaryBg: "#8DAA95",
    primaryText: "#F3F7EF",
    greetFrom: "rgba(141,170,149,.32)",
    greetTo: "rgba(188,212,183,.34)",
  },
  sunrise: {
    bg: "radial-gradient(circle at 16% 10%, rgba(228,185,145,.2), transparent 36%), radial-gradient(circle at 84% 18%, rgba(216,163,111,.2), transparent 42%), linear-gradient(180deg, #fdf6ee 0%, #f8eee2 100%)",
    header: "rgba(253,246,238,.9)",
    panel: "rgba(249,240,228,.92)",
    card: "rgba(252,244,234,.92)",
    side: "rgba(247,234,217,.9)",
    tabBg: "rgba(217,163,111,.28)",
    tabText: "#724F3A",
    pillBg: "rgba(217,163,111,.2)",
    pillText: "#7A5640",
    primaryBg: "#D9A36F",
    primaryText: "#4F3A2A",
    greetFrom: "rgba(217,163,111,.34)",
    greetTo: "rgba(230,170,196,.25)",
  },
};

const txt = (lang, en, zh) => (lang === "zh" ? zh : en);

function ToggleRow({ label, on, toggle }) {
  return (
    <button type="button" onClick={toggle} className="flex w-full items-center justify-between rounded-2xl border border-sage/20 bg-[#fffaf2] px-4 py-3 text-left">
      <span className="text-sm font-semibold text-clay">{label}</span>
      <span className={`relative h-6 w-11 rounded-full transition ${on ? "bg-sage/70" : "bg-sage/25"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${on ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function HeroArt({ lang }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="relative mx-auto w-full max-w-[500px]">
      <div className="absolute -left-8 top-8 h-24 w-24 rounded-full bg-coral/25 blur-xl" />
      <div className="absolute -right-10 top-14 h-28 w-28 rounded-full bg-sage/25 blur-xl" />
      <div className="relative overflow-hidden rounded-[3rem] border border-sage/20 bg-[#f7f4eb]/90 p-6 shadow-soft backdrop-blur sm:p-7">
        <svg viewBox="0 0 420 420" className="relative z-10 h-full w-full">
          <defs><linearGradient id="flow" x1="0%" x2="100%" y1="0%" y2="100%"><stop offset="0%" stopColor="#9CB0A3" /><stop offset="100%" stopColor="#E6AAC4" /></linearGradient></defs>
          <path d="M140 330c-28-56-8-132 36-171 39-34 96-34 120 17 17 36 2 82-30 104-24 16-56 20-78 5" fill="none" stroke="url(#flow)" strokeLinecap="round" strokeWidth="10" />
          <path d="M110 306c23 22 53 35 84 35" fill="none" stroke="#9CB0A3" strokeLinecap="round" strokeWidth="8" />
          <path d="M270 129c24 12 43 34 52 60" fill="none" stroke="#E6AAC4" strokeLinecap="round" strokeWidth="8" />
        </svg>
        <div className="mt-4 flex items-center justify-between rounded-3xl bg-[#fffdf7]/75 px-4 py-3 text-sm text-clay">
          <span className="inline-flex items-center gap-2"><Leaf className="h-4 w-4 text-sage" />{txt(lang, "Daily emotional check-in", "每日情绪签到")}</span>
          <span className="rounded-full bg-coral/25 px-3 py-1 text-xs font-semibold text-clay">{txt(lang, "2 min", "2 分钟")}</span>
        </div>
      </div>
    </motion.div>
  );
}

function SleepWave({ lang }) {
  return (
    <article className="rounded-3xl bg-[#edf2eb]/80 p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-clay/75">{txt(lang, "Sleep Quality", "睡眠质量")}</p>
        <p className="font-heading text-xl font-bold text-sage">82%</p>
      </div>
      <div className="mt-3 h-24 overflow-hidden rounded-2xl bg-[#f8f4ea]"><svg viewBox="0 0 360 120" className="h-full w-full"><defs><linearGradient id="sleepWave" x1="0%" x2="100%" y1="0%" y2="100%"><stop offset="0%" stopColor="#9CB0A3" stopOpacity="0.65" /><stop offset="100%" stopColor="#E6AAC4" stopOpacity="0.45" /></linearGradient></defs><motion.path d="M-40 72C5 56 42 84 84 70C126 56 168 84 210 70C252 56 294 84 336 70C365 61 380 64 400 70V120H-40Z" fill="url(#sleepWave)" animate={{ x: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity }} /></svg></div>
    </article>
  );
}

function StressRing({ lang }) {
  const value = 72;
  const high = value >= 65;
  const radius = 44;
  const c = 2 * Math.PI * radius;
  const offset = c * (1 - value / 100);
  return (
    <article className="rounded-3xl bg-[#fff7ed]/85 p-4">
      <p className="text-sm font-semibold text-clay/75">{txt(lang, "Heart Rate Stress Level", "心率压力水平")}</p>
      <div className="mt-3 flex items-center gap-4">
        <svg viewBox="0 0 120 120" className="h-24 w-24"><circle cx="60" cy="60" r={radius} fill="none" stroke="#E8E4D7" strokeWidth="10" /><motion.circle cx="60" cy="60" r={radius} fill="none" stroke={high ? "#D9A36F" : "#9CB0A3"} strokeLinecap="round" strokeWidth="10" transform="rotate(-90 60 60)" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1 }} /><text x="60" y="66" textAnchor="middle" className="fill-clay font-heading text-[19px] font-bold">{value}%</text></svg>
        <p className="text-sm leading-relaxed text-clay/85">{txt(lang, "Stress is elevated today. A short breathing break can help your nervous system settle.", "今天压力偏高，建议做一个短呼吸练习，帮助神经系统放松。")}</p>
      </div>
    </article>
  );
}

function HomeSection({ lang, style, compact, onStart }) {
  const quick = lang === "zh" ? [["2分钟", "每日情绪打卡"], ["24/7", "温暖陪伴在线"], ["循证", "临床心理依据"]] : [["2-min", "Daily check-in"], ["24/7", "Calm companionship"], ["Evidence-based", "Clinical foundation"]];
  return (
    <section className={`mx-auto max-w-6xl px-6 sm:px-8 lg:px-10 ${compact ? "pt-8" : "pt-12"}`}>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <motion.div variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }} initial="hidden" animate="show" className="space-y-7">
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold" style={{ backgroundColor: style.pillBg, color: style.pillText }}><Sparkles className="h-4 w-4" />{txt(lang, "Gentle care, every day", "每天一点温柔照护")}</span>
          <h1 className="font-heading text-4xl font-bold leading-tight text-clay sm:text-5xl">{txt(lang, "Rihea: Your Emotional Sanctuary During Pregnancy.", "Rihea：孕期情绪的安心港湾。")}</h1>
          <p className="max-w-xl text-lg leading-relaxed text-clay/90">{txt(lang, "Bridging Clinical Psychology with Warm Companionship.", "把临床心理学和温暖陪伴连接在一起。")}</p>
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" onClick={onStart} className="inline-flex items-center gap-2 rounded-full px-7 py-3 font-bold shadow-soft transition hover:brightness-95" style={{ backgroundColor: style.primaryBg, color: style.primaryText }}>{txt(lang, "Start Your Journey", "开启你的旅程")}<ArrowRight className="h-4 w-4" /></button>
            <span className="inline-flex items-center gap-2 text-sm text-clay/80"><ShieldCheck className="h-4 w-4 text-sage" />{txt(lang, "Privacy-first and clinically informed", "隐私优先，临床支持")}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">{quick.map(([v, l]) => <div key={l} className="rounded-3xl border border-sage/20 px-4 py-3" style={{ backgroundColor: style.card }}><p className="font-heading text-lg font-bold text-sage">{v}</p><p className="mt-0.5 text-sm text-clay/80">{l}</p></div>)}</div>
        </motion.div>
        <HeroArt lang={lang} />
      </div>
    </section>
  );
}

function FeaturesSection({ lang, style, compact }) {
  const items = lang === "zh"
    ? [["心情追踪", "通过温和的日常记录，尽早发现情绪变化与模式。"], ["伴侣同步", "让伴侣及时理解你的状态，并获得可执行的支持提示。"], ["科学照护", "将临床心理学方法转化为每天都能实践的支持策略。"]]
    : [["Mood Tracking", "Spot emotional patterns early through gentle daily reflections and soothing visual trends."], ["Partner Sync", "Keep your partner connected with caring prompts and clear ways to support your emotional needs."], ["Scientific Care", "Evidence-based guidance from clinical psychology translated into warm, practical daily support."]];
  return (
    <section className={`mx-auto max-w-6xl px-6 sm:px-8 lg:px-10 ${compact ? "pt-8" : "pt-12"}`}>
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage/90">{txt(lang, "Core Features", "核心功能")}</p>
      <h2 className="mt-2 font-heading text-3xl font-bold text-clay sm:text-4xl">{txt(lang, "One calm place for emotional support", "一个更安心的情绪支持空间")}</h2>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {items.map(([title, desc], i) => (
          <motion.article key={title} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} initial="hidden" animate="show" className="rounded-[2rem] border border-sage/20 p-6 shadow-soft" style={{ backgroundColor: style.card }}>
            {i === 0 && <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf2eb] text-sage"><Cloud className="h-7 w-7" strokeWidth={1.9} /><Smile className="absolute -bottom-0.5 left-1/2 h-3.5 w-3.5 -translate-x-1/2 text-coral" strokeWidth={2} /></div>}
            {i === 1 && <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf2eb]"><Handshake className="h-7 w-7 text-sage" strokeWidth={1.9} /></div>}
            {i === 2 && <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf2eb]"><HeartPulse className="h-7 w-7 text-coral" strokeWidth={1.9} /></div>}
            <h3 className="mt-5 font-heading text-2xl font-semibold text-clay">{title}</h3>
            <p className="mt-3 leading-relaxed text-clay/85">{desc}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function StoriesSection({ lang, style, compact }) {
  return (
    <section className={`mx-auto max-w-6xl px-6 sm:px-8 lg:px-10 ${compact ? "pt-8" : "pt-12"}`}>
      <article className="rounded-[2.2rem] border border-coral/35 p-8 shadow-soft sm:p-10" style={{ backgroundColor: style.card }}>
        <p className="font-heading text-3xl leading-snug text-clay">{txt(lang, "\"Rihea helped me understand my emotions without feeling judged. It felt like having a calm companion every day.\"", "“Rihea 让我更理解自己的情绪，而且没有被评判的压力，就像每天有个温柔陪伴者。”")}</p>
        <div className="mt-6 flex items-center gap-4"><div className="h-12 w-12 rounded-full bg-sage/25" /><div><p className="font-semibold text-clay">{txt(lang, "Mei, 28 weeks pregnant", "Mei，孕 28 周")}</p><p className="text-sm text-clay/80">{txt(lang, "User testimonial", "用户评价")}</p></div></div>
      </article>
    </section>
  );
}
function DashboardSection({ lang, style, compact }) {
  const [mood, setMood] = useState(2);
  const side = lang === "zh" ? ["概览", "情绪", "生理", "舒缓内容"] : ["Overview", "Mood", "Vitals", "Comfort Feed"];
  const labels = lang === "zh" ? ["压力很大", "有点低落", "比较平稳", "逐渐变好", "心情晴朗"] : ["Overwhelmed", "Low", "Steady", "Better", "Bright"];
  return (
    <section className={`mx-auto max-w-6xl px-6 sm:px-8 lg:px-10 ${compact ? "pt-8" : "pt-12"}`}>
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage/90">{txt(lang, "Main App Interface", "主应用界面")}</p>
      <h2 className="mt-2 font-heading text-3xl font-bold text-clay sm:text-4xl">{txt(lang, "User Dashboard", "用户仪表盘")}</h2>
      <div className="mt-8 overflow-hidden rounded-[2.4rem] border border-sage/20 shadow-soft" style={{ backgroundColor: style.panel }}>
        <div className="grid lg:grid-cols-[230px,1fr]">
          <aside className="border-b border-sage/20 p-6 lg:border-b-0 lg:border-r" style={{ backgroundColor: style.side }}>
            <p className="font-heading text-2xl font-bold text-sage">Rihea</p>
            <p className="text-sm text-clay/75">{txt(lang, "Your gentle support space", "你的温柔支持空间")}</p>
            <nav className="mt-5 space-y-2">
              {side.map((item, i) => (
                <button key={item} type="button" className={`flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold ${i === 0 ? "text-sage" : "text-clay/80 hover:bg-sage/10 hover:text-sage"}`} style={i === 0 ? { backgroundColor: style.tabBg } : undefined}>
                  {i === 0 && <LayoutDashboard className="h-4 w-4" />}
                  {i === 1 && <Smile className="h-4 w-4" />}
                  {i === 2 && <HeartPulse className="h-4 w-4" />}
                  {i === 3 && <BookOpen className="h-4 w-4" />}
                  {item}
                </button>
              ))}
            </nav>
          </aside>
          <div className={`p-6 sm:p-8 ${compact ? "space-y-4" : "space-y-6"}`}>
            <section className="rounded-[2rem] p-6" style={{ background: `linear-gradient(95deg, ${style.greetFrom}, #F5F5DC, ${style.greetTo})` }}>
              <h3 className="font-heading text-3xl font-bold text-clay">{txt(lang, "Good Morning, Yiting. You are in Week 24.", "早上好，Yiting。你现在处于孕 24 周。")}</h3>
              <p className="mt-2 text-clay/85">{txt(lang, "Today can be gentle. We will help you regulate, reflect, and recover in small steps.", "今天也可以很轻松。我们会帮助你用小步骤完成调节、复盘与恢复。")}</p>
            </section>
            <div className="grid gap-6 xl:grid-cols-[1.25fr,1fr]">
              <section className="rounded-[2rem] border border-sage/20 p-6" style={{ backgroundColor: style.card }}>
                <h3 className="font-heading text-2xl font-semibold text-clay">{txt(lang, "Mood Tracker", "情绪打卡")}</h3>
                <p className="mt-1 text-sm text-clay/80">{txt(lang, "Pick the emoji that feels closest right now.", "选择最符合你当下感受的表情。")}</p>
                <div className="mt-5 flex flex-wrap items-end gap-3">
                  {moodEmoji.map((emoji, i) => {
                    const on = i === mood;
                    return (
                      <motion.button key={`${emoji}-${i}`} type="button" onClick={() => setMood(i)} whileTap={{ scale: 0.95 }} animate={on ? { scale: 1.16, y: -6 } : { scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 380, damping: 14 }} className={`rounded-2xl border px-3 py-3 text-center ${on ? "border-coral/60 bg-coral/20 shadow-soft" : "border-sage/20 bg-[#fffaf2]"}`}>
                        <span className="block text-3xl leading-none">{emoji}</span>
                        <span className="mt-2 block text-xs font-semibold text-clay/80">{labels[i]}</span>
                      </motion.button>
                    );
                  })}
                </div>
                <p className="mt-4 rounded-2xl bg-sage/10 px-4 py-2 text-sm text-clay/85">{txt(lang, "Today you selected:", "你今天选择的是：")} <span className="font-semibold text-sage">{labels[mood]}</span></p>
              </section>
              <section className="rounded-[2rem] border border-sage/20 p-5" style={{ backgroundColor: style.card }}>
                <h3 className="font-heading text-2xl font-semibold text-clay">{txt(lang, "Physiological Data", "生理数据")}</h3>
                <div className="mt-4 space-y-4">
                  <SleepWave lang={lang} />
                  <StressRing lang={lang} />
                </div>
              </section>
            </div>
            <section className="rounded-[2rem] border border-sage/20 p-6" style={{ backgroundColor: style.card }}>
              <h3 className="font-heading text-2xl font-semibold text-clay">{txt(lang, "Today's Comfort", "今日舒缓")}</h3>
              <div className="mt-4 space-y-3">
                <motion.article whileHover={{ y: -2 }} className="flex flex-col gap-3 rounded-3xl border border-coral/35 bg-[#fffaf3] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold text-clay">{txt(lang, "3-Min Mindfulness Audio", "3 分钟正念音频")}</p>
                  <button type="button" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition hover:brightness-95" style={{ backgroundColor: style.primaryBg, color: style.primaryText }}><Play className="h-4 w-4" />{txt(lang, "Play", "播放")}</button>
                </motion.article>
                <motion.article whileHover={{ y: -2 }} className="rounded-3xl border border-sage/25 bg-[#fffaf3] p-4"><p className="font-semibold text-clay">{txt(lang, "Scientific Article: Why do you feel anxious?", "科学文章：为什么你会感到焦虑？")}</p></motion.article>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [section, setSection] = useState("home");
  const [lang, setLang] = useState("zh");
  const [mode, setMode] = useState("morandi");
  const [size, setSize] = useState("medium");
  const [motionOn, setMotionOn] = useState(true);
  const [compact, setCompact] = useState(false);
  const [contrast, setContrast] = useState(false);
  const [reminder, setReminder] = useState(true);
  const [sounds, setSounds] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const style = presets[mode];
  const nav = [["home", txt(lang, "Home", "首页")], ["features", txt(lang, "Features", "功能")], ["stories", txt(lang, "Stories", "用户故事")], ["dashboard", txt(lang, "Dashboard", "仪表盘")]];

  return (
    <MotionConfig reducedMotion={motionOn ? "never" : "always"}>
      <main className="min-h-screen pb-16 text-clay" style={{ background: style.bg, fontSize: `${size === "small" ? 15 : size === "large" ? 17.5 : 16}px`, filter: contrast ? "contrast(1.12) saturate(1.1)" : "none" }}>
        <header className="sticky top-0 z-40 border-b border-sage/15 backdrop-blur" style={{ backgroundColor: style.header }}>
          <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
            <motion.nav initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <button type="button" onClick={() => setSection("home")} className="font-heading text-2xl font-bold tracking-tight text-sage">Rihea</button>
              <div className="flex flex-wrap items-center gap-2 md:gap-3">{nav.map(([k, l]) => <button key={k} type="button" onClick={() => setSection(k)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${section === k ? "" : "text-clay/85 hover:bg-sage/10 hover:text-sage"}`} style={section === k ? { backgroundColor: style.tabBg, color: style.tabText } : undefined}>{l}</button>)}</div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setShowSettings(true)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sage/25 bg-[#fffaf2] text-clay transition hover:bg-sage/10" title={txt(lang, "Settings", "设置")}><Settings className="h-4 w-4" /></button>
                <button type="button" onClick={() => setSection("dashboard")} className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition hover:brightness-95" style={{ backgroundColor: style.primaryBg, color: style.primaryText }}>{txt(lang, "Open Dashboard", "打开仪表盘")}<ArrowRight className="h-4 w-4" /></button>
              </div>
            </motion.nav>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={`${section}-${lang}-${mode}-${compact}`} {...sectionAnim} transition={{ duration: 0.28 }}>
            {section === "home" && <HomeSection lang={lang} style={style} compact={compact} onStart={() => setSection("dashboard")} />}
            {section === "features" && <FeaturesSection lang={lang} style={style} compact={compact} />}
            {section === "stories" && <StoriesSection lang={lang} style={style} compact={compact} />}
            {section === "dashboard" && <DashboardSection lang={lang} style={style} compact={compact} />}
          </motion.div>
        </AnimatePresence>

        <footer className="mx-auto mt-8 max-w-6xl px-6 pb-8 pt-6 sm:px-8 lg:px-10">
          <div className="flex flex-col items-center justify-between gap-3 rounded-3xl border border-sage/20 px-5 py-4 text-sm text-clay/80 sm:flex-row" style={{ backgroundColor: style.card }}>
            <p>Rihea</p>
            <p>{txt(lang, "Bridging Clinical Psychology with Warm Companionship.", "把临床心理学和温暖陪伴连接在一起。")}</p>
          </div>
        </footer>
      </main>

      <AnimatePresence>
        {showSettings && (
          <>
            <motion.button type="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSettings(false)} className="fixed inset-0 z-40 bg-[#354138]/30 backdrop-blur-[2px]" />
            <motion.aside initial={{ x: 420, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 420, opacity: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }} className="fixed bottom-4 right-4 top-4 z-50 w-[min(94vw,390px)] overflow-y-auto rounded-[2rem] border border-sage/25 bg-[#faf7ef] p-5 shadow-soft">
              <div className="mb-4 flex items-start justify-between"><div><h3 className="font-heading text-2xl font-bold text-clay">{txt(lang, "Settings", "设置")}</h3><p className="mt-1 text-sm text-clay/75">{txt(lang, "Adjust language, style and common preferences.", "调整语言、风格和常用偏好。")}</p></div><button type="button" onClick={() => setShowSettings(false)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sage/25 bg-white text-clay transition hover:bg-sage/10"><X className="h-4 w-4" /></button></div>
              <div className="space-y-4">
                <section className="rounded-3xl border border-sage/20 bg-white/70 p-4"><p className="mb-3 text-sm font-semibold text-clay">{txt(lang, "Language", "语言")}</p><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setLang("zh")} className="rounded-2xl px-3 py-2 text-sm font-semibold" style={lang === "zh" ? { backgroundColor: style.tabBg, color: style.tabText } : { backgroundColor: "#fffaf2", color: "#6E7F75" }}>{txt(lang, "Chinese", "中文")}</button><button type="button" onClick={() => setLang("en")} className="rounded-2xl px-3 py-2 text-sm font-semibold" style={lang === "en" ? { backgroundColor: style.tabBg, color: style.tabText } : { backgroundColor: "#fffaf2", color: "#6E7F75" }}>{txt(lang, "English", "英文")}</button></div></section>
                <section className="rounded-3xl border border-sage/20 bg-white/70 p-4"><p className="mb-3 text-sm font-semibold text-clay">{txt(lang, "Visual Style", "视觉风格")}</p><div className="space-y-2">{[["morandi", txt(lang, "Morandi Calm", "莫兰迪柔和")], ["nature", txt(lang, "Forest Soft", "自然森林")], ["sunrise", txt(lang, "Warm Sunrise", "暖阳晨曦")]].map(([k, l]) => <button key={k} type="button" onClick={() => setMode(k)} className="w-full rounded-2xl px-3 py-2 text-left text-sm font-semibold" style={mode === k ? { backgroundColor: style.tabBg, color: style.tabText } : { backgroundColor: "#fffaf2", color: "#6E7F75" }}>{l}</button>)}</div></section>
                <section className="rounded-3xl border border-sage/20 bg-white/70 p-4"><p className="mb-3 text-sm font-semibold text-clay">{txt(lang, "Text Size", "字体大小")}</p><div className="grid grid-cols-3 gap-2">{[["small", txt(lang, "Small", "小")], ["medium", txt(lang, "Default", "默认")], ["large", txt(lang, "Large", "大")]].map(([k, l]) => <button key={k} type="button" onClick={() => setSize(k)} className="rounded-2xl px-2 py-2 text-xs font-semibold" style={size === k ? { backgroundColor: style.tabBg, color: style.tabText } : { backgroundColor: "#fffaf2", color: "#6E7F75" }}>{l}</button>)}</div></section>
                <section className="space-y-2 rounded-3xl border border-sage/20 bg-white/70 p-4"><ToggleRow label={txt(lang, "Animations", "动画效果")} on={motionOn} toggle={() => setMotionOn((v) => !v)} /><ToggleRow label={txt(lang, "Compact Layout", "紧凑布局")} on={compact} toggle={() => setCompact((v) => !v)} /><ToggleRow label={txt(lang, "High Contrast", "高对比度")} on={contrast} toggle={() => setContrast((v) => !v)} /><ToggleRow label={txt(lang, "Daily Reminder", "每日提醒")} on={reminder} toggle={() => setReminder((v) => !v)} /><ToggleRow label={txt(lang, "Button Sounds", "按钮音效")} on={sounds} toggle={() => setSounds((v) => !v)} /></section>
              </div>
              <div className="mt-5 flex items-center gap-2"><button type="button" onClick={() => { setLang("zh"); setMode("morandi"); setSize("medium"); setMotionOn(true); setCompact(false); setContrast(false); setReminder(true); setSounds(false); }} className="rounded-full border border-sage/25 bg-white px-4 py-2 text-sm font-semibold text-clay transition hover:bg-sage/10">{txt(lang, "Reset", "恢复默认")}</button><button type="button" onClick={() => setShowSettings(false)} className="rounded-full px-4 py-2 text-sm font-semibold transition hover:brightness-95" style={{ backgroundColor: style.primaryBg, color: style.primaryText }}>{txt(lang, "Close", "关闭")}</button></div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
