import { Suspense, lazy, memo, useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  CalendarCheck2,
  ChevronRight,
  HeartPulse,
  Moon,
  Play,
  X,
} from "lucide-react";
import Card from "../ui/Card";
import { txt } from "../../utils/txt";
import { calcCheckInStreak, toDateKey } from "../../utils/checkin";
import {
  createFetalMovementRecord,
  fetchFetalMovementRecords,
  fetchFetalMovementSummary,
  patchFetalMovementRecord,
} from "../../api/profile";

const FetalMovementPage = lazy(() => import("./FetalMovementPage"));
const WeeklyMoodChart = lazy(() => import("./WeeklyMoodChart"));
const FetalBondCard = lazy(() => import("./FetalBondCard"));

const moodEmoji = ["🌧️", "☁️", "🌤️", "🌸", "☀️"];

const parseWeekDay = (weekLabel) => {
  if (typeof weekLabel !== "string") return { week: 24, day: 3 };
  const match = /^(\d{1,2})\+([0-6])$/.exec(weekLabel.trim());
  if (!match) return { week: 24, day: 3 };
  return { week: Number(match[1]), day: Number(match[2]) };
};

const clampWeek = (week) => Math.min(42, Math.max(4, week));
const toWeekLabel = (week, day = 0) => `${clampWeek(week)}+${Math.min(6, Math.max(0, day))}`;


const dateLabel = (dateKey) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatShortDate = (dateKey, lang) => {
  const date = dateLabel(dateKey);
  return lang === "zh"
    ? `${date.getMonth() + 1}/${date.getDate()}`
    : `${date.toLocaleDateString("en-US", { month: "short" })} ${date.getDate()}`;
};


const StressRing = memo(function StressRing({ lang, style, mood }) {
  const stressValue = useMemo(() => {
    const stressByMood = [84, 68, 52, 36, 24];
    return stressByMood[mood] ?? 52;
  }, [mood]);
  const sleepValue = useMemo(() => {
    const sleepByMood = [58, 66, 74, 80, 86];
    return sleepByMood[mood] ?? 72;
  }, [mood]);
  const stressHigh = stressValue >= 70;
  const stressColor = stressHigh ? "#D89B6B" : "#95A99D";

  const ring = (value, color) => {
    const r = 35;
    const c = 2 * Math.PI * r;
    const p = c - (value / 100) * c;
    return { r, c, p, color };
  };

  const stressRing = ring(stressValue, stressColor);
  const sleepRing = ring(sleepValue, "#9CB0A3");

  return (
    <div className="grid grid-cols-2 gap-3 rounded-[1.5rem] border border-sage/20 bg-[#fffaf3] p-3">
      <div className="rounded-[1.25rem] bg-white/80 p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-clay/70">{txt(lang, "Did you sleep well enough?", "昨晚睡得还行吗")}</p>
          <Moon className="h-4 w-4 text-sage" />
        </div>
        <div className="mt-3 grid place-items-center">
          <svg viewBox="0 0 100 100" className="h-20 w-20">
            <circle cx="50" cy="50" r={sleepRing.r} stroke="rgba(156,176,163,.2)" strokeWidth="8" fill="none" />
            <circle
              cx="50"
              cy="50"
              r={sleepRing.r}
              stroke={sleepRing.color}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={sleepRing.c}
              strokeDashoffset={sleepRing.p}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <p className="mt-1 text-xs font-bold text-clay">{sleepValue}%</p>
        </div>
      </div>

      <div className="rounded-[1.25rem] bg-white/80 p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-clay/70">{txt(lang, "Is stress over your safe zone?", "今天压力有没有超线")}</p>
          <HeartPulse className="h-4 w-4 text-sage" />
        </div>
        <div className="mt-3 grid place-items-center">
          <svg viewBox="0 0 100 100" className="h-20 w-20">
            <circle cx="50" cy="50" r={stressRing.r} stroke="rgba(216,155,107,.2)" strokeWidth="8" fill="none" />
            <circle
              cx="50"
              cy="50"
              r={stressRing.r}
              stroke={stressRing.color}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={stressRing.c}
              strokeDashoffset={stressRing.p}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <p className="mt-1 text-xs font-bold text-clay">
            {stressValue}% {stressHigh ? txt(lang, "High", "偏高") : txt(lang, "Stable", "平稳")}
          </p>
        </div>
      </div>
    </div>
  );
});

