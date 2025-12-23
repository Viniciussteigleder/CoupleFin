"use client";

import { useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";

export function MotionProvider() {
  const reduce = useReducedMotion();

  useEffect(() => {
    gsap.defaults({ overwrite: "auto" });
    if (reduce) {
      gsap.globalTimeline.timeScale(1000); // effectively disables GSAP animations
    } else {
      gsap.globalTimeline.timeScale(1);
    }
  }, [reduce]);

  return null;
}
