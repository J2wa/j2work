"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function MotionEngine() {
  const pathname = usePathname();

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const finePointer =
      typeof window !== "undefined" &&
      window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

    const cleanups: Array<() => void> = [];

    /* 1. Scroll progress hairline inside sticky header */
    const progressEl = document.getElementById("scrollProgress");
    if (progressEl) {
      let ticking = false;
      const updateProgress = () => {
        ticking = false;
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const ratio =
          docHeight > 0
            ? Math.min(1, Math.max(0, window.scrollY / docHeight))
            : 0;
        progressEl.style.transform = `scaleX(${ratio.toFixed(4)})`;
      };
      const onScroll = () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateProgress);
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      updateProgress();
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
    }

    /* 2. Cursor-reactive hero light field */
    if (finePointer && !prefersReducedMotion) {
      document.querySelectorAll<HTMLElement>("[data-hero-glow]").forEach((hero) => {
        let rafId = 0;
        let gx = 65;
        let gy = 22;
        const onMove = (e: PointerEvent) => {
          const rect = hero.getBoundingClientRect();
          gx = ((e.clientX - rect.left) / rect.width) * 100;
          gy = ((e.clientY - rect.top) / rect.height) * 100;
          if (!rafId) {
            rafId = requestAnimationFrame(() => {
              rafId = 0;
              hero.style.setProperty("--mx", `${gx.toFixed(1)}%`);
              hero.style.setProperty("--my", `${gy.toFixed(1)}%`);
            });
          }
        };
        hero.addEventListener("pointermove", onMove, { passive: true });
        cleanups.push(() => {
          hero.removeEventListener("pointermove", onMove);
          if (rafId) cancelAnimationFrame(rafId);
        });
      });
    }

    /* 3. Scroll-triggered staggered reveals */
    const revealEls = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    if (
      revealEls.length > 0 &&
      !prefersReducedMotion &&
      "IntersectionObserver" in window
    ) {
      document.documentElement.classList.add("js-motion");
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;
              const delay = el.getAttribute("data-delay") || "0";
              el.style.transitionDelay = `${delay}ms`;
              el.classList.add("is-revealed");
              io.unobserve(el);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -24px 0px" },
      );
      revealEls.forEach((el) => {
        if (!el.classList.contains("is-revealed")) {
          io.observe(el);
        }
      });
      cleanups.push(() => io.disconnect());
    } else {
      revealEls.forEach((el) => el.classList.add("is-revealed"));
    }

    /* 4. Desktop 3D micro-tilt + specular sheen & magnetic CTAs */
    if (finePointer && !prefersReducedMotion) {
      document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((card) => {
        const onMove = (e: PointerEvent) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width;
          const y = (e.clientY - r.top) / r.height;
          const rx = (0.5 - y) * 5;
          const ry = (x - 0.5) * 6;
          card.style.setProperty("--cx", `${(x * 100).toFixed(1)}%`);
          card.style.setProperty("--cy", `${(y * 100).toFixed(1)}%`);
          card.style.transform = `perspective(900px) translateY(-4px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        };
        const onLeave = () => {
          card.style.transform = "";
        };
        card.addEventListener("pointermove", onMove);
        card.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          card.removeEventListener("pointermove", onMove);
          card.removeEventListener("pointerleave", onLeave);
        });
      });

      document
        .querySelectorAll<HTMLElement>("[data-magnetic]")
        .forEach((btn) => {
          const onMove = (e: PointerEvent) => {
            const r = btn.getBoundingClientRect();
            const dx =
              ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * 4;
            const dy =
              ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * 3;
            btn.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
          };
          const onLeave = () => {
            btn.style.transform = "";
          };
          btn.addEventListener("pointermove", onMove);
          btn.addEventListener("pointerleave", onLeave);
          cleanups.push(() => {
            btn.removeEventListener("pointermove", onMove);
            btn.removeEventListener("pointerleave", onLeave);
          });
        });
    }

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [pathname]);

  return null;
}
