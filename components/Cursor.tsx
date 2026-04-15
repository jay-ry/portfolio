"use client";
import { useEffect, useRef } from "react";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = mx + "px";
        dotRef.current.style.top = my + "px";
      }
    };

    const animate = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = rx + "px";
        ringRef.current.style.top = ry + "px";
      }
      requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove);
    animate();

    const onEnter = () => {
      if (ringRef.current) ringRef.current.style.transform = "translate(-50%,-50%) scale(1.8)";
    };
    const onLeave = () => {
      if (ringRef.current) ringRef.current.style.transform = "translate(-50%,-50%) scale(1)";
    };

    document.querySelectorAll("a, button, [data-hover]").forEach(el => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="cursor">
      <div ref={dotRef} className="cursor-dot" style={{ position: "fixed" }} />
      <div ref={ringRef} className="cursor-ring" style={{ position: "fixed" }} />
    </div>
  );
}
