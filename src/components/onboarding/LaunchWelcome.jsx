import { motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { txt } from "../../utils/txt";

function CloudBlob({ className = "", tint = "#f2f2f1", drift = 10, delay = 0, duration = 9 }) {
  return (
    <motion.div
      className={`absolute ${className}`}
      animate={{ x: [0, drift, 0], y: [0, -4, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <span className="absolute bottom-0 left-0 h-14 w-24 rounded-full" style={{ backgroundColor: tint }} />
      <span className="absolute bottom-0 left-14 h-16 w-24 rounded-full" style={{ backgroundColor: tint }} />
      <span className="absolute bottom-6 left-7 h-14 w-16 rounded-full" style={{ backgroundColor: tint }} />
    </motion.div>
  );
}

function SmileSun() {
  return (
    <motion.div
      className="relative h-44 w-44 rounded-full"
      style={{
        background:
          "radial-gradient(circle at 30% 28%, #ffe772 0%, #ffd62a 58%, #f9c810 100%)",
        boxShadow: "0 24px 42px -24px rgba(216, 158, 10, 0.8)",
      }}
      animate={{ y: [0, -7, 0], scale: [1, 1.02, 1] }}
      transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
    >
      <span className="absolute left-[34%] top-[42%] h-2.5 w-2.5 rounded-full bg-[#f2a54a]" />
      <span className="absolute left-[59%] top-[42%] h-2.5 w-2.5 rounded-full bg-[#f2a54a]" />
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        animate={{ rotate: [0, 2, 0] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M32 60 Q50 76 68 60"
          fill="none"
          stroke="#ef9a38"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      </motion.svg>
    </motion.div>
  );
}

export default function LaunchWelcome({ lang, onStart, onSkip }) {
  return (
    <motion.section
      role="dialog"
      aria-modal="true"
      aria-labelledby="launch-welcome-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #39a6f5 0%, #3faff9 44%, #5ebdfc 70%, #81cbff 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 18% 10%, rgba(255,255,255,.22), transparent 30%), radial-gradient(circle at 82% 16%, rgba(255,255,255,.18), transparent 36%), linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,0))",
        }}
      />

      <button
        type="button"
        onClick={onSkip}
        className="absolute left-5 top-5 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d6e9fb] bg-white/88 text-clay shadow-soft transition hover:bg-white"
        aria-label={txt(lang, "Skip welcome screen", "跳过欢迎页")}
      >
        <X className="h-5 w-5" />
      </button>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-[58vh]">
        <CloudBlob className="-left-7 top-7 h-24 w-44" tint="#f5f5f4" drift={14} duration={10} />
        <CloudBlob className="right-[-18px] top-[14%] h-24 w-44" tint="#f1f1f0" drift={-13} delay={0.4} duration={11} />
        <CloudBlob className="left-[20%] top-[30%] h-20 w-36" tint="#f7f7f7" drift={10} delay={0.8} duration={9} />
        <motion.div
          className="absolute right-[10%] top-[18%]"
          initial={{ y: 34, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.18 }}
        >
          <SmileSun />
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[30vh]">
        <CloudBlob className="-left-10 bottom-[-14px] h-32 w-52" tint="#f0f0f0" drift={12} duration={12} />
        <CloudBlob className="left-[28%] bottom-[-24px] h-36 w-56" tint="#efefef" drift={9} delay={0.3} duration={10} />
        <CloudBlob className="right-[-16px] bottom-[-18px] h-28 w-48" tint="#f2f2f2" drift={-8} delay={0.6} duration={11} />
      </div>

      <main className="relative z-10 mx-auto flex h-full w-full max-w-[640px] items-end px-4 pb-8 sm:px-8 sm:pb-10">
        <motion.article
          initial={{ y: 26, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 22, delay: 0.08 }}
          className="w-full rounded-[2.2rem] border border-[#d7ecff] bg-white/88 p-5 shadow-soft backdrop-blur-[4px] sm:p-6"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5e7a8f]">
            {txt(lang, "Welcome to Rihea", "欢迎来到 Rihea 妊安")}
          </p>
          <h1 id="launch-welcome-title" className="mt-2 font-heading text-[1.95rem] font-bold leading-tight text-clay sm:text-[2.2rem]">
            {txt(lang, "Steady your breath first", "先稳住呼吸，今天会轻松很多")}
          </h1>
          <p className="mt-2 text-[0.95rem] text-clay/82 sm:text-base">
            {txt(
              lang,
              "Take one short guided minute to settle in, then continue your day plan.",
              "先做 1 分钟引导练习，再进入今天的关怀计划。"
            )}
          </p>

          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#d8ecff]">
              <motion.span
                className="block h-full rounded-full bg-[#82c8ff]"
                animate={{ x: ["-42%", "102%"] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <p className="mt-1.5 text-xs font-semibold text-clay/65">
              {txt(lang, "Gentle start mode", "温和启动模式")}
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={onStart}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#f9cd29] px-4 py-3 text-sm font-extrabold text-[#3f4e43] transition hover:brightness-95"
            >
              {txt(lang, "Start 3-min settle", "开始3分钟安定练习")}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-[#d8e7f6] bg-white px-4 py-3 text-sm font-bold text-clay transition hover:bg-[#f6fbff]"
            >
              {txt(lang, "Enter app now", "先进入首页")}
            </button>
          </div>
        </motion.article>
      </main>
    </motion.section>
  );
}
