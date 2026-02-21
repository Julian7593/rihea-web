import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { BookOpen, HeartPulse, Leaf, LogIn, LogOut, Settings, User, X } from "lucide-react";
import BrandLogo from "./components/brand/RiheaLogo";
import HomeTab from "./components/tabs/HomeTab";
import LaunchWelcome from "./components/onboarding/LaunchWelcome";
import NavButton from "./components/ui/NavButton";
import ToggleRow from "./components/ui/ToggleRow";
import { presets } from "./theme/presets";
import { readCheckIns, saveCheckIns } from "./utils/checkin";
import { calcPregnancyWeekByDueDate, resolvePregnancyProfile } from "./utils/pregnancy";
import { txt } from "./utils/txt";
import { patchProfileBasic } from "./api/profile";

const PROFILE_STORAGE_KEY = "rihea_profile_v2";
const THEME_STORAGE_KEY = "rihea_theme_v1";
const AUTH_STORAGE_KEY = "rihea_auth_v1";
const TEXT_SIZE_STORAGE_KEY = "rihea_text_size_v2";
const GLASS_TONE_STORAGE_KEY = "rihea_glass_tone_v1";
const PERF_MODE_STORAGE_KEY = "rihea_perf_mode_v1";

const CareTab = lazy(() => import("./components/tabs/CareTab"));
const LearnTab = lazy(() => import("./components/tabs/LearnTab"));
const ProfileTab = lazy(() => import("./components/tabs/ProfileTab"));
const ChatPanel = lazy(() => import("./components/chat/ChatPanel"));
const NameSetupDialog = lazy(() => import("./components/auth/NameSetupDialog"));
const SimpleLoginDialog = lazy(() => import("./components/auth/SimpleLoginDialog"));

const TEXT_SIZE_CONFIG = {
  small: { rootPx: 15, key: "small" },
  medium: { rootPx: 16, key: "medium" },
  large: { rootPx: 17, key: "large" },
  xlarge: { rootPx: 18, key: "xlarge" },
};

const getStoredProfile = () => {
  const fallback = {
    name: "",
    dueDate: "",
    pregnancyWeek: "",
    datingMethod: "dueDate",
    lmpDate: "",
    cycleLength: 28,
    ivfTransferDate: "",
    embryoAgeDays: 5,
    city: "",
    phone: "",
    agreed: false,
    completed: false,
  };

  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    const oldName = (window.localStorage.getItem("rihea_profile_name") || "").trim();
    if (!raw) {
      return {
        ...fallback,
        name: oldName,
        completed: Boolean(oldName),
      };
    }
    const parsed = JSON.parse(raw);
    const name = (parsed?.name || oldName || "").trim();
    const dueDate = typeof parsed?.dueDate === "string" ? parsed.dueDate : "";
    const pregnancyWeek = typeof parsed?.pregnancyWeek === "string" ? parsed.pregnancyWeek : "";
    const datingMethod = typeof parsed?.datingMethod === "string" ? parsed.datingMethod : "dueDate";
    const lmpDate = typeof parsed?.lmpDate === "string" ? parsed.lmpDate : "";
    const cycleLength = Number.isFinite(Number(parsed?.cycleLength)) ? Number(parsed.cycleLength) : 28;
    const ivfTransferDate = typeof parsed?.ivfTransferDate === "string" ? parsed.ivfTransferDate : "";
    const embryoAgeDays = Number(parsed?.embryoAgeDays) === 3 ? 3 : 5;
    const resolved = resolvePregnancyProfile({
      datingMethod,
      dueDate,
      lmpDate,
      cycleLength,
      ivfTransferDate,
      embryoAgeDays,
      pregnancyWeek,
    });
    return {
      ...fallback,
      ...parsed,
      name,
      dueDate: resolved.dueDate || dueDate,
      pregnancyWeek:
        resolved.pregnancyWeek || (resolved.dueDate ? calcPregnancyWeekByDueDate(resolved.dueDate) : ""),
      datingMethod,
      lmpDate,
      cycleLength,
      ivfTransferDate,
      embryoAgeDays,
      city: typeof parsed?.city === "string" ? parsed.city : "",
      phone: typeof parsed?.phone === "string" ? parsed.phone : "",
      agreed: Boolean(parsed?.agreed),
      completed: Boolean(parsed?.completed || name),
    };
  } catch {
    return fallback;
  }
};

