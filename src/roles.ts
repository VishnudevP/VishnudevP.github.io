/** The timeline starts when university did: September 2022. */
export const FIRST_YEAR = 2022;
export const FIRST_MONTH = 9;

/** Months since the timeline's first month; month is 1–12. Earlier months are negative. */
export const monthIndex = (year: number, month: number): number => (year - FIRST_YEAR) * 12 + (month - FIRST_MONTH);

/** A row of a timeline grid. Roles use work and school; the life side has its own rows (see life.ts). */
export interface Track {
  id: string;
  name: string;
}

export const tracks: readonly Track[] = [
  { id: 'work', name: 'Work' },
  { id: 'school', name: 'School' },
];

export interface Role {
  id: string;
  track: string;
  company: string;
  /** Shorter name for the labels under the grid. */
  short: string;
  title: string;
  dates: string;
  /** First and last month, as monthIndex values. Versine's are set to the current month at runtime. */
  start: number;
  end: number;
  /** Hue (oklch angle) for this role's cells, labels and bullets. Versine uses ink instead. */
  hue?: number;
  /** Versine: still going, so it runs to the current month, which gets the pulsing "now" marker. */
  now?: boolean;
  /** School terms: a study term or a co-op term, drawn in neutral ink rather than a role colour. */
  term?: 'study' | 'coop';
  /** School terms: courses in the term they were first taken, as [code, name]. Grades and retakes are left out. */
  courses?: [code: string, name: string][];
  summary: string;
  metrics?: [value: string, label: string][];
  points: string[];
  stack?: string[];
  link?: [label: string, href: string];
  location?: string;
  /** Life entries: a photo shown in the details, as [src, alt]. */
  photo?: [src: string, alt: string];
  note?: string;
}

