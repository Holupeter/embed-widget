export const MOCK_TOUR = {
  tourId: "tour_demo",
  steps: [
    {
      step: 1,
      targetId: "#signup-btn", // We will put this ID in our test file
      title: "👋 Welcome!",
      description: "Click here to create an account.",
      position: "bottom"
    },
    {
      step: 2,
      targetId: "#features-section",
      title: "🚀 Features",
      description: "Check out what our tool can do.",
      position: "right"
    },
    {
      step: 3,
      targetId: "#pricing-card",
      title: "💰 Pricing",
      description: "Start for free, upgrade anytime.",
      position: "left"
    }
  ]
};