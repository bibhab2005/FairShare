import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Github,
  Linkedin,
  Mail,
  FileDown,
  ArrowUpRight,
  GraduationCap,
  Briefcase,
  Award,
  Sparkles,
} from 'lucide-react';

/**
 * About page for FairShare.
 * Drop into src/pages/AboutUs.jsx and route it at /about.
 *
 * Needs, in your Vite `public/` folder:
 * - profile-photo.jpg
 * - resume.pdf
 */

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function AboutUs() {
  useEffect(() => {
    window.location.replace('https://portfolio-bi-bhab-personal.vercel.app/about');
  }, []);
  const githubHref = 'https://github.com/bibhab2005';
  const linkedinHref = 'https://linkedin.com/in/bibhab';
  const email = 'bibhabtalukdar2005@gmail.com';
  const resumeHref = '/resume.pdf';
  const portfolioHref =
    import.meta.env.VITE_PORTFOLIO_URL ||
    (import.meta.env.DEV ? 'http://localhost:3001' : 'https://portfolio-bi-bhab-personal.vercel.app/about');

  return (
    <div className="min-h-screen bg-[#FAFAF6] text-[#101014]">
      {/* ───────── HERO — dark, cinematic ───────── */}
      <section className="relative flex min-h-[90vh] flex-col justify-center overflow-hidden bg-[#05060A] px-6 py-24 text-white">
        <StarField />
        <div className="relative z-10 mx-auto w-full max-w-5xl">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-sm text-white/50"
          >
            final-year IT student · Vadodara, India
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
            className="mt-4 text-6xl font-black leading-[0.95] tracking-tight sm:text-8xl"
          >
            Bibhab
            <br />
            Talukdar
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
            className="mt-8 max-w-[52ch] text-lg leading-relaxed text-white/70 sm:text-xl"
          >
            I architect and ship full-stack products end to end — frontend,
            backend, database, and the deployment pipeline that gets it in
            front of real users. FairShare, the app you're on right now, is
            one of them.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.6 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <ActionButton href={portfolioHref} icon={Sparkles} label="Interactive Showcase" external primary />
            <ActionButton href={resumeHref} icon={FileDown} label="Resume" download />
            <ActionButton href={githubHref} icon={Github} label="GitHub" external />
            <ActionButton href={linkedinHref} icon={Linkedin} label="LinkedIn" external />
            <ActionButton href={`mailto:${email}`} icon={Mail} label="Email" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, rotate: -8, scale: 0.9 }}
          animate={{ opacity: 1, rotate: -3, scale: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.3 }}
          className="absolute right-10 top-24 hidden w-40 rotate-[-3deg] rounded-xl border-[5px] border-white/90 bg-white/90 p-1 shadow-[0_20px_60px_rgba(0,0,0,0.5)] sm:block lg:w-52"
        >
          <img
            src="/profile-photo.jpg"
            alt="Bibhab Talukdar"
            className="aspect-[4/5] w-full rounded-md object-cover"
          />
        </motion.div>
      </section>

      {/* ───────── SUMMARY ───────── */}
      <Reveal className="border-b border-black/10 bg-white px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="max-w-[68ch] text-lg leading-relaxed text-[#3D4644]">
            Hands-on experience building full-stack products with React,
            Node.js, and Python/Django, plus applied machine learning and
            LLM-powered features. Comfortable designing REST APIs,
            integrating LLM APIs (Google Gemini) with prompt engineering, and
            debugging multi-service architectures across frontend, backend,
            and database layers — with a strong DSA foundation in Java and a
            track record of shipping production-ready systems independently.
          </p>
        </div>
      </Reveal>

      {/* ───────── SKILLS ───────── */}
      <Reveal className="bg-white px-6 pb-16">
        <div className="mx-auto max-w-5xl">
          <SkillGroup label="Languages" items={['Python', 'JavaScript', 'Java', 'HTML/CSS', 'SQL']} />
          <SkillGroup
            label="Frameworks & libraries"
            items={['React', 'Node.js', 'Express.js', 'Django', '.NET', 'Streamlit']}
          />
          <SkillGroup label="Databases" items={['PostgreSQL', 'MongoDB (Atlas)', 'MySQL', 'SQLite']} />
          <SkillGroup
            label="Tools & platforms"
            items={['Git/GitHub', 'REST APIs', 'Google Gemini API', 'Postman', 'Vercel', 'Render', 'spaCy', 'NLTK']}
          />
          <SkillGroup
            label="Core concepts"
            items={['DSA', 'OOP', 'DBMS', 'Operating Systems', 'Computer Networks', 'System Design']}
          />
        </div>
      </Reveal>

      {/* ───────── EXPERIENCE ───────── */}
      <Reveal className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <SectionHeading icon={Briefcase} label="experience" />
          <div className="mt-6 border-l-2 border-[#2B4EFF] pl-6">
            <p className="text-sm text-[#5B6864]">June 2026 – July 2026</p>
            <h3 className="mt-1 text-2xl font-bold">
              Full-Stack Development Intern
              <span className="font-normal text-[#5B6864]"> · Navodita Infotech (Remote)</span>
            </h3>
            <ul className="mt-3 max-w-[68ch] list-disc space-y-2 pl-5 text-[#3D4644]">
              <li>
                Architected and deployed FairShare — a 3-tier MERN
                expense-splitting app with independently deployed frontend
                (Vercel) and backend (Render), using MongoDB/Mongoose and a
                React (Vite) + Tailwind frontend.
              </li>
              <li>
                Engineered 10+ REST API endpoints with Node.js and Express
                for secure authentication (Passport.js, Google OAuth 2.0,
                JWT, bcryptjs), group creation, and real-time expense
                logging.
              </li>
              <li>
                Delivered 4 core modules — authentication, group management,
                expense tracking, and balance settlement — including a
                centralized debt-calculation algorithm that automates
                peer-to-peer settlements, visualized with Recharts for a responsive UX.
              </li>
            </ul>
          </div>
        </div>
      </Reveal>

      {/* ───────── PROJECTS ───────── */}
      <Reveal className="bg-white px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm text-[#5B6864]">what I've built</p>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ProjectCard
              title="FairShare"
              tag="this site"
              tags={['MERN', 'Passport.js', 'Vercel']}
              blurb="A 3-tier expense-splitting app with dual auth, real-time expense logging, and a debt-simplification engine that minimizes settlements."
            />
            <ProjectCard
              title="WanderMate"
              tags={['React', 'Django REST', 'Gemini API']}
              blurb="A companion-matching app pairing travelers via spatial indexing and Jaccard similarity, with Gemini-powered itinerary generation and CSRF-secured, CORS-locked architecture."
            />
            <ProjectCard
              title="SkillScan-AI"
              tags={['MERN', 'Local NLP']}
              blurb="A privacy-first resume analyzer running entirely on local NLP — no external AI calls — validated via Postman across 10+ integration checks."
            />
            <ProjectCard
              title="TravelLoop AI"
              tags={['Django', 'PostgreSQL', 'spaCy']}
              blurb="An NLP travel planner with a custom NLU pipeline (spaCy + NLTK) extracting destinations, budgets, and dates, backed by a Django ORM/PostgreSQL schema."
            />
          </div>
        </div>
      </Reveal>

      {/* ───────── EDUCATION ───────── */}
      <Reveal className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <SectionHeading icon={GraduationCap} label="education" />
          <div className="mt-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
            <div>
              <h3 className="text-xl font-bold">Parul University</h3>
              <p className="text-[#3D4644]">B.Tech in Information Technology · Gujarat, India</p>
            </div>
            <p className="text-sm text-[#5B6864]">2023 – 2027 · CGPA 7.37/10</p>
          </div>
        </div>
      </Reveal>

      {/* ───────── CERTIFICATIONS & ACHIEVEMENTS ───────── */}
      <Reveal className="bg-white px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <SectionHeading icon={Award} label="certifications & achievements" />
          <ul className="mt-6 max-w-[68ch] list-disc space-y-2 pl-5 text-[#3D4644]">
            <li>Solved 100+ LeetCode problems in Java — arrays, strings, hashmaps, binary search, two pointers, stacks, and queues.</li>
            <li>The Complete Full-Stack Web Development Bootcamp — Udemy, Dr. Angela Yu (62 hours, May 2026).</li>
            <li>NPTEL Certification — Computer Networks and Internet Protocol, IIT Kharagpur (Jan–Apr 2025).</li>
            <li>Presented CashWise, an AI-driven checkout automation system built with Pine Labs APIs, at Ideathon 4.0.</li>
            <li>Participated in the Parul University Environment Hackathon 2026.</li>
          </ul>
        </div>
      </Reveal>

      {/* ───────── FOOTER CTA ───────── */}
      <Reveal className="px-6 py-20">
        <div className="mx-auto max-w-5xl rounded-2xl bg-[#101014] px-8 py-12 text-white sm:px-14">
          <h3 className="text-3xl font-black tracking-tight sm:text-4xl">
            Open to internships and full-time roles.
          </h3>
          <p className="mt-3 max-w-[50ch] text-white/70">
            Best way to reach me is email — I check it more than anything
            else on this list.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ActionButton href={portfolioHref} icon={Sparkles} label="Open Interactive Showcase" external inverted />
            <ActionButton href={`mailto:${email}`} icon={Mail} label={email} inverted />
            <ActionButton href={resumeHref} icon={FileDown} label="Download resume" download inverted />
          </div>
        </div>
      </Reveal>
    </div>
  );
}

