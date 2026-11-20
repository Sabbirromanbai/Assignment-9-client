"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Flame, Sparkles, Star, Store, Timer } from "lucide-react"
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const heroStyles = `
  .hero-3d {
    --hero-bg: color-mix(in oklab, var(--background) 92%, var(--brand-tomato) 8%);
    --hero-bg-2: color-mix(in oklab, var(--background) 82%, var(--brand-ink) 18%);
    --hero-ink: var(--foreground);
    --hero-muted: var(--muted-foreground);
    --hero-solid: var(--card);
    --hero-surface: color-mix(in oklab, var(--card) 78%, transparent);
    --hero-surface-hover: color-mix(in oklab, var(--card) 94%, transparent);
    --hero-border: color-mix(in oklab, var(--foreground) 15%, transparent);
    --hero-grid: color-mix(in oklab, var(--foreground) 5%, transparent);
    --hero-overlay: color-mix(in oklab, var(--foreground) 22%, transparent);
    --hero-glow-1: rgba(239, 68, 56, 0.2);
    --hero-glow-2: rgba(255, 150, 61, 0.14);
    --hero-shadow: 0 30px 80px -32px color-mix(in oklab, var(--foreground) 40%, transparent);
  }
  .dark .hero-3d {
    --hero-bg: color-mix(in oklab, var(--background) 88%, var(--brand-tomato) 12%);
    --hero-bg-2: color-mix(in oklab, var(--background) 90%, #000000 10%);
    --hero-surface: color-mix(in oklab, var(--card) 72%, transparent);
    --hero-surface-hover: color-mix(in oklab, var(--card) 88%, transparent);
    --hero-border: color-mix(in oklab, var(--brand-cream) 16%, transparent);
    --hero-grid: color-mix(in oklab, var(--brand-cream) 7%, transparent);
    --hero-overlay: rgba(0, 0, 0, 0.5);
    --hero-glow-1: rgba(239, 68, 56, 0.32);
    --hero-glow-2: rgba(255, 150, 61, 0.2);
    --hero-shadow: 0 35px 90px -30px rgba(0, 0, 0, 0.85);
  }

  @keyframes hero-float {
    0%, 100% { transform: translate3d(0, 0, 0); }
    50% { transform: translate3d(0, -14px, 0); }
  }
  @keyframes hero-card-3d {
    0%, 100% { transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale(1); }
    33% { transform: translate3d(0, -16px, 18px) rotateX(5deg) rotateY(-7deg) scale(1.02); }
    66% { transform: translate3d(0, -8px, 10px) rotateX(-4deg) rotateY(6deg) scale(1.01); }
  }
  @keyframes hero-main-3d {
    0%, 100% { transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1); }
    50% { transform: translate3d(0, -18px, 26px) rotateX(4deg) rotateY(-5deg) rotateZ(1deg) scale(1.02); }
  }
  @keyframes hero-orbit {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes hero-glow-pulse {
    0%, 100% { opacity: 0.45; transform: scale(0.96); }
    50% { opacity: 0.9; transform: scale(1.08); }
  }
  @keyframes hero-gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  @keyframes hero-shine {
    0%, 12% { transform: translateX(-170%) skewX(-18deg); }
    48%, 100% { transform: translateX(280%) skewX(-18deg); }
  }
  @keyframes hero-arrow {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(5px); }
  }
  @keyframes hero-ping {
    0% { transform: scale(0.8); opacity: 0.8; }
    80%, 100% { transform: scale(2.4); opacity: 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .hero-3d *, .hero-3d *::before, .hero-3d *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
  }
`

function HeroCard({
  src,
  alt,
  wrapperClassName,
  delay = 0,
  reduceMotion,
  parallaxY,
}: {
  src: string
  alt: string
  wrapperClassName: string
  delay?: number
  reduceMotion: boolean | null
  parallaxY?: MotionValue<string>
}) {
  return (
    <div className={wrapperClassName}>
      <motion.div
        className="h-full w-full"
        style={reduceMotion ? undefined : { y: parallaxY }}
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.88, y: 32 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.1, delay, ease: EASE }}
        >
          <div
            className={cn(
              "relative aspect-[16/10] overflow-hidden rounded-[26px] border border-[var(--hero-border)] bg-[var(--hero-solid)] shadow-[var(--hero-shadow)]",
              !reduceMotion &&
                "animate-[hero-card-3d_9s_ease-in-out_infinite] [transform-style:preserve-3d]",
            )}
            style={{ animationDelay: `${delay}s` }}
          >
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(min-width: 1024px) 420px, 80vw"
              className="object-contain p-1"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(to_top,var(--hero-overlay),transparent)]"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