/** Newest first. Wording follows the rest of the site. */
export const roles: Role[] = [
  {
    id: 'versine', track: 'work', company: 'Versine', short: 'Versine', title: 'Co-founder', dates: 'Sep 2026 – now',
    start: monthIndex(2026, 9), end: monthIndex(2026, 9), now: true,
    summary: 'Let your agent send and receive money.',
    points: [
      'Ask ChatGPT, Claude or Siri to pay a friend, split a bill or settle an invoice, within limits you set and with payments only you can approve.',
      'The waitlist is open now.',
    ],
    link: ['versine.com', 'https://versine.com/'],
  },
  {
    id: 'amazon', track: 'work', company: 'Amazon', short: 'Amazon', title: 'Software Engineer Intern, Amazon Ads', dates: 'May – Aug 2026',
    start: monthIndex(2026, 5), end: monthIndex(2026, 8), hue: 55,
    summary: 'Built tools to test interfaces and control dashboard widgets with natural language.',
    metrics: [['60+', 'rendered states validated'], ['<8 min', 'per validation run'], ['3', 'customer-facing regressions caught before release']],
    points: [
      'Built a Playwright and TypeScript framework that generated UI tests with a language model. It caught three customer-facing regressions before release.',
      'Built a React and TypeScript assistant that used natural-language requests to control three types of dashboard widget.',
      'Added UI validation to an eight-stage CI/CD pipeline with AWS CDK, blocking releases when checks failed.',
    ],
    stack: ['Playwright', 'TypeScript', 'React', 'LLM tool-calling', 'AWS CDK'],
    location: 'Toronto, ON',
  },
  {
    id: 'opentext', track: 'work', company: 'OpenText', short: 'OpenText', title: 'Software Engineer Intern', dates: 'Jan – Apr 2026',
    start: monthIndex(2026, 1), end: monthIndex(2026, 4), hue: 255,
    summary: 'Combined CDN, origin, and analytics data for traffic analysis.',
    points: [
      'Consolidated IIS, Akamai CDN, and Google Analytics logs in Graylog and OpenSearch, processing 3M+ events a month.',
      'Standardized log formats to analyze 10M+ historical events across traffic sources.',
      'Built a reporting dashboard using Angular, Node.js, and PostgreSQL.',
    ],
    stack: ['Graylog', 'OpenSearch', 'Python', 'Angular', 'Node.js', 'PostgreSQL'],
    location: 'Waterloo, ON',
  },
  {
    id: 'ground', track: 'work', company: 'Ground News', short: 'Ground News', title: 'Software Engineer Intern', dates: 'May – Aug 2025',
    start: monthIndex(2025, 5), end: monthIndex(2025, 8), hue: 22,
    summary: 'Improved article relevance and backend performance.',
    points: [
      'Rebuilt the retrieval and ranking engine with Elasticsearch, Redis, and TypeScript.',
      'Partitioned the database and deployed AWS microservices to support 500K+ monthly readers.',
    ],
    stack: ['Elasticsearch', 'Redis', 'TypeScript', 'AWS EC2', 'S3', 'CloudFront'],
    location: 'Toronto, ON',
  },
  {
    id: 'magnify', track: 'work', company: 'Magnify Digital', short: 'Magnify', title: 'Software Engineer Intern', dates: 'Sep 2024 – Mar 2025',
    start: monthIndex(2024, 9), end: monthIndex(2025, 3), hue: 78,
    summary: 'Built reporting tools and data pipelines for marketing teams.',
    points: [
      'Built real-time ad analytics with Next.js, TypeScript, and GraphQL, improving reporting accuracy by 30%.',
      'Built AWS Lambda and RDS pipelines that combined third-party data from millions of daily ad impressions.',
    ],
    stack: ['Next.js', 'TypeScript', 'GraphQL', 'AWS Lambda', 'RDS'],
    location: 'Vancouver, BC',
  },
  {
    id: 'shyftlabs', track: 'work', company: 'ShyftLabs', short: 'ShyftLabs', title: 'Software Engineer Intern', dates: 'May – Aug 2024',
    start: monthIndex(2024, 5), end: monthIndex(2024, 8), hue: 150,
    summary: 'Built dashboards and backend services for Carter, a retail media platform.',
    points: [
      'Built Next.js and React campaign dashboards, improving ad-reporting accuracy by 25%.',
      'Built ad-delivery services with Kotlin, Spring Boot, and GraphQL, reducing response times by 30%.',
    ],
    stack: ['Next.js', 'React', 'Kotlin', 'Spring Boot', 'GraphQL'],
    location: 'Toronto, ON',
  },
  {
    id: 'wenu', track: 'work', company: 'WENU', short: 'WENU', title: 'Full-Stack Developer Intern', dates: 'Jun – Sep 2023',
    start: monthIndex(2023, 6), end: monthIndex(2023, 9), hue: 200,
    summary: 'Worked on payment integration, backend code, and bug fixes.',
    points: [
      'Integrated Stripe payments and updated backend flows in PHP and SQL.',
      'Used Cypress and Sentry to investigate website issues.',
    ],
    stack: ['Stripe', 'PHP', 'SQL', 'Cypress', 'Sentry'],
  },
  {
    id: 'sashido', track: 'work', company: 'Sashido', short: 'Sashido', title: 'Software Engineer Intern', dates: 'Aug – Nov 2021',
    start: monthIndex(2021, 8), end: monthIndex(2021, 11), hue: 300,
    summary: 'Created a sample app and tutorial for Sashido’s platform.',
    points: [
      'Built a sample app using Sashido and Google’s Teachable Machine.',
      'Tested the platform and suggested improvements to the website.',
    ],
    stack: ['Teachable Machine'],
    note: 'Before university, so it sits before the timeline starts.',
  },
  {
    id: 'beacon', track: 'work', company: 'Beacon', short: 'Beacon', title: 'Project', dates: '2020 – 2021',
    start: monthIndex(2020, 1), end: monthIndex(2021, 12), hue: 330,
    summary: 'A community-sourced platform for tracking local store inventory and wait times during supply shortages.',
    points: [
      'Built a Flask API with robust input validation, and designed MongoDB schemas for geolocated reports.',
      'Implemented a React and Redux frontend with real-time updates and moderation tools to keep the data accurate.',
    ],
    stack: ['Python', 'Flask', 'MongoDB', 'React', 'Redux', 'SCSS'],
    note: 'Before university, so it sits before the timeline starts.',
  },
];

const PROGRAM = 'Management Engineering, Honours, Co-operative Program';
const study = (id: string, level: string, season: string, dates: string, start: number, end: number, courses: [string, string][]): Role => ({
  id, track: 'school', term: 'study', company: `${level} · ${season}`, short: level, title: `Study term · ${PROGRAM}`, dates, start, end,
  summary: `Study term ${level} at the University of Waterloo.`, points: [], courses,
});
const coop = (id: string, label: string, season: string, dates: string, start: number, end: number, courses: [string, string][], summary: string): Role => ({
  id, track: 'school', term: 'coop', company: `${label} · ${season}`, short: label, title: `Co-op term · ${PROGRAM}`, dates, start, end,
  summary, points: [], courses,
});

