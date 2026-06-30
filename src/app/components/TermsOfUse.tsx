import { X } from 'lucide-react';

interface TermsOfUseProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export default function TermsOfUse({ isOpen, onClose }: TermsOfUseProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in">
      <div className="bg-card rounded-[2rem] p-8 max-w-lg w-full shadow-2xl border border-border animate-in zoom-in duration-300 text-left">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-zilla text-foreground">Terms of Use</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-[1rem] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer text-foreground/80 hover:text-foreground"
            aria-label="Close Terms of Use"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-sm md:text-base text-foreground/90 overflow-y-auto max-h-[60vh] pr-2">
          <div className="space-y-4">
            {SECTIONS.map((section, index) => {
              const match = section.title.match(/^(\d+)\.\s*(.*)$/);
              const number = match ? match[1] : (index + 1).toString();
              const name = match ? match[2] : section.title;

              return (
                <div key={index} className="bg-secondary/40 p-5 rounded-2xl border border-border/50">
                  <h3 className="font-semibold text-primary mb-2 flex items-center gap-2 text-base">
                    <span className="flex items-center justify-center w-6 h-6 min-w-[1.5rem] rounded-full bg-primary/10 text-xs text-primary font-bold">
                      {number}
                    </span>
                    <span className="font-zilla font-bold text-foreground">{name}</span>
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

          <div className="pt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-full bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
