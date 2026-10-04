import { prisma } from "@/lib/prisma";

export type HomeContent = {
  heroTagline: string;
  slides: { image: string; caption: string }[];
  welcomeTitle: string;
  welcomeText: string;
  stats: { label: string; value: number; suffix: string }[];
  missionVision: { title: string; summary: string; details: string[] }[];
  principalMessage: string;
  testimonials: { quote: string; name: string; role: string }[];
};

export type AboutContent = {
  title: string;
  sections: { heading: string; text: string; image: string; imageAlt: string }[];
};

export type ContactContent = {
  title: string;
  intro: string;
  hours: string;
};

export type PageContentMap = {
  home: HomeContent;
  about: AboutContent;
  contact: ContactContent;
};

export type PageKey = keyof PageContentMap;

export const PAGE_KEYS: PageKey[] = ["home", "about", "contact"];

export const PAGE_LABELS: Record<PageKey, { title: string; description: string; href: string }> = {
  home: { title: "Home", description: "Hero slider, welcome, stats, mission, principal's note, testimonials", href: "/" },
  about: { title: "About Us", description: "Page title and the two image + text sections", href: "/about" },
  contact: { title: "Contact Us", description: "Page title, intro text and office hours", href: "/contact" },
};

export const DEFAULTS: PageContentMap = {
  home: {
    heroTagline:
      "Nurturing curiosity, character, and confidence — building the foundation for every student's future.",
    slides: [
      { image: "/images/hero/classroom.jpg", caption: "Focused Learning, Every Day" },
      { image: "/images/hero/sports-day.jpg", caption: "Sports & Active Living" },
      { image: "/images/hero/assembly.jpg", caption: "A Community That Stands Together" },
    ],
    welcomeTitle: "Welcome to SBMSIC",
    welcomeText:
      "We are delighted to welcome you to {schoolName}. For generations, our school has been a place where students discover their potential, build lasting friendships, and prepare for a bright future. Whether you're a prospective parent, a current student, or a member of our alumni family, we invite you to explore all that our school community has to offer.",
    stats: [
      { label: "Years of Excellence", value: 25, suffix: "+" },
      { label: "Students Enrolled", value: 500, suffix: "+" },
      { label: "Dedicated Faculty", value: 30, suffix: "+" },
      { label: "Board Result", value: 95, suffix: "%" },
    ],
    missionVision: [
      {
        title: "Mission",
        summary:
          "To nurture every student to realize their own potential and become responsible, capable citizens.",
        details: [
          "Provide a well-rounded, values-based education for every child.",
          "Encourage curiosity, critical thinking, and lifelong learning.",
          "Build confident individuals ready to contribute to society.",
        ],
      },
      {
        title: "Vision",
        summary:
          "To prepare our children for life by broadening their horizons and deepening their character.",
        details: [
          "Foster empathy, honesty, humility, and discipline.",
          "Help students face challenges with resilience and integrity.",
          "Build a community where every student feels valued and supported.",
        ],
      },
      {
        title: "Focus",
        summary: "A pedagogy that blends academics, technology, and holistic development.",
        details: [
          "Strong grounding in sciences, arts, and languages.",
          "Hands-on exposure to technology and digital skills.",
          "A safe, respectful environment where every child is protected and heard.",
        ],
      },
    ],
    principalMessage:
      "Every child who walks through our gates carries a world of promise. Our goal at {schoolName} is to nurture that promise with care, discipline, and encouragement — helping each student grow into a confident, capable, and compassionate individual ready to take on the world.",
    testimonials: [
      {
        quote:
          "The teachers here go above and beyond to make sure every child feels seen. My daughter has grown so much in confidence since joining.",
        name: "A Parent",
        role: "Class VI",
      },
      {
        quote:
          "Small class sizes and genuinely caring staff. It feels like an extended family, not just a school.",
        name: "A Parent",
        role: "Class IX",
      },
      {
        quote:
          "I made lifelong friends and found my love for science here. Forever grateful to my teachers.",
        name: "An Alumnus",
        role: "Batch of 2022",
      },
    ],
  },
  about: {
    title: "About Our School",
    sections: [
      {
        heading: "Learning With Purpose",
        text: "{schoolName} is committed to providing quality education in a safe, supportive environment where every student is encouraged to grow academically, socially, and personally. Our experienced faculty and well-equipped classrooms help each child build confidence, strong values, and the habits of a lifelong learner.",
        image: "/images/hero/classroom.jpg",
        imageAlt: "Students focused on their classwork",
      },
      {
        heading: "Beyond the Classroom",
        text: "Education here is about more than examinations. Through sports, co-curricular activities, and a close-knit school community, students learn teamwork, discipline, and resilience — qualities that prepare them not only for the next class, but for life.",
        image: "/images/hero/sports-day.jpg",
        imageAlt: "Students playing on the school sports field",
      },
    ],
  },
  contact: {
    title: "Contact Us",
    intro: "",
    hours: "",
  },
};

// Stored values win over defaults. Arrays are merged index-by-index so a
// stored row written before a field existed still picks up its default.
function merge<T>(defaults: T, stored: unknown): T {
  if (Array.isArray(defaults)) {
    if (!Array.isArray(stored)) return defaults;
    return stored.map((item, i) =>
      i < defaults.length && typeof defaults[i] === "object"
        ? merge(defaults[i], item)
        : item,
    ) as T;
  }
  if (defaults && typeof defaults === "object") {
    if (!stored || typeof stored !== "object") return defaults;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(defaults)) {
      out[key] = merge(
        (defaults as Record<string, unknown>)[key],
        (stored as Record<string, unknown>)[key],
      );
    }
    return out as T;
  }
  return typeof stored === typeof defaults ? (stored as T) : defaults;
}

export async function getPageContent<K extends PageKey>(key: K): Promise<PageContentMap[K]> {
  const row = await prisma.pageContent.findUnique({ where: { key } });
  if (!row) return DEFAULTS[key];
  try {
    return merge(DEFAULTS[key], JSON.parse(row.data));
  } catch {
    return DEFAULTS[key];
  }
}

export function fillSchoolName(text: string, schoolName: string) {
  return text.replaceAll("{schoolName}", schoolName);
}