function GlassChip({
  children,
  wrapperClassName,
  delay,
  reduceMotion,
  parallaxY,
}: {
  children: React.ReactNode
  wrapperClassName: string
  delay: number
  reduceMotion: boolean | null
  parallaxY?: MotionValue<string>
}) {
  return (
    <div className={wrapperClassName}>
      <motion.div
        className="h-full w-full"
        style={reduceMotion ? undefined : { y: parallaxY }}
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay, ease: EASE }}
          className="flex items-center gap-3 rounded-2xl border border-[var(--hero-border)] bg-[var(--hero-surface)] px-4 py-3 shadow-[var(--hero-shadow)] backdrop-blur-xl"
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  )
}

export function Hero() {
  const reduceMotion = useReducedMotion()
  const sectionRef = React.useRef<HTMLElement | null>(null)
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const smoothX = useSpring(pointerX, { stiffness: 90, damping: 22, mass: 0.6 })
  const smoothY = useSpring(pointerY, { stiffness: 90, damping: 22, mass: 0.6 })
  const rotateX = useTransform(smoothY, [-1, 1], [8, -8])
  const rotateY = useTransform(smoothX, [-1, 1], [-11, 11])
  const stageTransform = useMotionTemplate`perspective(1400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })
  const stageY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"])
  const glowY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])
  const backLeftY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"])
  const backRightY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"])
  const chipY = useTransform(scrollYProgress, [0, 1], ["0%", "24%"])

  function handlePointerMove(event: React.MouseEvent<HTMLDivElement>) {
    if (reduceMotion) return
    const rect = event.currentTarget.getBoundingClientRect()
    pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2)
    pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2)
  }

  function handlePointerLeave() {
    pointerX.set(0)
    pointerY.set(0)
  }

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-heading"
      className="hero-3d relative isolate overflow-hidden bg-[var(--hero-bg)] text-[var(--hero-ink)]"
    >
      <style>{heroStyles}</style>

      {/* Ambient cinematic background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20"
        style={{
          backgroundImage:
            "radial-gradient(58% 58% at 76% 32%, var(--hero-glow-1), transparent 70%), radial-gradient(46% 50% at 12% 82%, var(--hero-glow-2), transparent 72%), linear-gradient(140deg, var(--hero-bg) 0%, var(--hero-bg-2) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(70%_70%_at_60%_40%,black,transparent)]"
        style={{
          backgroundImage:
            "linear-gradient(var(--hero-grid) 1px, transparent 1px), linear-gradient(90deg, var(--hero-grid) 1px, transparent 1px)",
          backgroundSize: "54px 54px",
        }}
      />
      <motion.div
        aria-hidden="true"
        className={cn(
          "absolute -left-40 top-1/3 -z-10 size-[560px] rounded-full bg-brand-orange/20 blur-[150px]",
          !reduceMotion && "animate-[hero-glow-pulse_9s_ease-in-out_infinite]",
        )}
        style={reduceMotion ? undefined : { y: glowY }}
      />
      <motion.div
        aria-hidden="true"
        className={cn(
          "absolute -right-52 top-[-15%] -z-10 size-[520px] rounded-full bg-brand-tomato/15 blur-[140px]",
          !reduceMotion && "animate-[hero-glow-pulse_11s_ease-in-out_infinite]",
        )}
        style={reduceMotion ? undefined : { y: glowY }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-6 lg:px-8 lg:py-24">
        {/* Copy */}
        <div className="relative z-20 max-w-2xl">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="inline-flex items-center gap-2.5 rounded-full border border-[var(--hero-border)] bg-[var(--hero-surface)] px-4 py-2 text-[11px] font-semibold tracking-[0.2em] uppercase backdrop-blur-xl"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full rounded-full bg-brand-cheese animate-[hero-ping_2.2s_ease-out_infinite]" />
              <span className="relative inline-flex size-2 rounded-full bg-brand-cheese" />
            </span>
            Pizza mood. Deshi attitude!
          </motion.div>

          <motion.h1
            id="hero-heading"
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
            className="mt-7 font-heading text-[clamp(2.9rem,6vw,5.4rem)] leading-[1.02] font-bold tracking-[-0.045em] text-balance"
          >
            Craving something
            <br />
            <span className="bg-gradient-to-r from-[#ffd65a] via-[#ff9b45] to-[#ef4438] bg-clip-text text-transparent">
              extra cheesy?
            </span>
            <br />
            <span className="text-[0.68em] font-semibold tracking-[-0.03em] text-[var(--hero-muted)]">
              Go Deshi. Go Pizzabari.
            </span>
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: EASE }}
            className="mt-7 max-w-xl text-base leading-relaxed text-[var(--hero-muted)] sm:text-lg"
          >
            Big cheese, bold flavors and a little Deshi attitude in every bite.
            Wood-fired fresh, delivered warm to your door.
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.24, ease: EASE }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <motion.div
              style={{ transformPerspective: 700 }}
              whileHover={
                reduceMotion
                  ? undefined
                  : { y: -4, scale: 1.03, rotateX: -6, rotateY: 4 }
              }
              whileTap={reduceMotion ? undefined : { scale: 0.96, y: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 20 }}
            >
              <Link
                href="/menu"
                className={cn(
                  buttonVariants(),
                  "group/button relative isolate h-auto w-full overflow-visible rounded-xl border-0 bg-[linear-gradient(110deg,#ff963d,#ef4438,#ffb347,#ff963d)] bg-[length:220%_220%] px-9 py-5 text-base font-bold tracking-wide text-white shadow-[0_18px_42px_-14px_rgba(239,68,56,0.8)] sm:w-auto",
                  !reduceMotion &&
                    "animate-[hero-gradient-shift_6s_ease-in-out_infinite]",
                  "hover:shadow-[0_26px_56px_-14px_rgba(239,68,56,0.95)]",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute -inset-2 -z-10 rounded-2xl bg-brand-tomato/40 blur-xl transition-opacity duration-500 group-hover/button:opacity-100",
                    reduceMotion
                      ? "opacity-50"
                      : "opacity-60 animate-[hero-glow-pulse_4s_ease-in-out_infinite]",
                  )}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
                >
                  <span
                    className={cn(
                      "absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0",
                      !reduceMotion &&
                        "group-hover/button:animate-[hero-shine_1.1s_ease-out_1] group-hover/button:opacity-100",
                    )}
                  />
                </span>
                <span className="relative z-10 flex items-center gap-2">
                  Explore Menu
                  <span
                    className={cn(!reduceMotion && "animate-[hero-arrow_2.4s_ease-in-out_infinite]")}
                  >
                    <ArrowRight className="size-5 transition-transform duration-300 group-hover/button:translate-x-1" aria-hidden="true" />
                  </span>
                </span>
              </Link>
            </motion.div>

            <motion.div
              style={{ transformPerspective: 700 }}
              whileHover={
                reduceMotion
                  ? undefined
                  : { y: -4, scale: 1.03, rotateX: -6, rotateY: -4 }
              }
              whileTap={reduceMotion ? undefined : { scale: 0.96, y: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 20 }}
            >
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants(),
                  "group/button relative h-auto w-full rounded-xl border border-[var(--hero-border)] bg-[var(--hero-surface)] px-9 py-5 text-base font-bold tracking-wide text-[var(--hero-ink)] shadow-[var(--hero-shadow)] backdrop-blur-xl transition-colors duration-300 hover:bg-[var(--hero-surface-hover)] sm:w-auto",
                )}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-transparent transition-all duration-500 group-hover/button:ring-brand-tomato/60"
                />
                <span className="relative z-10 flex items-center gap-2">
                  <Store className="size-5 transition-transform duration-500 ease-smooth group-hover/button:-rotate-12 group-hover/button:scale-110" aria-hidden="true" />
                  Become a Vendor
                </span>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32, ease: EASE }}
            className="mt-11 flex flex-wrap items-center gap-x-7 gap-y-4"
          >
            {[
              { icon: Star, value: "4.9/5", label: "Loved by locals" },
              { icon: Timer, value: "25 min", label: "Average delivery" },
              { icon: Flame, value: "100%", label: "Wood-fired fresh" },
            ].map(({ icon: Icon, value, label }, index) => (
              <motion.div
                key={label}
                initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.08, ease: EASE }}
                className="flex items-center gap-2.5"
              >
                <span className="grid size-9 place-items-center rounded-xl border border-[var(--hero-border)] bg-[var(--hero-surface)] text-brand-orange backdrop-blur-md">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-bold">{value}</span>
                  <span className="block text-xs text-[var(--hero-muted)]">{label}</span>
                </span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-8 hidden items-center gap-2 text-[10px] font-semibold tracking-[0.22em] text-[var(--hero-muted)] uppercase lg:flex"
          >
            <span className="grid size-7 place-items-center rounded-full border border-[var(--hero-border)]">
              <ArrowRight
                className={cn(
                  "size-3 rotate-90",
                  !reduceMotion && "animate-[hero-arrow_2.2s_ease-in-out_infinite]",
                )}
                aria-hidden="true"
              />
            </span>
            Scroll to explore
          </motion.div>
        </div>

        {/* 3D floating visual stage */}
        <motion.div
          className="relative mx-auto w-full max-w-[640px]"
          style={reduceMotion ? undefined : { y: stageY }}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.1, ease: EASE }}
        >
          <div
            className="relative aspect-[6/5] w-full"
            onMouseMove={handlePointerMove}
            onMouseLeave={handlePointerLeave}
          >
            {/* Depth glow + orbit rings */}
            <div
              aria-hidden="true"
              className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,var(--hero-glow-1),rgba(255,150,61,0.12)_45%,transparent_70%)] blur-2xl"
            />
            <div
              aria-hidden="true"
              className={cn(
                "absolute inset-[3%] rounded-full border border-dashed border-[var(--hero-border)]",
                !reduceMotion && "animate-[hero-orbit_36s_linear_infinite]",
              )}
            />
            <div
              aria-hidden="true"
              className={cn(
                "absolute inset-[13%] rounded-full border border-[var(--hero-border)]",
                !reduceMotion && "animate-[hero-orbit_24s_linear_infinite_reverse]",
              )}
            />
            <div
              aria-hidden="true"
              className={cn(
                "absolute left-[12%] top-[70%] h-[14%] w-[72%] rounded-[50%] bg-brand-tomato/30 blur-3xl",
                !reduceMotion && "animate-[hero-glow-pulse_6s_ease-in-out_infinite]",
              )}
            />

            {/* Pointer tilt + gentle idle sway */}
            <motion.div
              className="absolute inset-0"
              style={
                reduceMotion
                  ? undefined
                  : { transform: stageTransform, transformStyle: "preserve-3d" }
              }
            >
              <motion.div
                className="absolute inset-0"
                style={{ transformStyle: "preserve-3d" }}
                animate={
                  reduceMotion
                    ? undefined
                    : { rotate: [-1.3, 1.3, -1.3], y: [0, -7, 0] }
                }
                transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
              >
                <HeroCard
                  src="/images/Dynamic Floating Pizza Feast-2.png"
                  alt=""
                  wrapperClassName="left-[0%] top-[9%] w-[62%] [transform:translateZ(-150px)_rotate(-13deg)]"
                  delay={0.18}
                  reduceMotion={reduceMotion}
                  parallaxY={backLeftY}
                />
                <HeroCard
                  src="/images/Pizza Feast Ingredient Collage-4.png"
                  alt=""
                  wrapperClassName="right-[-3%] bottom-[7%] w-[64%] [transform:translateZ(-110px)_rotate(12deg)]"
                  delay={0.28}
                  reduceMotion={reduceMotion}
                  parallaxY={backRightY}
                />

                {/* Main showcase card */}
                <div className="absolute left-[7%] top-[16%] w-[86%] [transform:translateZ(70px)]">
                  <motion.div
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.88, y: 34 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1.15, delay: 0.14, ease: EASE }}
                  >
                    <div
                      className={cn(
                        "relative aspect-[16/10] rounded-[34px] bg-gradient-to-br from-brand-cheese/80 via-[var(--hero-border)] to-brand-tomato/60 p-[2px] shadow-[var(--hero-shadow)]",
                        !reduceMotion &&
                          "animate-[hero-main-3d_8s_ease-in-out_infinite] [transform-style:preserve-3d]",
                      )}
                    >
                      <div className="relative h-full w-full overflow-hidden rounded-[32px] bg-[var(--hero-solid)]">
                        <Image
                          src="/images/Floating Wood-Fired Pizza Feast-3.png"
                          alt="A floating wood-fired pizza feast with bubbling cheese, pepperoni and fresh basil"
                          fill
                          loading="eager"
                          fetchPriority="high"
                          sizes="(min-width: 1024px) 580px, 90vw"
                          className="object-contain p-2 transition-transform duration-700 ease-smooth hover:scale-105"
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-[linear-gradient(to_top,var(--hero-overlay),transparent)]"
                        />
                        <div
                          aria-hidden="true"
                          className={cn(
                            "absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent",
                            !reduceMotion &&
                              "animate-[hero-shine_8s_ease-in-out_infinite]",
                          )}
                        />
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-inset ring-white/20"
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Orbiting ingredient thumbnail */}
                <div className="pointer-events-none absolute inset-[6%] [transform:translateZ(235px)]">
                  <motion.div
                    className="h-full w-full"
                    style={reduceMotion ? undefined : { y: chipY }}
                  >
                    <div
                      className={cn(
                        "relative h-full w-full",
                        !reduceMotion && "animate-[hero-orbit_18s_linear_infinite]",
                      )}
                    >
                      <div className="absolute left-1/2 top-[-4%] size-[86px] -translate-x-1/2 rounded-full border-2 border-[var(--hero-border)] bg-[var(--hero-solid)] p-1 shadow-[var(--hero-shadow)]">
                        <div
                          className={cn(
                            "relative size-full overflow-hidden rounded-full",
                            !reduceMotion &&
                              "animate-[hero-orbit_18s_linear_infinite_reverse]",
                          )}
                        >
                          <Image
                            src="/images/Cheesy Pizza Ingredient Explosion.png"
                            alt=""
                            fill
                            sizes="86px"
                            className="object-cover scale-150"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Floating glass chips */}
                <GlassChip
                  wrapperClassName="right-[-2%] top-[3%] [transform:translateZ(160px)]"
                  delay={0.55}
                  reduceMotion={reduceMotion}
                  parallaxY={chipY}
                >
                  <span className="grid size-9 place-items-center rounded-xl bg-brand-cheese/20 text-brand-orange">
                    <Star className="size-4 fill-current" aria-hidden="true" />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-sm font-bold text-[var(--hero-ink)]">4.9 / 5</span>
                    <span className="block text-[11px] text-[var(--hero-muted)]">
                      2.4k happy eaters
                    </span>
                  </span>
                </GlassChip>

                <GlassChip
                  wrapperClassName="bottom-[5%] left-[1%] [transform:translateZ(190px)]"
                  delay={0.65}
                  reduceMotion={reduceMotion}
                  parallaxY={chipY}
                >
                  <span className="grid size-9 place-items-center rounded-xl bg-brand-tomato/20 text-brand-orange">
                    <Flame className="size-4" aria-hidden="true" />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-sm font-bold text-[var(--hero-ink)]">Wood-fired</span>
                    <span className="block text-[11px] text-[var(--hero-muted)]">
                      Made fresh to order
                    </span>
                  </span>
                </GlassChip>

                <div className="absolute bottom-[15%] right-[3%] [transform:translateZ(210px)]">
                  <motion.div
                    className="h-full w-full"
                    style={reduceMotion ? undefined : { y: chipY }}
                  >
                    <motion.div
                      initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.75, ease: EASE }}
                      className={cn(
                        "grid size-[74px] place-items-center rounded-full border border-white/25 bg-gradient-to-br from-[#ff963d] to-[#ef4438] text-center text-white shadow-[0_20px_50px_-16px_rgba(239,68,56,0.85)]",
                        !reduceMotion &&
                          "animate-[hero-float_6s_ease-in-out_infinite]",
                      )}
                    >
                      <span className="leading-tight">
                        <Sparkles className="mx-auto mb-0.5 size-3.5" aria-hidden="true" />
                        <span className="block text-[11px] font-bold">100%</span>
                        <span className="block text-[9px] font-semibold tracking-wide uppercase">
                          Cheesy
                        </span>
                      </span>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Soft fade into the next section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[var(--background)]"
      />
    </section>
  )
}
