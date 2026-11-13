// The example roast shown by "See an example roast". It roasts the made-up resume in
// samples/ (an invented student, college and contact details). Shown only on the
// labelled example state, never as a real AI answer.

export const DEMO = {
  isResume: true,
  heat: 4,
  roast: [
    '‘Proficient in MS Word’ is not a skill. It is a confession.',
    '5 projects. 4 of them are to-do apps.',
    '‘Team player’ appears 6 times. Your team would like a word.',
    'You won a hackathon and buried it at project number 5. Witness protection, but for achievements.',
  ],
  score: 4.5,
  verdict: 'Real skills, buried under buzzwords and to-do apps.',
  fixes: [
    {
      title: 'Put the hackathon win first',
      how: 'Open Projects with the Lost & Found portal: “1st of 46 teams, 300+ students used it in week one.” Cut three of the to-do apps.',
    },
    {
      title: 'Numbers, not adjectives',
      how: 'Before: ‘Worked on various tasks given by the mentor.’ After: ‘Built the signup and dashboard pages in React for 2 client sites.’',
    },
    {
      title: 'One page. Not two.',
      how: 'Delete the Objective, Strengths, Hobbies, Personal Details and Declaration. Recruiters skip them, and the rest fits on one page.',
    },
  ],
  redact: [
    'Kabir Mehta',
    'kabir.mehta.dev@example.com',
    '+91 98765 43210',
    'Sunrise Institute of Technology',
    'linkedin.com/in/kabir-mehta-example',
    'github.com/kabir-example',
  ],
};
