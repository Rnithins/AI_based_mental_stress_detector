const quoteBank = {
  low: [
    "Calm is a skill. Repeat what keeps you steady.",
    "Your steady voice is evidence of resilience.",
    "Protect your peace by keeping your routines simple.",
  ],
  medium: [
    "You do not need to solve everything at once.",
    "One slow breath can reset a fast mind.",
    "Progress today can look like softness and structure.",
  ],
  high: [
    "Pause. Breathe. Safety starts with one controlled exhale.",
    "Your body is signaling overload, not failure.",
    "Reduce pace first. Clarity follows regulation.",
  ],
};

export const getQuotesByStressLevel = (stressLevel = "medium", limit = 3) => {
  const level = ["low", "medium", "high"].includes(stressLevel) ? stressLevel : "medium";
  const all = quoteBank[level];
  return all.slice(0, Math.max(1, Math.min(limit, all.length))).map((text, index) => ({
    id: `${level}-${index}`,
    text,
    tone: level,
  }));
};