const getStoredTheme = () => {
  const fallback = "morandiGlass";
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    return raw && presets[raw] ? raw : fallback;
  } catch {
    return fallback;
  }
};

const getStoredAuth = () => {
  const fallback = { loggedIn: false, account: "" };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    const loggedIn = Boolean(parsed?.loggedIn);
    const account = typeof parsed?.account === "string" ? parsed.account.trim() : "";
    if (!loggedIn || !account) return fallback;
    return { loggedIn: true, account };
  } catch {
    return fallback;
  }
};

const getStoredTextSize = () => {
  const fallback = "medium";
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(TEXT_SIZE_STORAGE_KEY);
    return raw && TEXT_SIZE_CONFIG[raw] ? raw : fallback;
  } catch {
    return fallback;
  }
};

const getStoredGlassTone = () => {
  const fallback = "rich";
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(GLASS_TONE_STORAGE_KEY);
    return raw === "clear" ? "clear" : fallback;
  } catch {
    return fallback;
  }
};

const detectLiteMode = () => {
  if (typeof window === "undefined") return false;
  const nav = window.navigator;
  const reduceMotion = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowCpu = typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4;
  const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4;
  const saveData = Boolean(nav.connection && nav.connection.saveData);
  return reduceMotion || saveData || lowCpu || lowMemory;
};

const getStoredPerfMode = () => {
  const fallback = detectLiteMode();
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PERF_MODE_STORAGE_KEY);
    if (raw === "lite") return true;
    if (raw === "full") return false;
    return fallback;
  } catch {
    return fallback;
  }
};