const BreathingWidget = memo(function BreathingWidget({ lang, style, widgetId = "rihea-breathing-widget" }) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState("idle");

  useEffect(() => {
    const timers = [];
    const schedule = (fn, ms) => {
      const id = window.setTimeout(fn, ms);
      timers.push(id);
    };

    if (!isActive) {
      setPhase("idle");
      return () => timers.forEach((id) => window.clearTimeout(id));
    }

    const cycle = () => {
      setPhase("inhale");
      schedule(() => {
        setPhase("hold");
        schedule(() => {
          setPhase("exhale");
          schedule(cycle, 4000);
        }, 2000);
      }, 4000);
    };

    cycle();

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [isActive]);

  const phaseText =
    phase === "idle"
      ? txt(lang, "Tap to breathe", "点击开始深呼吸")
      : phase === "inhale"
        ? txt(lang, "Inhale deeply...", "缓缓吸气...")
        : phase === "hold"
          ? txt(lang, "Hold...", "屏息...")
          : txt(lang, "Exhale slowly...", "慢慢呼出...");

  return (
    <article
      id={widgetId}
      className="rounded-[1.5rem] border border-sage/20 p-4"
      style={{
        background: style.card,
        boxShadow: style.cardShadow,
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold text-clay/70">{txt(lang, "3-min to feel steadier", "3分钟让自己稳下来")}</p>
        <button
          type="button"
          onClick={() => setIsActive((value) => !value)}
          className="rounded-full px-2.5 py-1.5 text-xs font-semibold"
          style={{ backgroundColor: style.pillBg, color: style.pillText }}
        >
          {isActive ? txt(lang, "Stop", "停止") : txt(lang, "Start now", "现在开始")}
        </button>
      </div>

      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => setIsActive((value) => !value)}
          className="relative grid h-28 w-28 place-items-center rounded-full"
          aria-label={txt(lang, "Toggle breathing exercise", "切换呼吸练习")}
        >
          <motion.div
            className="absolute inset-0 rounded-full opacity-40"
            style={{ backgroundColor: style.primaryBg }}
            animate={
              phase === "idle"
                ? { scale: 1 }
                : phase === "inhale"
                  ? { scale: 1.5 }
                  : phase === "hold"
                    ? { scale: 1.5 }
                    : { scale: 1 }
            }
            transition={{ duration: phase === "hold" ? 2 : 4, ease: "easeInOut" }}
          />
          <div className="relative z-10 grid h-20 w-20 place-items-center rounded-full bg-white text-clay shadow-sm">
            {isActive ? <X className="h-5 w-5 text-clay/55" /> : <Play className="ml-0.5 h-5 w-5 text-sage" />}
          </div>
        </button>
        <p className="mt-4 h-6 font-heading text-base font-semibold text-sage">{phaseText}</p>
      </div>
    </article>
  );
});

function HomeTab({
  lang,
  style,
  motionEnabled = true,
  profileName,
  profile,
  checkIns,
  setCheckIns,
  focusRequest,
  onFocusConsumed,
}) {
  const [mood, setMood] = useState(2);
  const [selectedTag, setSelectedTag] = useState(null);
  const [note, setNote] = useState("");
  const [hydratedToday, setHydratedToday] = useState(false);
  const [savedTick, setSavedTick] = useState(0);
  const [displayWeek, setDisplayWeek] = useState(24);
  const [movementSummary, setMovementSummary] = useState(null);
  const [movementRecords, setMovementRecords] = useState([]);
  const [movementBusy, setMovementBusy] = useState(false);
  const [movementFeedback, setMovementFeedback] = useState("");
  const [savingMovementNoteId, setSavingMovementNoteId] = useState("");
  const [noteFeedback, setNoteFeedback] = useState("");
  const [showMovementPage, setShowMovementPage] = useState(false);
  const [belowFoldReady, setBelowFoldReady] = useState(false);

  const labels = useMemo(
    () =>
      lang === "zh"
        ? ["压力很大", "有点低落", "比较平稳", "逐渐变好", "心情晴朗"]
        : ["Overwhelmed", "Low", "Steady", "Better", "Bright"],
    [lang]
  );
  const tags = useMemo(
    () =>
      lang === "zh"
        ? ["身体不适", "睡眠不佳", "产检焦虑", "家人支持", "宝宝胎动"]
        : ["Discomfort", "Poor Sleep", "Checkup Anxiety", "Family", "Baby Movement"],
    [lang]
  );
  const dynamicComfort = useMemo(
    () => [
      { title: txt(lang, "3 minutes to stabilize high stress", "3分钟先把高压稳下来"), icon: <Play className="h-4 w-4" /> },
      { title: txt(lang, "First hold your low mood, then recover", "先接住低落，再慢慢回稳"), icon: <Play className="h-4 w-4" /> },
      { title: txt(lang, "Keep your steady state through today", "把平稳状态延续到今天"), icon: <Play className="h-4 w-4" /> },
      { title: txt(lang, "Keep getting better, not interrupted", "把变好的节奏继续下去"), icon: <Play className="h-4 w-4" /> },
      { title: txt(lang, "Capture one small good moment today", "留住今天一个小确幸"), icon: <BookOpen className="h-4 w-4" /> },
    ],
    [lang]
  );
  const weekLabel = profile?.pregnancyWeek || "24+3";
  const parsedWeek = useMemo(() => parseWeekDay(weekLabel), [weekLabel]);
  const displayWeekLabel = useMemo(() => toWeekLabel(displayWeek, parsedWeek.day), [displayWeek, parsedWeek.day]);
  const dueDateLabel = profile?.dueDate || "";

  const todayKey = toDateKey(new Date());
  const todayEntry = useMemo(() => checkIns.find((item) => item.date === todayKey), [checkIns, todayKey]);
  const streak = useMemo(() => calcCheckInStreak(checkIns), [checkIns]);
  const recentCheckIns = useMemo(() => checkIns.slice(0, 7), [checkIns]);
  const lastCheckIn = checkIns[0];

  const todayMoodLabel = todayEntry ? labels[todayEntry.mood] : txt(lang, "Not checked in yet", "今日未打卡");
  const pregnancyDay = parsedWeek.week * 7 + parsedWeek.day;
  const dueCountdownText = useMemo(() => {
    if (!dueDateLabel) return txt(lang, "No due date set", "未设置预产期");
    const due = dateLabel(dueDateLabel);
    const startDue = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
    const now = new Date();
    const startNow = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const diff = Math.round((startDue - startNow) / 86400000);
    if (diff > 0) return txt(lang, `${diff} days to due date`, `距离预产期 ${diff} 天`);
    if (diff === 0) return txt(lang, "Due date is today", "今天是预产期");
    return txt(lang, `${Math.abs(diff)} days past due date`, `已过预产期 ${Math.abs(diff)} 天`);
  }, [dueDateLabel, lang]);

  useEffect(() => {
    if (hydratedToday) return;
    if (todayEntry) {
      setMood(todayEntry.mood);
      setSelectedTag(todayEntry.tag || null);
      setNote(todayEntry.note || "");
    }
    setHydratedToday(true);
  }, [hydratedToday, todayEntry]);

  useEffect(() => {
    setDisplayWeek(clampWeek(parsedWeek.week));
  }, [parsedWeek.week]);

  useEffect(() => {
    let cancelled = false;
    const loadMovementData = async () => {
      try {
        const [summary, recordsData] = await Promise.all([fetchFetalMovementSummary(), fetchFetalMovementRecords(7)]);
        if (!cancelled) {
          setMovementSummary(summary);
          setMovementRecords(recordsData?.records || []);
        }
      } catch (error) {
        if (!cancelled) {
          setMovementSummary({ todayCount: 0, lastRecordedAt: null, status: "unknown" });
          setMovementRecords([]);
        }
      }
    };
    loadMovementData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!movementFeedback) return undefined;
    const timer = window.setTimeout(() => setMovementFeedback(""), 2200);
    return () => window.clearTimeout(timer);
  }, [movementFeedback]);

  useEffect(() => {
    if (!noteFeedback) return undefined;
    const timer = window.setTimeout(() => setNoteFeedback(""), 2200);
    return () => window.clearTimeout(timer);
  }, [noteFeedback]);

  useEffect(() => {
    if (belowFoldReady || showMovementPage) return undefined;
    let timeoutId = null;
    let idleId = null;
    const activate = () => setBelowFoldReady(true);
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(activate, { timeout: 650 });
    } else {
      timeoutId = window.setTimeout(activate, 220);
    }
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (idleId && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [belowFoldReady, showMovementPage]);

  const submitCheckIn = useCallback(() => {
    const entry = {
      date: todayKey,
      mood,
      tag: selectedTag || "",
      note: note.trim(),
      updatedAt: Date.now(),
    };

    setCheckIns((prev) => {
      const withoutToday = prev.filter((item) => item.date !== todayKey);
      return [entry, ...withoutToday].sort((a, b) => b.date.localeCompare(a.date));
    });
    setSavedTick(Date.now());
  }, [mood, note, selectedTag, setCheckIns, todayKey]);

  const handleRecordMovement = useCallback(async (source = "home_card") => {
    if (movementBusy) return;
    setMovementBusy(true);
    try {
      await createFetalMovementRecord({
        source,
        weekLabel: displayWeekLabel,
      });
      const [summary, recordsData] = await Promise.all([fetchFetalMovementSummary(), fetchFetalMovementRecords(7)]);
      setMovementSummary(summary);
      setMovementRecords(recordsData?.records || []);
      setMovementFeedback(txt(lang, "Saved", "已记录"));
    } catch (error) {
      setMovementFeedback(txt(lang, "Save failed", "记录失败"));
    } finally {
      setMovementBusy(false);
    }
  }, [displayWeekLabel, lang, movementBusy]);

  const handleSaveMovementNote = useCallback(async (recordId, noteValue) => {
    if (!recordId || savingMovementNoteId) return;
    setSavingMovementNoteId(recordId);
    try {
      await patchFetalMovementRecord(recordId, { note: noteValue.trim() });
      const recordsData = await fetchFetalMovementRecords(7);
      setMovementRecords(recordsData?.records || []);
      setNoteFeedback(txt(lang, "Note saved", "备注已保存"));
    } catch (error) {
      setNoteFeedback(txt(lang, "Save failed", "保存失败"));
    } finally {
      setSavingMovementNoteId("");
    }
  }, [lang, savingMovementNoteId]);

  const handleExportWeekly = useCallback(() => {
    const lines = [];
    lines.push(txt(lang, "Rihea Weekly Movement Report (Placeholder)", "Rihea 胎动周报（占位）"));
    lines.push(`${txt(lang, "Week", "孕周")}: ${weekLabel}`);
    lines.push(`${txt(lang, "Generated at", "生成时间")}: ${new Date().toLocaleString()}`);
    lines.push("----");
    const sorted = [...movementRecords].sort((a, b) => (a.recordedAt < b.recordedAt ? 1 : -1));
    if (sorted.length === 0) {
      lines.push(txt(lang, "No movement records in the selected period.", "选定周期暂无胎动记录。"));
    } else {
      sorted.forEach((item, index) => {
        lines.push(
          `${index + 1}. ${item.recordedAt} | ${txt(lang, "Source", "来源")}: ${item.source} | ${txt(lang, "Note", "备注")}: ${item.note || "-"}`
        );
      });
    }
    const content = lines.join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rihea-movement-weekly-${toDateKey(new Date())}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    setNoteFeedback(txt(lang, "Weekly report exported", "周报已导出"));
  }, [lang, movementRecords, weekLabel]);

  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const openMovementDetail = useCallback(() => setShowMovementPage(true), []);
  const closeMovementDetail = useCallback(() => setShowMovementPage(false), []);
  const goPrevWeek = useCallback(() => setDisplayWeek((prev) => clampWeek(prev - 1)), []);
  const goNextWeek = useCallback(() => setDisplayWeek((prev) => clampWeek(prev + 1)), []);

  useEffect(() => {
    if (!focusRequest?.targetId) return;
    let timer = null;
    const { targetId } = focusRequest;
    const runScroll = () => {
      scrollToSection(targetId);
      if (onFocusConsumed) onFocusConsumed();
    };
    if (targetId === "rihea-trend-entry" && !belowFoldReady) {
      setBelowFoldReady(true);
      timer = window.setTimeout(runScroll, 120);
    } else {
      timer = window.setTimeout(runScroll, 0);
    }
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [belowFoldReady, focusRequest, onFocusConsumed, scrollToSection]);

  if (showMovementPage) {
    return (
      <Suspense
        fallback={
          <Card style={style}>
            <p className="text-sm font-semibold text-clay/70">{txt(lang, "Loading movement details...", "正在加载胎动详情...")}</p>
          </Card>
        }
      >
        <FetalMovementPage
          lang={lang}
          style={style}
          weekLabel={weekLabel}
          movementSummary={movementSummary}
          movementRecords={movementRecords}
          recording={movementBusy}
          onQuickRecord={() => handleRecordMovement("detail_page")}
          onSaveNote={handleSaveMovementNote}
          savingNoteId={savingMovementNoteId}
          noteFeedback={noteFeedback}
          onExportWeekly={handleExportWeekly}
          onBack={closeMovementDetail}
        />
      </Suspense>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-5">
      <Card style={style}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between lg:grid lg:grid-cols-[minmax(0,1fr),440px] lg:items-stretch lg:gap-6">
          <div className="lg:flex lg:min-h-[370px] lg:flex-col lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay/58">
                {txt(lang, "Welcome back", "欢迎回来")}
              </p>
              <h2 className="mt-1 font-heading text-[2rem] font-bold leading-none text-clay sm:text-[2.2rem]">
                {profileName}
              </h2>
              <p className="mt-2 text-sm font-semibold text-clay/85">
                {txt(lang, "Steady first, and today will feel lighter.", "先把自己稳住，今天会好过很多。")}
              </p>
              <p className="mt-1 text-sm text-clay/78">
                {lang === "zh" ? `孕${weekLabel}` : `Week ${weekLabel}`}
                {dueDateLabel ? ` · ${txt(lang, "Due date", "预产期")} ${dueDateLabel}` : ""}
              </p>
            </div>

            <div className="mt-4 hidden lg:grid lg:grid-cols-3 lg:gap-3">
              <div className="rounded-2xl border border-sage/15 bg-[#fffaf3] px-3 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-clay/60">{txt(lang, "Today", "今天")}</p>
                <p className="mt-1 text-base font-bold text-clay">{todayMoodLabel}</p>
                <p className="mt-1 text-xs text-clay/62">{todayEntry ? txt(lang, "Already checked in", "已完成打卡") : txt(lang, "Tap check-in below", "可在下方快速打卡")}</p>
              </div>
              <div className="rounded-2xl border border-sage/15 bg-[#fffaf3] px-3 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-clay/60">{txt(lang, "Streak", "连续记录")}</p>
                <p className="mt-1 text-base font-bold text-clay">{streak} {txt(lang, "days", "天")}</p>
                <p className="mt-1 text-xs text-clay/62">{txt(lang, "Keep tiny steps daily", "每天一点点就很好")}</p>
              </div>
              <div className="rounded-2xl border border-sage/15 bg-[#fffaf3] px-3 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-clay/60">{txt(lang, "Progress", "孕期进度")}</p>
                <p className="mt-1 text-base font-bold text-clay">{txt(lang, `Day ${pregnancyDay}`, `第 ${pregnancyDay} 天`)}</p>
                <p className="mt-1 text-xs text-clay/62">{dueCountdownText}</p>
              </div>
            </div>

            <div className="mt-3 hidden lg:flex lg:flex-wrap lg:gap-2.5">
              <button
                type="button"
                onClick={() => scrollToSection("rihea-breathing-entry")}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition hover:brightness-95"
                style={{ backgroundColor: style.primaryBg, color: style.primaryText }}
              >
                <Play className="h-4 w-4" />
                {txt(lang, "Start 3-min reset", "先做3分钟稳态")}
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("rihea-checkin-entry")}
                className="inline-flex items-center gap-2 rounded-full border border-sage/20 bg-[#fffaf2] px-4 py-2 text-sm font-semibold text-clay transition hover:bg-sage/10"
              >
                <CalendarCheck2 className="h-4 w-4" />
                {todayEntry ? txt(lang, "Update check-in", "更新今日打卡") : txt(lang, "Do check-in", "完成今日打卡")}
              </button>
            </div>
          </div>
          <Suspense
            fallback={
              <div className="w-full sm:w-[360px] lg:w-full">
                <div className="rounded-[1.5rem] border border-sage/20 bg-[#fffaf3] p-3.5">
                  <p className="text-sm font-semibold text-clay/70">
                    {txt(lang, "Loading baby growth card...", "正在加载宝宝成长卡片...")}
                  </p>
                </div>
              </div>
            }
          >
            <FetalBondCard
              lang={lang}
              style={style}
              motionEnabled={motionEnabled}
              weekLabel={displayWeekLabel}
              currentWeekLabel={weekLabel}
              mood={mood}
              canPrev={displayWeek > 4}
              canNext={displayWeek < 42}
              onPrevWeek={goPrevWeek}
              onNextWeek={goNextWeek}
              movementSummary={movementSummary}
              movementBusy={movementBusy}
              onRecordMovement={handleRecordMovement}
              movementFeedback={movementFeedback}
              onOpenDetail={openMovementDetail}
            />
          </Suspense>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.25fr,1fr]">
        <div id="rihea-checkin-entry">
        <Card style={style}>
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-2xl font-bold text-clay">{txt(lang, "Say where you are in 30 seconds", "先花30秒，说出你现在的状态")}</h3>
            <CalendarCheck2 className="h-5 w-5 text-clay/70" />
          </div>
          <p className="mt-1 text-sm text-clay/78">
            {txt(lang, "Once logged, we'll tell you only the next best step for today.", "记录后，我们只给你今天最值得做的下一步。")}
          </p>

          <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
            <span
              className="rounded-full px-3 py-1.5"
              style={{ backgroundColor: todayEntry ? style.pillBg : "#F7EEE1", color: todayEntry ? style.pillText : "#9B755C" }}
            >
              {todayEntry ? txt(lang, "Checked in today", "今日已打卡") : txt(lang, "Not checked in today", "今日未打卡")}
            </span>
            <span className="rounded-full px-3 py-1.5" style={{ backgroundColor: style.pillBg, color: style.pillText }}>
              {txt(lang, "Streak", "连续天数")} {streak} {txt(lang, "days", "天")}
            </span>
            {lastCheckIn && (
              <span className="rounded-full px-3 py-1.5" style={{ backgroundColor: style.pillBg, color: style.pillText }}>
              {txt(lang, "Last check-in", "最近打卡")} {formatShortDate(lastCheckIn.date, lang)}
            </span>
          )}
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            {moodEmoji.map((emoji, index) => {
              const active = mood === index;
              return (
                <motion.button
                  key={`${emoji}-${index}`}
                  type="button"
                  onClick={() => {
                    setMood(index);
                    setSelectedTag(null);
                  }}
                  whileTap={{ scale: 0.95 }}
                  animate={active ? { scale: 1.12, y: -4 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 14 }}
                  className={`rounded-2xl border px-3 py-2 text-center ${
                    active ? "border-coral/60 bg-coral/20 shadow-soft" : "border-sage/20 bg-[#fffaf2]"
                  }`}
                >
                  <span className="block text-2xl leading-none">{emoji}</span>
                  <span className="mt-1 block text-xs font-semibold text-clay/80">{labels[index]}</span>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-clay/75">
              {txt(lang, "What's influencing your mood?", "是什么影响了你的心情？")}
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`rounded-full border px-3 py-2 text-sm transition ${
                    selectedTag === tag
                      ? "border-sage bg-sage/20 text-clay font-bold"
                      : "border-sage/20 bg-white text-clay/70 hover:bg-sage/10"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-clay/75">{txt(lang, "One-line note", "一句话记录")}</p>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value.slice(0, 80))}
              rows={2}
              placeholder={txt(lang, "What do you need most today?", "今天你最需要的支持是什么？")}
              className="w-full resize-none rounded-2xl border border-sage/20 bg-white/85 px-3 py-2 text-sm text-clay outline-none transition placeholder:text-clay/45 focus:border-sage/45"
            />
            <div className="mt-1 text-right text-xs text-clay/55">{note.length}/80</div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={submitCheckIn}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition hover:brightness-95"
              style={{ backgroundColor: style.primaryBg, color: style.primaryText }}
            >
              <CalendarCheck2 className="h-4 w-4" />
              {todayEntry ? txt(lang, "Update and refresh plan", "更新并刷新建议") : txt(lang, "Save and get suggestions", "保存并生成建议")}
            </button>
            {savedTick > 0 && (
              <span className="text-sm font-semibold text-sage">
                {txt(lang, "Saved. You're now more in control.", "已保存，你已经更可控了一步。")}
              </span>
            )}
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-clay/75">{txt(lang, "Recent check-ins", "最近打卡")}</p>
            {recentCheckIns.length === 0 ? (
              <p className="rounded-2xl bg-[#fffaf2] px-3 py-2 text-sm text-clay/70">
                {txt(lang, "No records yet. Start now and build your steady trend.", "还没有记录，现在开始建立你的稳定曲线。")}
              </p>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {recentCheckIns.map((item) => (
                  <div
                    key={`${item.date}-${item.updatedAt}`}
                    className="min-w-[96px] rounded-2xl border border-sage/20 bg-[#fffaf2] px-3 py-3 text-center"
                  >
                    <div className="text-lg leading-none">{moodEmoji[item.mood]}</div>
                    <div className="mt-1 text-sm font-semibold text-clay/75">{formatShortDate(item.date, lang)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
        </div>

        <div id="rihea-breathing-entry">
          <Card style={style}>
            <h3 className="font-heading text-2xl font-bold text-clay">{txt(lang, "Stabilize your body first", "现在先稳住身体信号")}</h3>
            <div className="mt-3 space-y-3">
              <StressRing lang={lang} style={style} mood={mood} />
              <BreathingWidget lang={lang} style={style} />
            </div>
          </Card>
        </div>
      </div>

      <div id="rihea-trend-entry">
        {belowFoldReady ? (
          <Suspense
            fallback={
              <Card style={style}>
                <div className="rounded-2xl border border-sage/15 bg-[#fffaf3] p-4">
                  <p className="text-sm font-semibold text-clay/72">
                    {txt(lang, "Loading trend module...", "正在加载趋势模块...")}
                  </p>
                </div>
              </Card>
            }
          >
            <WeeklyMoodChart lang={lang} style={style} checkIns={checkIns} motionEnabled={motionEnabled} />
          </Suspense>
        ) : (
          <Card style={style}>
            <div className="rounded-2xl border border-sage/15 bg-[#fffaf3] p-4">
              <p className="text-sm font-semibold text-clay/72">
                {txt(lang, "Preparing your weekly trend...", "正在准备你的情绪趋势...")}
              </p>
            </div>
          </Card>
        )}
      </div>

      <Card style={style}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-heading text-2xl font-bold text-clay">{txt(lang, "Your next best step", "接下来先做这一步")}</h3>
          <span className="rounded-full bg-coral/20 px-3 py-1 text-xs font-semibold text-clay">
            {txt(lang, "Based on today", "基于你今天的状态")}
          </span>
        </div>
        <div className="mt-3 space-y-3">
          <motion.article
            whileHover={{ x: 4 }}
            className="flex flex-col gap-3 rounded-3xl border border-coral/35 bg-[#fffaf3] p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold text-clay">{dynamicComfort[mood].title}</p>
              {selectedTag && (
                <p className="mt-1 text-xs text-clay/70">
                  {txt(lang, "Focus trigger:", "重点触发因素：")} {selectedTag}
                </p>
              )}
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition hover:brightness-95"
              style={{ backgroundColor: style.primaryBg, color: style.primaryText }}
            >
              {dynamicComfort[mood].icon}
              {txt(lang, "Start", "开始")}
            </button>
          </motion.article>
          <motion.article
            whileHover={{ x: 4 }}
            className="cursor-pointer rounded-3xl border border-sage/25 bg-[#fffaf3] p-4 transition hover:bg-sage/5"
          >
            <p className="font-semibold text-clay">
              {txt(lang, "Why anxiety happens: read and feel less self-blame", "为什么会焦虑：看完会少一些自责")}
            </p>
          </motion.article>
        </div>
      </Card>

      <Card style={style}>
        <button type="button" className="flex w-full items-center justify-between">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-clay">
            <span
              className="grid h-8 w-8 place-items-center rounded-full"
              style={{ backgroundColor: style.pillBg, color: style.pillText }}
            >
              <HeartPulse className="h-4 w-4" />
            </span>
            {txt(lang, "Stress keeps high? Book support in one tap", "情绪连续偏高？一键预约专业支持")}
          </span>
          <ChevronRight className="h-4 w-4 text-clay/60" />
        </button>
      </Card>
    </div>
  );
}

export default memo(HomeTab);
