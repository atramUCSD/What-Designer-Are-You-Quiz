window.DESIGNER_TYPE_TEST = {
  // Replace these draft questions and weights with the Deep Research-backed version later.
  scale: [
    { value: 1, label: "Strongly disagree" },
    { value: 2, label: "Disagree" },
    { value: 3, label: "Neutral" },
    { value: 4, label: "Agree" },
    { value: 5, label: "Strongly agree" },
  ],
  types: [
    {
      id: "product",
      name: "Product Designer",
      color: "#d29b2f",
      summary: "You connect user needs, product direction, business tradeoffs, and interface quality.",
    },
    {
      id: "interaction",
      name: "UX Designer",
      color: "#2f9c95",
      summary: "You like shaping flows, information architecture, interaction patterns, and usability.",
    },
    {
      id: "research",
      name: "UX Researcher",
      color: "#3b79b7",
      summary: "You are motivated by evidence, ambiguity, interviews, synthesis, and stronger decisions.",
    },
    {
      id: "systems",
      name: "Design Systems Designer",
      color: "#7c5cbf",
      summary: "You care about scalable UI patterns, consistency, accessibility, and shared product language.",
    },
    {
      id: "technology",
      name: "Design Technologist",
      color: "#55a66f",
      summary: "You want to prototype, code, test feasibility, and turn design ideas into working software.",
    },
  ],
  questions: [
    {
      prompt: "I enjoy turning ambiguous product problems into a clear direction for a team.",
      weights: { product: 3, interaction: 1, research: 1 },
    },
    {
      prompt: "I would rather improve a messy user flow than create a polished visual mockup from scratch.",
      weights: { interaction: 3, systems: 1, product: 1 },
    },
    {
      prompt: "I like interviewing people, finding patterns, and explaining what the team misunderstood.",
      weights: { research: 3, product: 1 },
    },
    {
      prompt: "I notice inconsistent spacing, components, labels, and accessibility patterns quickly.",
      weights: { systems: 3, interaction: 1 },
    },
    {
      prompt: "I am willing to write code if it helps me prove whether an idea actually works.",
      weights: { technology: 3, systems: 1 },
    },
    {
      prompt: "I care about why a feature matters to the business, not just how the screen looks.",
      weights: { product: 3, research: 1 },
    },
    {
      prompt: "I enjoy prototyping small interactions until the behavior feels clear.",
      weights: { interaction: 2, technology: 2 },
    },
    {
      prompt: "I would rather run a study than debate opinions in a design critique.",
      weights: { research: 3 },
    },
    {
      prompt: "I like creating rules, tokens, components, and documentation that other designers can reuse.",
      weights: { systems: 3, technology: 1 },
    },
    {
      prompt: "I want enough engineering fluency to collaborate deeply with software engineers.",
      weights: { technology: 3, systems: 1, product: 1 },
    },
  ],
};
