import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';

interface Section {
  title: string;
  paragraphs: string[];
}

const SECTIONS: Section[] = [
  {
    title: "1. Agreement",
    paragraphs: [
      "By downloading, accessing, or using Sound Voyage, you agree to these Terms. If you do not agree, you must discontinue use of the platform immediately."
    ]
  },
  {
    title: "2. Service Description",
    paragraphs: [
      "Sound Voyage is an educational platform designed to assist with phonetic learning and speech practice through interactive mini-games (e.g., Phoneme Pop, Sound Synk). The service provides separate portals for students (\"Progressors\"), Parents, and Practitioners. Features include gameplay telemetry tracking, task assignments, progress analytics, and account linking. Features and availability may change across updates."
    ]
  },
  {
    title: "3. Eligibility & Supervision",
    paragraphs: [
      "You represent that you are legally able to enter into a contract. If you are a minor, you may only use the Progressor application under the direct supervision and authorization of a legally responsible Parent or a certified Practitioner who has secured the necessary parental consent to link your account."
    ]
  },
  {
    title: "4. Accounts, Security & Linking",
    paragraphs: [
      "Sound Voyage utilizes role-based accounts (Progressor, Parent, Practitioner) secured via Supabase Authentication. You are responsible for safeguarding your login credentials.",
      "Parents: You may only link to a Progressor account using a valid Progressor ID that belongs to your legal child or dependent.",
      "Practitioners: You may only assign, track, and manage Progressors who are actively under your professional care.",
      "Unauthorized attempts to link, hijack, or access profiles belonging to other users are strictly prohibited and will result in immediate account termination."
    ]
  },
  {
    title: "5. Data Storage & Privacy",
    paragraphs: [
      "Sound Voyage stores user profiles, game session telemetry (scores, accuracy, time taken), and assigned levels in our secure database. Row Level Security (RLS) ensures that Progressor data is only visible to the specific child, their linked Parent, and their assigned Practitioner. You are responsible for ensuring your device remains secure when accessing sensitive performance dashboards."
    ]
  },
  {
    title: "6. Educational & Clinical Disclaimer",
    paragraphs: [
      "Sound Voyage is an educational tool designed to support learning. It is not a medical device, nor is it a replacement for professional speech-language pathology, medical diagnosis, or certified clinical therapy. Practitioners using the analytics dashboard should use the telemetry data as supplemental information only. We do not guarantee any specific educational or therapeutic outcomes."
    ]
  },
  {
    title: "7. Acceptable Use",
    paragraphs: [
      "You agree not to: reverse-engineer the application; attempt to bypass Row Level Security or Route Guards; manipulate URL parameters to access unauthorized dashboards; submit false telemetry data; or use the platform to harass or misrepresent information."
    ]
  },
  {
    title: "8. Intellectual Property",
    paragraphs: [
      "All Sound Voyage branding, interface designs, game mechanics, and software code are the exclusive property of the application's developers. We grant you a personal, non-exclusive, non-transferable license to use the app for its intended educational purposes."
    ]
  },
  {
    title: "9. Disclaimers",
    paragraphs: [
      "THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE,” WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING FITNESS FOR A PARTICULAR PURPOSE."
    ]
  },
  {
    title: "10. Limitation of Liability",
    paragraphs: [
      "TO THE MAXIMUM EXTENT PERMITTED BY LAW, SOUND VOYAGE AND ITS DEVELOPERS WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SERVICE."
    ]
  },
  {
    title: "11. Modifications",
    paragraphs: [
      "We reserve the right to modify these Terms at any time. Continued use of the platform after changes are posted constitutes your acceptance of the new Terms."
    ]
  },
  {
    title: "12. Contact",
    paragraphs: [
      "info@samvidhpsychservices.org"
    ]
  }
];

export default function TermsOfUse() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-secondary/30 relative overflow-x-hidden font-poppins text-foreground">
      {/* Mesh gradient background effect matching LandingPage / NotFound */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,99,71,0.06),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,99,71,0.1),transparent_50%)] pointer-events-none" />

      {/* Floating abstract decorative shapes (sound waves theme) */}
      <div className="absolute top-1/4 left-1/10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-80 h-80 bg-primary/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto py-12 px-6">
        {/* Navigation / Header controls */}
        <header className="flex justify-between items-center mb-8 border-b border-border/10 pb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button variant="ghost" asChild className="hover:text-primary rounded-[2rem] hover:bg-primary/10">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </motion.div>
          
          <ThemeToggle />
        </header>

        {/* Glassmorphic Content Card */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-card/45 dark:bg-card/30 backdrop-blur-xl border border-border/40 dark:border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
        >
          {/* Main Title & Subtitle */}
          <div className="mb-10 text-center md:text-left">
            <h1 className="font-zilla text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3">
              Terms of Use
            </h1>
            <p className="text-sm text-muted-foreground font-poppins">
              Effective Date: June 30, 2026
            </p>
          </div>

          {/* Legal Sections */}
          <div className="space-y-4">
            {SECTIONS.map((section, index) => {
              const match = section.title.match(/^(\d+)\.\s*(.*)$/);
              const number = match ? match[1] : (index + 1).toString();
              const name = match ? match[2] : section.title;

              return (
                <div key={index} className="bg-secondary/40 p-5 rounded-2xl border border-border/50">
                  <h3 className="font-semibold text-primary mb-2 flex items-center gap-2 text-base md:text-lg">
                    <span className="flex items-center justify-center w-6 h-6 min-w-[1.5rem] rounded-full bg-primary/10 text-xs text-primary font-bold">
                      {number}
                    </span>
                    <span className="font-zilla font-bold">{name}</span>
                  </h3>
                  <div className="text-sm opacity-90 pl-8 space-y-3 leading-relaxed font-poppins text-foreground/90">
                    {section.paragraphs.map((p, pIndex) => (
                      <p key={pIndex}>{p}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Back Button */}
          <div className="mt-12 pt-8 border-t border-border/20 flex justify-center">
            <motion.div
              whileHover={{ scale: 1.05, translateY: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="outline" asChild className="hover:text-primary rounded-[2rem] px-8 py-5 border-border hover:bg-primary/5">
                <Link to="/" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.main>

        {/* Decorative Watermark */}
        <div className="mt-8 text-center pointer-events-none select-none">
          <span className="font-zilla text-xs uppercase tracking-[0.2em] text-foreground/20 font-bold">
            Sound Voyage
          </span>
        </div>
      </div>
    </div>
  );
}
