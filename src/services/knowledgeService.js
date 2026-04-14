/**
 * KnowledgeService - The global "Brain" of Job Genie.
 * Contains platform policies, FAQ, safety guidelines, and wellness tips.
 */

export const GLOBAL_KNOWLEDGE = {
  platform: {
    name: "Job Genie",
    vision: "Empowering gig workers with instant opportunities and financial security.",
    ratingSystem: "Workers are rated by site managers on a 1-5 scale. Maintaining a 4.5+ average rating unlocks 'Premium Gigs'.",
    paymentCycle: "Payments are processed within 24 hours of job completion. Weekend work is settled on Monday.",
    verification: "Users must upload a valid ID and a clear selfie to be verified for tasks."
  },
  faq: [
    { q: "How do I get paid?", a: "Payments are made via UPI or direct bank transfer once the manager approves the task." },
    { q: "Can I cancel a job?", a: "Cancellations made 2 hours before the shift start are penalty-free. Late cancellations may affect your rating." },
    { q: "What is Genie Loan?", a: "Workers with 30+ completed jobs can apply for interest-free micro-loans based on their average earnings." }
  ],
  safety: {
    generalTips: [
      "Always check in using your registered device.",
      "Wear appropriate safety gear (boots/gloves) if required by the job description.",
      "Report any unsafe working conditions immediately via the 'Emergency' button."
    ],
    nightShift: "For night shifts, use our 'Track My Trip' feature to share your location with a trusted contact."
  },
  finance: {
    savings: "We recommend setting aside 15% of daily earnings for emergencies.",
    taxation: "Most gig work falls under 'Professional Services'. If your annual turnover exceeds ₹20 Lakhs, GST registration is required."
  }
};

export const knowledgeService = {
  getKnowledge: () => GLOBAL_KNOWLEDGE,
  getFaqs: () => GLOBAL_KNOWLEDGE.faq,
  getSafetyTips: () => GLOBAL_KNOWLEDGE.safety
};