export default function App() {
  const initialProfile = useMemo(() => getStoredProfile(), []);
  const initialTheme = useMemo(() => getStoredTheme(), []);
  const initialAuth = useMemo(() => getStoredAuth(), []);
  const initialTextSize = useMemo(() => getStoredTextSize(), []);
  const initialGlassTone = useMemo(() => getStoredGlassTone(), []);
  const initialPerfLite = useMemo(() => getStoredPerfMode(), []);
  const [lang, setLang] = useState("zh");
  const [themeId, setThemeId] = useState(initialTheme);
  const [size, setSize] = useState(initialTextSize);
  const [glassTone, setGlassTone] = useState(initialGlassTone);
  const [perfLite, setPerfLite] = useState(initialPerfLite);
  const [motionOn, setMotionOn] = useState(true);
  const [compact, setCompact] = useState(false);
  const [contrast, setContrast] = useState(false);
  const [reminder, setReminder] = useState(true);
  const [sounds, setSounds] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showLaunchWelcome, setShowLaunchWelcome] = useState(true);
  const [tab, setTab] = useState("home");
  const [homeFocusRequest, setHomeFocusRequest] = useState(null);
  const [careCategory, setCareCategory] = useState("soothe");
  const [learnCategory, setLearnCategory] = useState("mind");
  const [chatPrefill, setChatPrefill] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [demoAiState, setDemoAiState] = useState("idle");
  const [profile, setProfile] = useState(initialProfile);
  const [showNameSetup, setShowNameSetup] = useState(false);
  const [auth, setAuth] = useState(initialAuth);
  const [checkIns, setCheckIns] = useState(() => readCheckIns());

  const chatInputRef = useRef(null);
  const settingsCloseRef = useRef(null);

  const style = presets[themeId] || presets.morandiGlass;
  const textSizePreset = TEXT_SIZE_CONFIG[size] || TEXT_SIZE_CONFIG.medium;
  const effectiveMotion = motionOn && !perfLite;
  const navItems = useMemo(
    () => [
      { id: "home", label: txt(lang, "Home", "首页"), Icon: Leaf },
      { id: "care", label: txt(lang, "Care", "关怀"), Icon: HeartPulse },
      { id: "learn", label: txt(lang, "Learn", "学习"), Icon: BookOpen },
      { id: "me", label: txt(lang, "Me", "我的"), Icon: User },
    ],
    [lang]
  );
  const [homeItem, careItem, learnItem, meItem] = navItems;

  useEffect(() => {
    if (!showChat) return;
    const timer = window.setTimeout(() => chatInputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [showChat]);

  useEffect(() => {
    if (!showSettings) return;
    const timer = window.setTimeout(() => settingsCloseRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [showSettings]);

  useEffect(() => {
    // Keep body lock for full-screen overlays only.
    const shouldLockBody = showChat || showNameSetup || showLogin || showLaunchWelcome;
    if (!shouldLockBody) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [showChat, showNameSetup, showLogin, showLaunchWelcome]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
      if (profile?.name?.trim()) {
        window.localStorage.setItem("rihea_profile_name", profile.name.trim());
      }
    } catch {
      // ignore storage errors
    }
  }, [profile]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeId);
    } catch {
      // ignore storage errors
    }
  }, [themeId]);

  useEffect(() => {
    saveCheckIns(checkIns);
  }, [checkIns]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(TEXT_SIZE_STORAGE_KEY, size);
    } catch {
      // ignore storage errors
    }
  }, [size]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(GLASS_TONE_STORAGE_KEY, glassTone);
    } catch {
      // ignore storage errors
    }
  }, [glassTone]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(PERF_MODE_STORAGE_KEY, perfLite ? "lite" : "full");
    } catch {
      // ignore storage errors
    }
  }, [perfLite]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    root.style.fontSize = `${textSizePreset.rootPx}px`;
    root.setAttribute("data-text-size", size);
  }, [size, textSizePreset.rootPx]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } catch {
      // ignore storage errors
    }
  }, [auth]);

  useEffect(() => {
    const onEsc = (event) => {
      if (event.key !== "Escape") return;
      if (showLaunchWelcome) {
        setShowLaunchWelcome(false);
        return;
      }
      if (showChat) {
        setShowChat(false);
        return;
      }
      if (showNameSetup && profile?.completed) {
        setShowNameSetup(false);
        return;
      }
      if (showLogin) {
        setShowLogin(false);
        return;
      }
      if (showSettings) {
        setShowSettings(false);
      }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [showChat, showSettings, showNameSetup, showLogin, showLaunchWelcome, profile?.completed]);

  const openChat = useCallback(() => {
    setShowSettings(false);
    setShowChat(true);
    setChatPrefill("");
  }, []);

  const openChatWithDraft = useCallback((nextDraft) => {
    setShowSettings(false);
    setShowChat(true);
    setChatPrefill(nextDraft || "");
  }, []);

  const openSettings = useCallback(() => {
    setShowChat(false);
    setShowSettings(true);
  }, []);

  const focusHomeSection = useCallback((targetId) => {
    setShowSettings(false);
    setShowChat(false);
    setTab("home");
    setHomeFocusRequest({ targetId, token: Date.now() });
  }, []);

  const skipLaunchWelcome = useCallback(() => {
    setShowLaunchWelcome(false);
  }, []);

  const startWelcomeFlow = useCallback(() => {
    setShowLaunchWelcome(false);
    focusHomeSection("rihea-breathing-entry");
  }, [focusHomeSection]);

  const handleCareAction = useCallback(({ category, item }) => {
    if (category === "soothe" || category === "body") {
      focusHomeSection("rihea-breathing-entry");
      return;
    }
    if (category === "partner") {
      openChatWithDraft(
        txt(
          lang,
          `Please help me craft a short support request for my partner based on "${item?.title || "today's need"}".`,
          `请帮我基于“${item?.title || "今天的需要"}”写一条给伴侣的支持请求，简短可执行。`
        )
      );
      return;
    }
    if (category === "pro") {
      setShowSettings(false);
      setShowChat(false);
      setTab("me");
      return;
    }
    focusHomeSection("rihea-checkin-entry");
  }, [focusHomeSection, lang, openChatWithDraft]);

  const handleLearnAction = useCallback(({ category }) => {
    if (category === "habit") {
      focusHomeSection("rihea-breathing-entry");
      return;
    }
    if (category === "mind") {
      focusHomeSection("rihea-checkin-entry");
      return;
    }
    if (category === "science") {
      focusHomeSection("rihea-trend-entry");
      return;
    }
    if (category === "faq") {
      setShowSettings(false);
      setShowChat(false);
      setTab("me");
      return;
    }
    focusHomeSection("rihea-checkin-entry");
  }, [focusHomeSection]);

  const openNameSetup = useCallback(() => {
    setShowSettings(false);
    setShowChat(false);
    if (!auth.loggedIn) {
      setShowLogin(true);
      return;
    }
    setShowNameSetup(true);
  }, [auth.loggedIn]);

  const openLogin = useCallback(() => {
    setShowSettings(false);
    setShowChat(false);
    setShowNameSetup(false);
    setShowLogin(true);
  }, []);

  const handleLoginSubmit = useCallback(({ account }) => {
    setAuth({ loggedIn: true, account });
    setShowLogin(false);
    if (!profile?.completed) {
      setShowNameSetup(true);
    }
  }, [profile?.completed]);

  const handleLogout = useCallback(() => {
    setAuth({ loggedIn: false, account: "" });
    setShowNameSetup(false);
    setShowChat(false);
    setShowSettings(false);
    if (tab === "me") {
      setTab("home");
    }
  }, [tab]);

  const toggleAiState = useCallback(() => {
    const states = ["idle", "listening", "speaking"];
    const nextIndex = (states.indexOf(demoAiState) + 1) % states.length;
    setDemoAiState(states[nextIndex]);
  }, [demoAiState]);

  const goHome = useCallback(() => setTab("home"), []);
  const goCare = useCallback(() => setTab("care"), []);
  const goLearn = useCallback(() => setTab("learn"), []);
  const goMe = useCallback(() => setTab("me"), []);
  const toggleMotion = useCallback(() => setMotionOn((v) => !v), []);
  const toggleCompact = useCallback(() => setCompact((v) => !v), []);
  const toggleContrast = useCallback(() => setContrast((v) => !v), []);
  const toggleReminder = useCallback(() => setReminder((v) => !v), []);
  const toggleSounds = useCallback(() => setSounds((v) => !v), []);

  const saveProfileName = useCallback(async (payload) => {
    const cleanName = payload.name.trim();
    const resolved = resolvePregnancyProfile(payload);
    const computedDueDate = resolved.dueDate || payload.dueDate || "";
    const computedWeek = resolved.pregnancyWeek || calcPregnancyWeekByDueDate(computedDueDate);
    const nextProfile = {
      ...profile,
      ...payload,
      name: cleanName,
      dueDate: computedDueDate,
      pregnancyWeek: computedWeek,
      completed: true,
    };
    setProfile(nextProfile);
    setShowNameSetup(false);
    try {
      await patchProfileBasic({
        name: cleanName,
        dueDate: computedDueDate,
        pregnancyWeek: computedWeek,
        city: payload.city || "",
        phone: payload.phone || "",
        language: lang,
        datingMethod: payload.datingMethod || "dueDate",
        lmpDate: payload.lmpDate || "",
        cycleLength: Number.isFinite(Number(payload.cycleLength)) ? Number(payload.cycleLength) : 28,
        ivfTransferDate: payload.ivfTransferDate || "",
        embryoAgeDays: Number(payload.embryoAgeDays) === 3 ? 3 : 5,
      });
    } catch {
      // keep local update when remote placeholder API is unavailable
    }
  }, [lang, profile]);

  return (
      <MotionConfig reducedMotion={effectiveMotion ? "never" : "always"}>
      <AnimatePresence>
        {showLaunchWelcome && (
          <LaunchWelcome lang={lang} onStart={startWelcomeFlow} onSkip={skipLaunchWelcome} />
        )}
      </AnimatePresence>

      <div className={`${glassTone === "clear" ? "glass-tone-clear" : "glass-tone-rich"} ${perfLite ? "perf-lite" : ""}`}>
      <main
        aria-hidden={showLaunchWelcome}
        className="min-h-screen px-3 pb-40 pt-4 text-clay sm:px-6 sm:pb-10 sm:py-6"
        style={{
          background: style.bg,
          filter: contrast ? "contrast(1.12) saturate(1.1)" : "none",
        }}
      >
        <div className="mx-auto max-w-6xl">
          <div
            className={`glass-surface glass-tier-soft rounded-[1.65rem] p-4 shadow-soft sm:rounded-[2.3rem] sm:p-5 lg:p-6 ${compact ? "space-y-3" : "space-y-4"}`}
            style={{
              "--glass-bg": style.panel,
              "--glass-line": style.line,
              "--glass-shadow": style.cardShadow,
              "--glass-fallback": "rgba(255, 252, 247, 0.92)",
              "--glass-accessible": "rgba(255, 252, 247, 0.98)",
            }}
          >
            <header className="flex items-center justify-between gap-2">
              <BrandLogo compact animated={effectiveMotion} aiState={demoAiState} onClick={toggleAiState} />
              <button
                type="button"
                onClick={openSettings}
                aria-label={txt(lang, "Open settings", "打开设置")}
                className="glass-control inline-flex h-10 w-10 items-center justify-center rounded-full text-clay transition"
                title={txt(lang, "Settings", "设置")}
              >
                <Settings className="h-4 w-4" />
              </button>
            </header>

            <div className="hidden grid-cols-5 items-end gap-2 rounded-[1.8rem] border border-sage/15 bg-[#fffdf8] px-2 pb-2 pt-3 lg:grid">
              <NavButton
                active={tab === homeItem.id}
                onClick={goHome}
                label={homeItem.label}
                Icon={homeItem.Icon}
                style={style}
              />
              <NavButton
                active={tab === careItem.id}
                onClick={goCare}
                label={careItem.label}
                Icon={careItem.Icon}
                style={style}
              />
              <button
                type="button"
                onClick={openChat}
                aria-label={txt(lang, "Open AI chat", "打开AI问答")}
                className="relative -mt-7 flex flex-col items-center"
              >
                <span
                  className="grid h-14 w-14 place-items-center rounded-full border-4 border-white text-xs font-extrabold text-white shadow-soft"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 25%, #ebfeff 0%, #a8e7f5 38%, #63cbe7 70%, #42b6dd 100%)",
                    boxShadow: "0 14px 26px -12px rgba(69,167,203,.7)",
                  }}
                >
                  AI
                </span>
                <span className="mt-1 block text-[11px] font-semibold text-clay">Rihea AI</span>
              </button>
              <NavButton
                active={tab === learnItem.id}
                onClick={goLearn}
                label={learnItem.label}
                Icon={learnItem.Icon}
                style={style}
              />
              <NavButton
                active={tab === meItem.id}
                onClick={goMe}
                label={meItem.label}
                Icon={meItem.Icon}
                style={style}
              />
            </div>

            <Suspense
              fallback={
                <section className="rounded-3xl border border-sage/20 bg-white/70 px-4 py-6 text-sm font-semibold text-clay/70">
                  {txt(lang, "Loading module...", "正在加载模块...")}
                </section>
              }
            >
              <AnimatePresence mode="wait">
                <motion.section
                  key={tab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  {tab === "home" && (
                    <HomeTab
                      lang={lang}
                      style={style}
                      motionEnabled={effectiveMotion}
                      profileName={profile.name || txt(lang, "Mama", "准妈妈")}
                      profile={profile}
                      checkIns={checkIns}
                      setCheckIns={setCheckIns}
                      focusRequest={homeFocusRequest}
                      onFocusConsumed={() => setHomeFocusRequest(null)}
                    />
                  )}
                  {tab === "care" && (
                    <CareTab
                      lang={lang}
                      style={style}
                      category={careCategory}
                      setCategory={setCareCategory}
                      onMainAction={handleCareAction}
                      onBackupAction={handleCareAction}
                    />
                  )}
                  {tab === "learn" && (
                    <LearnTab
                      lang={lang}
                      style={style}
                      category={learnCategory}
                      setCategory={setLearnCategory}
                      onMainAction={handleLearnAction}
                      onBackupAction={handleLearnAction}
                    />
                  )}
                  {tab === "me" && (
                    <ProfileTab
                      lang={lang}
                      style={style}
                      openSettings={openSettings}
                      reminder={reminder}
                      setReminder={setReminder}
                      sounds={sounds}
                      setSounds={setSounds}
                      profileName={profile.name || txt(lang, "Mama", "准妈妈")}
                      profile={profile}
                      onEditProfile={openNameSetup}
                      isLoggedIn={auth.loggedIn}
                      loginAccount={auth.account}
                      onLogin={openLogin}
                      onRelogin={openLogin}
                      onLogout={handleLogout}
                      checkIns={checkIns}
                    />
                  )}
                </motion.section>
              </AnimatePresence>
            </Suspense>
          </div>
        </div>
      </main>

      <nav
        aria-hidden={showLaunchWelcome}
        className="glass-surface glass-tier-solid fixed inset-x-3 bottom-[calc(0.65rem+env(safe-area-inset-bottom))] z-30 grid grid-cols-5 items-end overflow-visible rounded-[1.4rem] border px-2 pb-2 pt-3 shadow-soft lg:hidden"
        style={{
          "--glass-bg": style.navBg,
          "--glass-line": style.line,
          "--glass-shadow": "0 18px 34px -26px rgba(80, 98, 88, 0.42)",
          "--glass-fallback": "rgba(255, 250, 244, 0.95)",
          "--glass-accessible": "rgba(255, 252, 247, 0.98)",
        }}
      >
        <NavButton
          active={tab === homeItem.id}
          onClick={goHome}
          label={homeItem.label}
          Icon={homeItem.Icon}
          style={style}
        />
        <NavButton
          active={tab === careItem.id}
          onClick={goCare}
          label={careItem.label}
          Icon={careItem.Icon}
          style={style}
        />
        <button
          type="button"
          onClick={openChat}
          aria-label={txt(lang, "Open AI chat", "打开AI问答")}
          className="relative -mt-8 flex flex-col items-center"
        >
          <span
            className="grid h-14 w-14 place-items-center rounded-full border-4 border-white text-xs font-extrabold text-white shadow-soft"
            style={{
              background:
                "radial-gradient(circle at 30% 25%, #ebfeff 0%, #a8e7f5 38%, #63cbe7 70%, #42b6dd 100%)",
              boxShadow: "0 14px 26px -12px rgba(69,167,203,.7)",
            }}
          >
            AI
          </span>
          <span className="mt-1 block text-[11px] font-semibold text-clay">Rihea AI</span>
        </button>
        <NavButton
          active={tab === learnItem.id}
          onClick={goLearn}
          label={learnItem.label}
          Icon={learnItem.Icon}
          style={style}
        />
        <NavButton
          active={tab === meItem.id}
          onClick={goMe}
          label={meItem.label}
          Icon={meItem.Icon}
          style={style}
        />
      </nav>

      <AnimatePresence>
        {showChat && (
          <Suspense fallback={null}>
            <ChatPanel
              lang={lang}
              style={style}
              initialDraft={chatPrefill}
              messages={chatMessages}
              setMessages={setChatMessages}
              onClose={() => setShowChat(false)}
              inputRef={chatInputRef}
            />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogin && (
          <Suspense fallback={null}>
            <SimpleLoginDialog
              lang={lang}
              style={style}
              onClose={() => setShowLogin(false)}
              onSubmit={handleLoginSubmit}
            />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNameSetup && (
          <Suspense fallback={null}>
            <NameSetupDialog
              lang={lang}
              style={style}
              initialProfile={profile}
              canClose
              onClose={() => setShowNameSetup(false)}
              onSubmit={saveProfileName}
            />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <>
            <motion.button
              type="button"
              aria-label={txt(lang, "Close settings", "关闭设置")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 z-40 bg-[#354138]/30 backdrop-blur-[2px]"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pointer-events-none">
              <motion.aside
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-title"
                initial={{ opacity: 0, scale: 0.97, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.985, y: 8 }}
                transition={{ type: "spring", stiffness: 220, damping: 30, mass: 0.95 }}
                className="glass-surface glass-tier-solid pointer-events-auto w-full max-w-[620px] max-h-[88dvh] overflow-y-auto overscroll-y-contain rounded-[2rem] border border-sage/25 p-5 shadow-soft [touch-action:pan-y] [-webkit-overflow-scrolling:touch]"
                style={{
                  "--glass-bg": "linear-gradient(165deg, rgba(255,252,247,.82), rgba(247,241,232,.76))",
                  "--glass-line": style.line,
                  "--glass-shadow": "0 26px 44px -30px rgba(75, 95, 85, 0.46)",
                  "--glass-overflow": "auto",
                  "--glass-fallback": "rgba(250, 247, 239, 0.96)",
                  "--glass-accessible": "rgba(251, 248, 242, 0.99)",
                }}
              >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 id="settings-title" className="font-heading text-2xl font-bold text-clay">
                    {txt(lang, "Settings", "设置")}
                  </h3>
                  <p className="mt-1 text-sm text-clay/75">
                    {txt(lang, "Adjust language, style and preferences.", "调整语言、风格和偏好。")}
                  </p>
                </div>
                <button
                  ref={settingsCloseRef}
                  type="button"
                  onClick={() => setShowSettings(false)}
                  aria-label={txt(lang, "Close settings panel", "关闭设置面板")}
                  className="glass-control inline-flex h-9 w-9 items-center justify-center rounded-full text-clay transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
<section className="glass-subcard rounded-3xl p-4">
                  <p className="mb-3 text-sm font-semibold text-clay">{txt(lang, "Account", "账户")}</p>
                  <div className="space-y-2">
                    {auth.loggedIn ? (
                      <>
                        <div className="flex items-center justify-between rounded-2xl border border-sage/20 bg-[#fffaf2] px-3 py-2 text-sm font-semibold text-clay">
                          <span>{txt(lang, "Signed in as", "当前已登录")}</span>
                          <span className="text-clay/65">{auth.account}</span>
                        </div>
                        <button
                          type="button"
                          onClick={openNameSetup}
                          className="flex w-full items-center justify-between rounded-2xl border border-sage/20 bg-[#fffaf2] px-3 py-2 text-left text-sm font-semibold text-clay transition hover:bg-sage/10"
                        >
                          <span>{txt(lang, "Edit profile", "编辑资料")}</span>
                          <span className="text-clay/65">{profile.name || txt(lang, "Not set", "未设置")}</span>
                        </button>
                        <button
                          type="button"
                          onClick={openLogin}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-sage/20 bg-[#fffaf2] px-3 py-2 text-sm font-semibold text-clay transition hover:bg-sage/10"
                        >
                          <LogIn className="h-4 w-4" />
                          {txt(lang, "Re-sign in", "重新登录")}
                        </button>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#e8c5b4] bg-[#fff5ef] px-3 py-2 text-sm font-semibold text-[#A35E38] transition hover:bg-[#ffece2]"
                        >
                          <LogOut className="h-4 w-4" />
                          {txt(lang, "Sign out", "退出登录")}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={openLogin}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-sage/20 bg-[#fffaf2] px-3 py-2 text-sm font-semibold text-clay transition hover:bg-sage/10"
                      >
                        <LogIn className="h-4 w-4" />
                        {txt(lang, "Sign in", "登录")}
                      </button>
                    )}
                  </div>
                </section>

<section className="glass-subcard rounded-3xl p-4">
                  <p className="mb-3 text-sm font-semibold text-clay">{txt(lang, "Language", "语言")}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLang("zh")}
                      className="rounded-2xl px-3 py-2 text-sm font-semibold"
                      style={
                        lang === "zh"
                          ? { backgroundColor: style.tabBg, color: style.tabText }
                          : { backgroundColor: "#fffaf2", color: "#6E7F75" }
                      }
                    >
                      {txt(lang, "Chinese", "中文")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLang("en")}
                      className="rounded-2xl px-3 py-2 text-sm font-semibold"
                      style={
                        lang === "en"
                          ? { backgroundColor: style.tabBg, color: style.tabText }
                          : { backgroundColor: "#fffaf2", color: "#6E7F75" }
                      }
                    >
                      {txt(lang, "English", "英文")}
                    </button>
                  </div>
                </section>

<section className="glass-subcard rounded-3xl p-4">
                  <p className="mb-3 text-sm font-semibold text-clay">{txt(lang, "Theme Color", "主题配色")}</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => setThemeId("morandiGlass")}
                      className="rounded-2xl px-3 py-2 text-sm font-semibold"
                      style={
                        themeId === "morandiGlass"
                          ? { backgroundColor: style.tabBg, color: style.tabText }
                          : { backgroundColor: "#fffaf2", color: "#6E7F75" }
                      }
                    >
                      {txt(lang, "Morandi Glass", "莫兰迪轻玻璃")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setThemeId("morandiApricot")}
                      className="rounded-2xl px-3 py-2 text-sm font-semibold"
                      style={
                        themeId === "morandiApricot"
                          ? { backgroundColor: style.tabBg, color: style.tabText }
                          : { backgroundColor: "#fffaf2", color: "#6E7F75" }
                      }
                    >
                      {txt(lang, "Warm Serenity", "暖雾米杏")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setThemeId("forestCanopy")}
                      className="rounded-2xl px-3 py-2 text-sm font-semibold"
                      style={
                        themeId === "forestCanopy"
                          ? { backgroundColor: style.tabBg, color: style.tabText }
                          : { backgroundColor: "#fffaf2", color: "#6E7F75" }
                      }
                    >
                      {txt(lang, "Forest Canopy", "深林苔绿")}
                    </button>
                  </div>
                  <div className="mt-2 rounded-2xl bg-[#fffaf2] px-3 py-2 text-xs text-clay/75">
                    {txt(
                      lang,
                      "Multiple palettes are enabled for visual comparison.",
                      "已启用多款主题，方便你对比视觉效果。"
                    )}
                  </div>
                </section>

<section className="glass-subcard rounded-3xl p-4">
                  <p className="mb-3 text-sm font-semibold text-clay">{txt(lang, "Glass Texture", "玻璃质感")}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGlassTone("rich")}
                      className="glass-control rounded-2xl px-3 py-2 text-sm font-semibold"
                      style={
                        glassTone === "rich"
                          ? { backgroundColor: style.tabBg, color: style.tabText, borderColor: style.line }
                          : { color: "#6E7F75" }
                      }
                    >
                      {txt(lang, "Premium Glass", "高级玻璃")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setGlassTone("clear")}
                      className="glass-control rounded-2xl px-3 py-2 text-sm font-semibold"
                      style={
                        glassTone === "clear"
                          ? { backgroundColor: style.tabBg, color: style.tabText, borderColor: style.line }
                          : { color: "#6E7F75" }
                      }
                    >
                      {txt(lang, "Business Clear", "商务清晰")}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-clay/70">
                    {txt(
                      lang,
                      "Premium keeps richer glow; Clear improves reading focus.",
                      "高级玻璃更有氛围感；商务清晰更利于阅读。"
                    )}
                  </p>
                </section>

<section className="glass-subcard rounded-3xl p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-clay">{txt(lang, "Text Size", "字号大小")}</p>
                    <span className="rounded-full bg-[#fffaf2] px-2.5 py-1 text-xs font-semibold text-clay/75">
                      {txt(lang, "Current", "当前")} {textSizePreset.rootPx}px
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      ["small", txt(lang, "Small", "小"), "A-"],
                      ["medium", txt(lang, "Medium", "中"), "A"],
                      ["large", txt(lang, "Large", "大"), "A+"],
                      ["xlarge", txt(lang, "Extra Large", "特大"), "A++"],
                    ].map(([value, label, demo]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSize(value)}
                        className="flex items-center justify-between rounded-2xl px-3 py-2 text-sm font-semibold"
                        style={
                          size === value
                            ? { backgroundColor: style.tabBg, color: style.tabText }
                            : { backgroundColor: "#fffaf2", color: "#6E7F75" }
                        }
                      >
                        <span>{label}</span>
                        <span className="text-xs font-bold">{demo}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-clay/70">
                    {txt(
                      lang,
                      "Applied globally and remembered for your next visit.",
                      "会全局生效并自动记忆，下次打开仍保持此字号。"
                    )}
                  </p>
                  <div className="mt-2 rounded-2xl bg-[#fffaf2] px-3 py-2">
                    <p className="text-sm font-semibold text-clay">
                      {txt(
                        lang,
                        "Preview: calmer reading, less visual strain.",
                        "预览：阅读更轻松，视觉负担更低。"
                      )}
                    </p>
                  </div>
                </section>

<section className="glass-subcard space-y-2 rounded-3xl p-4">
                  <ToggleRow label={txt(lang, "Performance Mode", "高性能模式")} on={perfLite} toggle={() => setPerfLite((v) => !v)} />
                  <ToggleRow label={txt(lang, "Animations", "动画效果")} on={motionOn} toggle={toggleMotion} />
                  <ToggleRow label={txt(lang, "Compact Layout", "紧凑布局")} on={compact} toggle={toggleCompact} />
                  <ToggleRow label={txt(lang, "High Contrast", "高对比度")} on={contrast} toggle={toggleContrast} />
                  <ToggleRow label={txt(lang, "Daily Reminder", "每日提醒")} on={reminder} toggle={toggleReminder} />
                  <ToggleRow label={txt(lang, "Button Sounds", "按钮音效")} on={sounds} toggle={toggleSounds} />
                </section>
              </div>
              </motion.aside>
            </div>
          </>
        )}
      </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
