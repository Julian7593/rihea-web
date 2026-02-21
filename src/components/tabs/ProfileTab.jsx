import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  Clock3,
  Download,
  FileHeart,
  HeartHandshake,
  LogIn,
  LogOut,
  Phone,
  ShieldCheck,
  Siren,
  Stethoscope,
  UserRound,
  Volume2,
} from "lucide-react";
import Card from "../ui/Card";
import ToggleRow from "../ui/ToggleRow";
import { txt } from "../../utils/txt";
import { calcCheckInStreak } from "../../utils/checkin";
import {
  fetchCounselingSlots,
  fetchEmergencyContacts,
  fetchHelpCenter,
  fetchPrivacySettings,
  fetchProfileOverview,
  fetchRecordSummary,
  patchPrivacySettings,
} from "../../api/profile";

const moodEmoji = ["🌧️", "☁️", "🌤️", "🌸", "☀️"];

const formatDateShort = (dateText, lang) => {
  if (!dateText) return "-";
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return dateText;
  if (lang === "zh") {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

function SettingRow({ label, desc, Icon, onClick, style, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start justify-between gap-3 rounded-2xl border px-3 py-3 text-left transition ${
        danger ? "border-[#e8c5b4] bg-[#fff5ef] hover:bg-[#ffece2]" : "border-sage/20 bg-[#fffaf2] hover:bg-sage/10"
      }`}
    >
      <span className="flex min-w-0 items-start gap-3">
        <span
          className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full"
          style={{
            backgroundColor: danger ? "rgba(216,155,107,.2)" : style.pillBg,
            color: danger ? "#B36E46" : style.pillText,
          }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className={`block text-sm font-semibold ${danger ? "text-[#A35E38]" : "text-clay"}`}>{label}</span>
          {desc && <span className="mt-1 block text-xs text-clay/72">{desc}</span>}
        </span>
      </span>
      <ChevronRight className={`mt-1 h-4 w-4 shrink-0 ${danger ? "text-[#BC7A53]" : "text-clay/55"}`} />
    </button>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div>
      <h3 className="font-heading text-2xl font-bold text-clay">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-clay/78">{subtitle}</p>}
    </div>
  );
}

export default function ProfileTab({
  lang,
  style,
  openSettings,
  reminder,
  setReminder,
  sounds,
  setSounds,
  profileName,
  profile,
  onEditProfile,
  isLoggedIn = false,
  loginAccount = "",
  onLogin,
  onRelogin = onLogin,
  onLogout,
  checkIns = [],
}) {
  const [partnerSync, setPartnerSync] = useState(true);
  const [privateMode, setPrivateMode] = useState(false);
  const [shareForResearch, setShareForResearch] = useState(false);
  const [activePage, setActivePage] = useState(null);

  const [profileOverview, setProfileOverview] = useState(null);
  const [recordSummary, setRecordSummary] = useState(null);
  const [counselingSlots, setCounselingSlots] = useState([]);
  const [helpCenter, setHelpCenter] = useState({ version: "v1.0.0", faqs: [] });
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  const normalizedCheckIns = Array.isArray(checkIns) ? checkIns : [];
  const checkInStreak = useMemo(() => calcCheckInStreak(normalizedCheckIns), [normalizedCheckIns]);
  const latestCheckIn = normalizedCheckIns[0];

  const monthCompletionsFallback = useMemo(() => {
    const monthKey = new Date().toISOString().slice(0, 7);
    return normalizedCheckIns.filter((item) => item.date?.slice(0, 7) === monthKey).length;
  }, [normalizedCheckIns]);

  const overview = useMemo(() => {
    const progress = Number.isFinite(profileOverview?.progress) ? profileOverview.progress : 61;
    return {
      name: profile?.name || profileOverview?.name || profileName,
      pregnancyWeek: profile?.pregnancyWeek || profileOverview?.pregnancyWeek || "24+3",
      progress,
      dueDate: profile?.dueDate || profileOverview?.dueDate || "2026-06-08",
      city: profile?.city || profileOverview?.city || "",
      phone: profile?.phone || profileOverview?.phone || "",
      riskLevel: profileOverview?.riskLevel || "low",
    };
  }, [profileOverview, profileName, profile]);

  const dueInDays = useMemo(() => {
    const dueDate = new Date(overview.dueDate);
    if (Number.isNaN(dueDate.getTime())) return 111;
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).getTime();
    return Math.max(0, Math.ceil((due - start) / 86400000));
  }, [overview.dueDate]);

  useEffect(() => {
    let canceled = false;

    const bootstrap = async () => {
      try {
        const [overviewData, privacyData] = await Promise.all([fetchProfileOverview(), fetchPrivacySettings()]);
        if (canceled) return;
        setProfileOverview(overviewData);
        setPartnerSync(Boolean(overviewData?.partnerSync));
        setPrivateMode(Boolean(privacyData?.privateMode));
        setShareForResearch(Boolean(privacyData?.shareForResearch));
      } catch {
        // keep local fallback values
      }
    };

    bootstrap();
    return () => {
      canceled = true;
    };
  }, []);

  useEffect(() => {
    if (!profile?.name?.trim()) return;
    setProfileOverview((prev) =>
      prev
        ? {
            ...prev,
            name: profile.name.trim(),
            dueDate: profile.dueDate || prev.dueDate,
            pregnancyWeek: profile.pregnancyWeek || prev.pregnancyWeek,
            city: profile.city || prev.city || "",
            phone: profile.phone || prev.phone || "",
          }
        : prev
    );
  }, [profile]);

  useEffect(() => {
    if (!activePage) return;
    let canceled = false;

    const loadPageData = async () => {
      setPageLoading(true);
      setPageError("");
      try {
        if (activePage === "profile") {
          const data = await fetchProfileOverview();
          if (canceled) return;
          setProfileOverview(data);
          setPartnerSync(Boolean(data?.partnerSync));
        }

        if (activePage === "record") {
          const data = await fetchRecordSummary(normalizedCheckIns);
          if (canceled) return;
          setRecordSummary(data);
        }

        if (activePage === "privacy") {
          const data = await fetchPrivacySettings();
          if (canceled) return;
          setPrivateMode(Boolean(data?.privateMode));
          setShareForResearch(Boolean(data?.shareForResearch));
        }

        if (activePage === "counsel") {
          const data = await fetchCounselingSlots();
          if (canceled) return;
          setCounselingSlots(Array.isArray(data?.slots) ? data.slots : []);
        }

        if (activePage === "help") {
          const data = await fetchHelpCenter();
          if (canceled) return;
          setHelpCenter({
            version: data?.version || "v1.0.0",
            faqs: Array.isArray(data?.faqs) ? data.faqs : [],
          });
        }

        if (activePage === "urgent") {
          const data = await fetchEmergencyContacts();
          if (canceled) return;
          setEmergencyContacts(Array.isArray(data?.contacts) ? data.contacts : []);
        }
      } catch (error) {
        if (canceled) return;
        setPageError(error?.message || txt(lang, "Failed to load page data.", "页面数据加载失败。"));
      } finally {
        if (!canceled) {
          setPageLoading(false);
        }
      }
    };

    loadPageData();

    return () => {
      canceled = true;
    };
  }, [activePage, normalizedCheckIns, lang]);

  const updatePrivacyValue = async (field, nextValue) => {
    const prevPrivateMode = privateMode;
    const prevShareForResearch = shareForResearch;

    if (field === "privateMode") setPrivateMode(nextValue);
    if (field === "shareForResearch") setShareForResearch(nextValue);

    setPageError("");

    try {
      await patchPrivacySettings({ [field]: nextValue });
    } catch (error) {
      setPrivateMode(prevPrivateMode);
      setShareForResearch(prevShareForResearch);
      setPageError(error?.message || txt(lang, "Failed to save privacy settings.", "保存隐私设置失败。"));
    }
  };

  const profileRows = useMemo(
    () => [
      {
        key: "profile",
        label: txt(lang, "Personal information", "个人资料"),
        desc: txt(lang, "Name, due date and basic profile", "姓名、预产期和基础资料"),
        Icon: UserRound,
      },
      {
        key: "record",
        label: txt(lang, "Health records", "健康档案"),
        desc: txt(lang, "Pregnancy checks and mood history", "产检记录与情绪历史"),
        Icon: FileHeart,
      },
      {
        key: "privacy",
        label: txt(lang, "Security and privacy", "安全与隐私"),
        desc: txt(lang, "Password, permissions and data policy", "密码、权限与数据策略"),
        Icon: ShieldCheck,
      },
    ],
    [lang]
  );

  const supportRows = useMemo(
    () => [
      {
        key: "counsel",
        label: txt(lang, "Book professional support", "预约专业支持"),
        desc: txt(lang, "Clinical psychologist and counselor slots", "心理咨询师与临床支持时段"),
        Icon: Stethoscope,
      },
      {
        key: "help",
        label: txt(lang, "Help center and feedback", "帮助中心与反馈"),
        desc: txt(lang, "FAQ, report issue and feature request", "常见问题、问题反馈与功能建议"),
        Icon: CircleHelp,
      },
      {
        key: "urgent",
        label: txt(lang, "Urgent support contacts", "紧急支持联系人"),
        desc: txt(lang, "Immediate support when emotional risk rises", "情绪风险升高时快速联系支持"),
        Icon: Siren,
        danger: true,
      },
    ],
    [lang]
  );

  const pageMeta = useMemo(() => {
    const combined = [...profileRows, ...supportRows];
    return Object.fromEntries(combined.map((item) => [item.key, item]));
  }, [profileRows, supportRows]);

  const recordMonthCompletions = recordSummary?.monthCompletions ?? monthCompletionsFallback;
  const recordComfortRate = recordSummary?.comfortDoneRate ?? Math.min(95, 58 + recordMonthCompletions * 2);
  const recordLatestMood = recordSummary?.latestMoodIndex;
  const latestMoodIcon =
    Number.isInteger(recordLatestMood) && recordLatestMood >= 0 && recordLatestMood <= 4
      ? moodEmoji[recordLatestMood]
      : latestCheckIn
        ? moodEmoji[latestCheckIn.mood]
        : "-";

  if (activePage) {
    const page = pageMeta[activePage];

    return (
      <div className="space-y-4">
        <Card style={style}>
          <button
            type="button"
            onClick={() => setActivePage(null)}
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-sage/20 bg-[#fffaf2] px-3 py-1.5 text-sm font-semibold text-clay transition hover:bg-sage/10"
          >
            <ArrowLeft className="h-4 w-4" />
            {txt(lang, "Back", "返回")}
          </button>
          <SectionTitle title={page?.label || ""} subtitle={page?.desc || ""} />
          {pageLoading && (
            <p className="mt-3 rounded-xl bg-[#fffaf2] px-3 py-2 text-sm text-clay/75">
              {txt(lang, "Loading latest data...", "正在加载最新数据...")}
            </p>
          )}
          {pageError && (
            <p className="mt-3 rounded-xl border border-[#e8c5b4] bg-[#fff5ef] px-3 py-2 text-sm text-[#A35E38]">{pageError}</p>
          )}
        </Card>

        {activePage === "profile" && (
          <Card style={style}>
            <SectionTitle
              title={txt(lang, "Core profile", "基础资料")}
              subtitle={txt(lang, "Keep this up to date for better recommendations.", "保持最新资料以获得更精准推荐。")}
            />
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-sage/20 bg-[#fffaf2] px-3 py-3 text-sm text-clay">
                <p className="text-xs text-clay/65">{txt(lang, "Name", "姓名")}</p>
                <p className="mt-1 font-semibold">{overview.name}</p>
              </div>
              <div className="rounded-2xl border border-sage/20 bg-[#fffaf2] px-3 py-3 text-sm text-clay">
                <p className="text-xs text-clay/65">{txt(lang, "Pregnancy week", "孕周")}</p>
                <p className="mt-1 font-semibold">{overview.pregnancyWeek}</p>
              </div>
              <div className="rounded-2xl border border-sage/20 bg-[#fffaf2] px-3 py-3 text-sm text-clay">
                <p className="text-xs text-clay/65">{txt(lang, "Due date", "预产期")}</p>
                <p className="mt-1 font-semibold">{overview.dueDate}</p>
              </div>
              <div className="rounded-2xl border border-sage/20 bg-[#fffaf2] px-3 py-3 text-sm text-clay">
                <p className="text-xs text-clay/65">{txt(lang, "Partner sync", "伴侣同步")}</p>
                <p className="mt-1 font-semibold">{partnerSync ? txt(lang, "Enabled", "已开启") : txt(lang, "Disabled", "已关闭")}</p>
              </div>
              <div className="rounded-2xl border border-sage/20 bg-[#fffaf2] px-3 py-3 text-sm text-clay">
                <p className="text-xs text-clay/65">{txt(lang, "City", "所在城市")}</p>
                <p className="mt-1 font-semibold">{overview.city || txt(lang, "Not set", "未设置")}</p>
              </div>
              <div className="rounded-2xl border border-sage/20 bg-[#fffaf2] px-3 py-3 text-sm text-clay">
                <p className="text-xs text-clay/65">{txt(lang, "Phone", "手机号")}</p>
                <p className="mt-1 font-semibold">{overview.phone || txt(lang, "Not set", "未设置")}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onEditProfile}
              className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition hover:brightness-95"
              style={{ backgroundColor: style.primaryBg, color: style.primaryText }}
            >
              <UserRound className="h-4 w-4" />
              {txt(lang, "Edit login profile", "编辑登录资料")}
            </button>
          </Card>
        )}

        {activePage === "record" && (
          <Card style={style}>
            <SectionTitle
              title={txt(lang, "Mood and body records", "情绪与身体记录")}
              subtitle={txt(lang, "Overview of your latest check-ins and trends.", "查看你近期打卡和趋势概览。")}
            />
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-sage/20 bg-[#fffaf2] p-3 text-center">
                <p className="text-xs text-clay/70">{txt(lang, "Check-in streak", "连续打卡")}</p>
                <p className="mt-1 font-heading text-xl font-bold text-clay">{checkInStreak}</p>
              </div>
              <div className="rounded-2xl border border-sage/20 bg-[#fffaf2] p-3 text-center">
                <p className="text-xs text-clay/70">{txt(lang, "This month", "本月记录")}</p>
                <p className="mt-1 font-heading text-xl font-bold text-clay">{recordMonthCompletions}</p>
              </div>
              <div className="rounded-2xl border border-sage/20 bg-[#fffaf2] p-3 text-center">
                <p className="text-xs text-clay/70">{txt(lang, "Latest mood", "最近情绪")}</p>
                <p className="mt-1 font-heading text-xl font-bold text-clay">{latestMoodIcon}</p>
              </div>
            </div>
            <div className="mt-3 rounded-2xl border border-sage/20 bg-[#fffaf2] px-3 py-3 text-sm text-clay">
              <p className="font-semibold">{txt(lang, "Comfort task completion", "舒缓任务完成率")}</p>
              <p className="mt-1 text-clay/75">{recordComfortRate}%</p>
            </div>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-sage/25 bg-[#fffaf2] px-4 py-2 text-sm font-semibold text-clay transition hover:bg-sage/10"
            >
              <Download className="h-4 w-4" />
              {txt(lang, "Export monthly report", "导出月度报告")}
            </button>
          </Card>
        )}

        {activePage === "privacy" && (
          <Card style={style}>
            <SectionTitle
              title={txt(lang, "Privacy controls", "隐私控制")}
              subtitle={txt(lang, "Control who can access your data and notifications.", "控制谁可以访问你的数据与提醒。")}
            />
            <div className="mt-3 space-y-2">
              <ToggleRow
                label={txt(lang, "Private mode", "隐私模式")}
                on={privateMode}
                toggle={() => updatePrivacyValue("privateMode", !privateMode)}
              />
              <ToggleRow
                label={txt(lang, "Anonymous data for research", "匿名数据用于研究")}
                on={shareForResearch}
                toggle={() => updatePrivacyValue("shareForResearch", !shareForResearch)}
              />
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                className="rounded-2xl border border-sage/25 bg-[#fffaf2] px-3 py-2 text-sm font-semibold text-clay transition hover:bg-sage/10"
              >
                {txt(lang, "Manage login devices", "管理登录设备")}
              </button>
              <button
                type="button"
                className="rounded-2xl border border-sage/25 bg-[#fffaf2] px-3 py-2 text-sm font-semibold text-clay transition hover:bg-sage/10"
              >
                {txt(lang, "Download my data", "下载我的数据")}
              </button>
            </div>
          </Card>
        )}

        {activePage === "counsel" && (
          <Card style={style}>
            <SectionTitle
              title={txt(lang, "Professional support booking", "专业支持预约")}
              subtitle={txt(lang, "Choose the most suitable support slot for this week.", "选择本周最适合你的支持时段。")}
            />
            <div className="mt-3 space-y-2">
              {(counselingSlots.length > 0
                ? counselingSlots
                : [
                    { id: "slot-fallback-1", label: txt(lang, "Today 19:30 - Online counseling", "今天 19:30 - 在线咨询") },
                    { id: "slot-fallback-2", label: txt(lang, "Tomorrow 10:00 - Breathing coach", "明天 10:00 - 呼吸指导") },
                  ]
              ).map((item) => (
                <div key={item.id} className="rounded-2xl border border-sage/20 bg-[#fffaf2] px-3 py-3 text-sm font-semibold text-clay">
                  <span className="inline-flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-clay/60" />
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition hover:brightness-95"
              style={{ backgroundColor: style.primaryBg, color: style.primaryText }}
            >
              <Stethoscope className="h-4 w-4" />
              {txt(lang, "Open booking", "前往预约")}
            </button>
          </Card>
        )}

        {activePage === "help" && (
          <Card style={style}>
            <SectionTitle
              title={txt(lang, "Help and feedback", "帮助与反馈")}
              subtitle={txt(lang, "Find answers quickly or report an issue.", "快速找到答案，或反馈你遇到的问题。")}
            />
            <div className="mt-3 space-y-2">
              {(helpCenter.faqs || []).map((item) => (
                <SettingRow key={item.id} label={item.title} desc={item.desc} Icon={CircleHelp} onClick={() => {}} style={style} />
              ))}
              {(!helpCenter.faqs || helpCenter.faqs.length === 0) && (
                <p className="rounded-2xl border border-sage/20 bg-[#fffaf2] px-3 py-3 text-sm text-clay/75">
                  {txt(lang, "No FAQ yet. Please check back later.", "暂无常见问题，请稍后再看。")}
                </p>
              )}
            </div>
            <p className="mt-3 text-xs text-clay/65">Rihea {helpCenter.version || "v1.0.0"}</p>
          </Card>
        )}

        {activePage === "urgent" && (
          <Card style={style}>
            <SectionTitle
              title={txt(lang, "Urgent support contacts", "紧急支持联系人")}
              subtitle={txt(lang, "Use this if anxiety suddenly escalates and affects safety.", "当焦虑突然升级并影响安全时优先使用。")}
            />
            <div className="mt-3 space-y-2">
              {(emergencyContacts.length > 0
                ? emergencyContacts
                : [
                    { id: "fallback-primary", title: txt(lang, "Primary emergency contact", "首要紧急联系人"), phone: "+86 138-0000-0000" },
                    { id: "fallback-hospital", title: txt(lang, "Hospital hotline", "医院热线"), phone: "400-000-1120" },
                  ]
              ).map((item) => (
                <div key={item.id} className="rounded-2xl border border-[#e8c5b4] bg-[#fff5ef] px-3 py-3">
                  <p className="text-sm font-semibold text-[#A35E38]">{item.title}</p>
                  <p className="mt-1 text-sm text-[#A35E38]">{item.phone}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-[#d89b6b] px-4 py-2 text-sm font-bold text-white transition hover:brightness-95"
              >
                <Phone className="h-4 w-4" />
                {txt(lang, "Call now", "立即呼叫")}
              </button>
              <button
                type="button"
                className="rounded-full border border-[#d8b49f] bg-[#fff5ef] px-4 py-2 text-sm font-semibold text-[#A35E38] transition hover:bg-[#ffece2]"
              >
                {txt(lang, "Send support alert", "发送求助提醒")}
              </button>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card style={style}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay/65">{txt(lang, "Profile", "我的信息")}</p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-clay">{overview.name}</h2>
            <p className="mt-1 text-sm text-clay/78">
              {txt(lang, "Week", "孕")} {overview.pregnancyWeek} {txt(lang, "Progress", "，孕程进度")} {overview.progress}%
            </p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-sage/15">
              <div className="h-full rounded-full bg-[#d89b6b]" style={{ width: `${overview.progress}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: style.pillBg, color: style.pillText }}>
                {txt(lang, "Due in", "距离预产期")} {dueInDays} {txt(lang, "days", "天")}
              </span>
              <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: style.pillBg, color: style.pillText }}>
                {txt(lang, "Check-in streak", "连续打卡")} {checkInStreak} {txt(lang, "days", "天")}
              </span>
              <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: style.pillBg, color: style.pillText }}>
                {isLoggedIn ? txt(lang, "Signed in", "已登录") : txt(lang, "Signed out", "未登录")}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {isLoggedIn ? (
                <>
                  <button
                    type="button"
                    onClick={onRelogin}
                    className="inline-flex items-center gap-2 rounded-full border border-sage/20 bg-[#fffaf2] px-3 py-1.5 text-xs font-semibold text-clay transition hover:bg-sage/10"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    {txt(lang, "Re-sign in", "重新登录")}
                  </button>
                  <button
                    type="button"
                    onClick={onEditProfile}
                    className="inline-flex items-center gap-2 rounded-full border border-sage/20 bg-[#fffaf2] px-3 py-1.5 text-xs font-semibold text-clay transition hover:bg-sage/10"
                  >
                    <UserRound className="h-3.5 w-3.5" />
                    {txt(lang, "Edit profile", "编辑资料")}
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex items-center gap-2 rounded-full border border-[#e8c5b4] bg-[#fff5ef] px-3 py-1.5 text-xs font-semibold text-[#A35E38] transition hover:bg-[#ffece2]"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {txt(lang, "Sign out", "退出登录")}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onLogin}
                  className="inline-flex items-center gap-2 rounded-full border border-sage/20 bg-[#fffaf2] px-3 py-1.5 text-xs font-semibold text-clay transition hover:bg-sage/10"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  {txt(lang, "Sign in", "登录")}
                </button>
              )}
            </div>
            {isLoggedIn && loginAccount && <p className="mt-2 text-xs text-clay/65">{loginAccount}</p>}
          </div>
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#fffaf2] text-clay">
            <UserRound className="h-7 w-7" />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.1fr,1fr]">
        <Card style={style}>
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-2xl font-bold text-clay">{txt(lang, "Pregnancy profile", "孕程档案")}</h3>
            <CalendarDays className="h-5 w-5 text-clay/70" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-sage/20 bg-[#fffaf2] p-3 text-center">
              <p className="text-xs text-clay/70">{txt(lang, "Current week", "当前孕周")}</p>
              <p className="mt-1 font-heading text-xl font-bold text-clay">{overview.pregnancyWeek}</p>
            </div>
            <div className="rounded-2xl border border-sage/20 bg-[#fffaf2] p-3 text-center">
              <p className="text-xs text-clay/70">{txt(lang, "Mood streak", "连续打卡")}</p>
              <p className="mt-1 font-heading text-xl font-bold text-clay">{checkInStreak}</p>
            </div>
            <div className="rounded-2xl border border-sage/20 bg-[#fffaf2] p-3 text-center">
              <p className="text-xs text-clay/70">{txt(lang, "Latest check-in", "最近打卡")}</p>
              <p className="mt-1 font-heading text-xl font-bold text-clay">
                {latestCheckIn ? formatDateShort(latestCheckIn.date, lang) : "-"}
              </p>
            </div>
          </div>
        </Card>

        <Card style={style}>
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-2xl font-bold text-clay">{txt(lang, "Quick settings", "快捷配置")}</h3>
            <Bell className="h-5 w-5 text-clay/70" />
          </div>
          <div className="mt-3 space-y-2">
            <ToggleRow label={txt(lang, "Daily reminder", "每日提醒")} on={reminder} toggle={() => setReminder((value) => !value)} />
            <ToggleRow label={txt(lang, "Button sounds", "按钮音效")} on={sounds} toggle={() => setSounds((value) => !value)} />
            <ToggleRow label={txt(lang, "Partner sync", "伴侣同步")} on={partnerSync} toggle={() => setPartnerSync((value) => !value)} />
          </div>
          <button
            type="button"
            onClick={openSettings}
            className="mt-3 flex w-full items-center justify-between rounded-2xl border border-sage/20 bg-[#fffaf2] px-3 py-3 text-left"
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-clay">
              <span className="grid h-7 w-7 place-items-center rounded-full" style={{ backgroundColor: style.pillBg, color: style.pillText }}>
                <Volume2 className="h-4 w-4" />
              </span>
              {txt(lang, "More preference settings", "更多偏好设置")}
            </span>
            <ChevronRight className="h-4 w-4 text-clay/55" />
          </button>
        </Card>
      </div>

      <Card style={style}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-heading text-2xl font-bold text-clay">{txt(lang, "Account and privacy", "账户与隐私")}</h3>
          <ShieldCheck className="h-5 w-5 text-clay/70" />
        </div>
        <div className="space-y-2">
          {profileRows.map((item) => (
            <SettingRow key={item.key} label={item.label} desc={item.desc} Icon={item.Icon} onClick={() => setActivePage(item.key)} style={style} />
          ))}
        </div>
      </Card>

      <Card style={style}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-heading text-2xl font-bold text-clay">{txt(lang, "Support center", "支持中心")}</h3>
          <HeartHandshake className="h-5 w-5 text-clay/70" />
        </div>
        <div className="space-y-2">
          {supportRows.map((item) => (
            <SettingRow
              key={item.key}
              label={item.label}
              desc={item.desc}
              Icon={item.Icon}
              onClick={() => setActivePage(item.key)}
              style={style}
              danger={item.danger}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
