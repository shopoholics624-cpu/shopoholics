"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Cpu, ShieldCheck, Zap } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function InteractiveCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !cardRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(cardRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top center",
          end: "bottom center",
          scrub: 1,
        },
        rotateY: 15,
        scale: 1.04,
        ease: "power2.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative rounded-3xl bg-gradient-to-br from-[#3d2c2a] via-[#610000] to-[#261816] p-8 sm:p-12 text-white overflow-hidden shadow-2xl border border-[#8e706b]/40 my-12"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Exploded Titanium Internal Engineering
          </h2>
          <p className="text-sm sm:text-base text-[#e3beb8] leading-relaxed">
            Scroll down to inspect the custom vapor chamber thermal dispersion system, 200MP periscope glass optics, and 3nm neural processing unit.
          </p>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-1">
              <Cpu className="w-5 h-5 text-[#ff907f]" />
              <h4 className="font-bold text-white">3nm Neural Engine</h4>
              <p className="text-[#e3beb8]">16-Core Ray Tracing</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-1">
              <Zap className="w-5 h-5 text-[#ff907f]" />
              <h4 className="font-bold text-white">Vapor Cooling</h4>
              <p className="text-[#e3beb8]">35% Cooler under load</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 flex justify-center">
          <div
            ref={cardRef}
            className="w-full max-w-sm rounded-3xl p-4 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-4"
          >
            {/* eslint-disable-next-img-element */}
            <img
              src="https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=1200&auto=format&fit=crop"
              alt="Titanium Internal Hardware Blueprint"
              className="w-full h-72 object-cover rounded-2xl shadow-inner"
            />
            <div className="p-2 text-center">
              <span className="text-xs font-bold uppercase text-[#ff907f]">
                Grade 5 Titanium Armor Shield
              </span>
              <p className="text-xs text-[#e3beb8] mt-1 flex items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Aerodynamic Tactile Frame
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
