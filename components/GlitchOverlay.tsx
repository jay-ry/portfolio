"use client";
import { forwardRef } from "react";

const GlitchOverlay = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} className="glitch-overlay">
    <div className="glitch-overlay__bar" style={{ top: "18%" }} />
    <div className="glitch-overlay__bar" style={{ top: "53%" }} />
    <div className="glitch-overlay__bar" style={{ top: "76%" }} />
  </div>
));

GlitchOverlay.displayName = "GlitchOverlay";
export default GlitchOverlay;