/* ---------- building blocks ---------- */

function Reveal({ children, className = '' }) {
  return (
    <motion.section
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
    >
      {children}
    </motion.section>
  );
}

function SectionHeading({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[#5B6864]">
      <Icon size={16} strokeWidth={1.75} />
      <span>{label}</span>
    </div>
  );
}

function SkillGroup({ label, items }) {
  return (
    <div className="mb-6 last:mb-0">
      <p className="text-sm text-[#5B6864]">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-black/15 px-3 py-1 text-sm text-[#101014] transition-colors hover:border-[#FF5B77] hover:text-[#FF5B77]"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function ActionButton({ href, icon: Icon, label, external, download, primary, inverted }) {
  const base =
    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-transform hover:-translate-y-0.5';
  const style = inverted
    ? 'bg-white text-[#101014]'
    : primary
    ? 'bg-[#FF5B77] text-white'
    : 'bg-white/10 text-white backdrop-blur-sm border border-white/20';

  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      {...(download ? { download: true } : {})}
      className={`${base} ${style}`}
    >
      <Icon size={16} strokeWidth={2} />
      {label}
      {external && <ArrowUpRight size={14} strokeWidth={2} />}
    </a>
  );
}

function ProjectCard({ title, tags, blurb, tag }) {
  return (
    <div className="rounded-2xl border border-black/10 p-6 transition-colors hover:border-[#2B4EFF]">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-lg font-bold">{title}</h4>
        {tag && (
          <span className="rounded-full bg-[#FF5B77] px-2 py-0.5 text-xs font-medium text-white">
            {tag}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[#3D4644]">{blurb}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="rounded-full bg-[#F2F3ED] px-2.5 py-0.5 text-xs text-[#3D4644]">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Lightweight canvas starfield — no libraries, ~60 slow-drifting points.
 * Respects prefers-reduced-motion by rendering static stars, no animation loop.
 */
function StarField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let stars = [];

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      const count = Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 9000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.3 * devicePixelRatio + 0.3,
        s: Math.random() * 0.15 + 0.02,
        o: Math.random() * 0.6 + 0.3,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FFFFFF';
      for (const star of stars) {
        ctx.globalAlpha = star.o;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
        if (!reduceMotion) {
          star.y -= star.s * devicePixelRatio;
          if (star.y < 0) star.y = canvas.height;
        }
      }
      ctx.globalAlpha = 1;
      if (!reduceMotion) raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full opacity-70" />;
}