/** University of Waterloo terms, newest first, from the unofficial transcript. Courses only: no grades, no retakes. */
export const terms: Role[] = [
  coop('coop-5', 'Work term 5', 'Fall 2026', 'Sep – Dec 2026', monthIndex(2026, 9), monthIndex(2026, 12), [], 'Fifth co-op work term, in progress.'),
  study('4a', '4A', 'Spring 2026', 'May – Aug 2026', monthIndex(2026, 5), monthIndex(2026, 8), [
    ['ECE 452', 'Software Design and Architectures'],
    ['MSE 401', 'Management Engineering Design Project 1'],
    ['MSE 434', 'Supply Chain Management'],
    ['MSE 436', 'Decision Support Systems'],
    ['MSE 442', 'Impact of Information Systems on Organizations and Society'],
  ]),
  coop('coop-4', 'Work term 4', 'Winter 2026', 'Jan – Apr 2026', monthIndex(2026, 1), monthIndex(2026, 4), [], 'Fourth co-op work term.'),
  study('3b', '3B', 'Fall 2025', 'Sep – Dec 2025', monthIndex(2025, 9), monthIndex(2025, 12), [
    ['MSE 302', 'Engineering Design Methods'],
    ['MSE 332', 'Deterministic Optimization Models and Methods'],
    ['MSE 333', 'Simulation Analysis and Design'],
    ['MSE 343', 'Human-Computer Interaction'],
    ['MSE 541', 'Search Engines'],
  ]),
  coop('coop-3', 'Work term 3', 'Spring 2025', 'May – Aug 2025', monthIndex(2025, 5), monthIndex(2025, 8), [['PD 22', 'Professionalism and Ethics in Engineering Practice']], 'Third co-op work term.'),
  study('3a', '3A', 'Winter 2025', 'Jan – Apr 2025', monthIndex(2025, 1), monthIndex(2025, 4), [
    ['MSE 211', 'Organizational Behaviour'],
    ['MSE 334', 'Operations Planning and Inventory Control'],
    ['MSE 342', 'Principles of Software Engineering'],
    ['MSE 391', 'Work-Term Report'],
    ['MSE 431', 'Stochastic Models and Methods'],
    ['MSE 446', 'Introduction to Machine Learning'],
  ]),
  coop('coop-2', 'Work term 2', 'Fall 2024', 'Sep – Dec 2024', monthIndex(2024, 9), monthIndex(2024, 12), [['PD 11', 'Processes for Technical Report Writing']], 'Second co-op work term.'),
  study('2b', '2B', 'Spring 2024', 'May – Aug 2024', monthIndex(2024, 5), monthIndex(2024, 8), [
    ['MSCI 245', 'Databases and Software Design'],
    ['MSCI 253', 'Probability and Statistics 2'],
    ['MSCI 263', 'Managerial Economics'],
    ['MSCI 331', 'Introduction to Optimization'],
    ['EARTH 123', 'Introductory Hydrology'],
  ]),
  coop('coop-term', 'Co-op term', 'Winter 2024', 'Jan – Apr 2024', monthIndex(2024, 1), monthIndex(2024, 4), [['PD 20', 'Strategies for Career Success']], 'Co-op term.'),
  study('2a', '2A', 'Fall 2023', 'Sep – Dec 2023', monthIndex(2023, 9), monthIndex(2023, 12), [
    ['MSCI 240', 'Algorithms and Data Structures'],
    ['MSCI 251', 'Probability and Statistics 1'],
    ['MSCI 261', 'Engineering Economics: Financial Management for Engineers'],
    ['MSCI 271', 'Advanced Calculus and Numerical Methods'],
    ['SCI 238', 'Introductory Astronomy'],
  ]),
  coop('coop-1', 'Work term 1', 'Spring 2023', 'May – Aug 2023', monthIndex(2023, 5), monthIndex(2023, 8), [
    ['PD 19', 'Tactics for Workplace Success'],
  ], 'First co-op work term.'),
  study('1b', '1B', 'Winter 2023', 'Jan – Apr 2023', monthIndex(2023, 1), monthIndex(2023, 4), [
    ['MSCI 121', 'Introduction to Computer Programming'],
    ['MSCI 131', 'Work Design and Facilities Planning'],
    ['GENE 123', 'Electrical Circuits and Instrumentation'],
    ['MATH 118', 'Calculus 2 for Engineering'],
    ['PHYS 125', 'Physics for Engineers'],
    ['ARTS 190', 'Communication in the Engineering Profession'],
  ]),
  study('1a', '1A', 'Fall 2022', 'Sep – Dec 2022', monthIndex(2022, 9), monthIndex(2022, 12), [
    ['MSCI 100', 'Management Engineering Concepts'],
    ['MATH 115', 'Linear Algebra for Engineering'],
    ['MATH 116', 'Calculus 1 for Engineering'],
    ['CHE 102', 'Chemistry for Engineers'],
    ['PHYS 115', 'Mechanics'],
  ]),
];
