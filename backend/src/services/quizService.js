const answerValue = (answers, id, fallback = 3) => {
  const match = answers.find((item) => item.id === id);
  return typeof match?.value === "number" ? match.value : fallback;
};

export const generateQuizSuggestions = (answers, stressLevel = "medium") => {
  const sleep = answerValue(answers, "sleep_quality");
  const energy = answerValue(answers, "daily_energy");
  const focus = answerValue(answers, "focus_level");
  const social = answerValue(answers, "social_support");
  const stressTrigger = answerValue(answers, "stress_trigger");

  const suggestions = [];

  if (sleep <= 2) {
    suggestions.push("Keep a fixed sleep window and avoid screens 45 minutes before bed.");
  }

  if (energy <= 2) {
    suggestions.push("Take two 5-minute movement breaks during work to reduce tension build-up.");
  }

  if (focus <= 2 || stressTrigger >= 4) {
    suggestions.push("Use a 25-minute deep-work sprint followed by a 5-minute breathing reset.");
  }

  if (social <= 2) {
    suggestions.push("Share one stress trigger with a trusted person today to lower cognitive load.");
  }

  if (stressLevel === "high") {
    suggestions.push("Run the 4-4-6 breathing cycle for 6 rounds before your next demanding task.");
    suggestions.push("Prioritize low-friction tasks for the next 2 hours and defer non-urgent decisions.");
  }

  if (stressLevel === "low") {
    suggestions.push("Protect your current momentum with a short evening reflection and light stretching.");
  }

  if (suggestions.length < 3) {
    suggestions.push("Schedule one 10-minute guided relaxation block in your calendar.");
    suggestions.push("Hydrate and maintain light posture checks every hour.");
  }

  return suggestions.slice(0, 5);
};