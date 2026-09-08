import { HelpCircle, BookOpen, Mail, MessageCircle, Sparkles, ExternalLink } from 'lucide-react';

const FAQS = [
  {
    q: 'How do I get the best results?',
    a: 'Use a clear first frame with good lighting, then describe the camera motion (push, dolly, orbit) and the subject’s motion in 1–2 sentences.',
  },
  {
    q: 'Why does my generation cost more credits?',
    a: 'Cost scales with resolution, duration, model, and the number of variations you ask for. 1080p and the Cinematic model cost the most.',
  },
  {
    q: 'Can I cancel a generation?',
    a: 'Yes — open the video while it is processing and click Cancel. Credits are refunded automatically.',
  },
  {
    q: 'How do I plug in a real AI provider?',
    a: 'Implement the TODO sections in backend/providers/RealVideoProvider.js, then set AI_VIDEO_PROVIDER=real in your .env.',
  },
  {
    q: 'Is my content private?',
    a: 'Yes. Uploads and outputs are scoped to your account. We never train models on your data.',
  },
];

export function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Help & Support</h1>
        <p className="text-sm text-muted-foreground">Quick answers, guides, and ways to reach us.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="vf-card p-5">
          <BookOpen className="h-5 w-5 text-primary" />
          <div className="mt-2 text-sm font-semibold">Documentation</div>
          <p className="text-xs text-muted-foreground">Guides, API reference, and best practices.</p>
          <a className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline" href="#">
            Open docs <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="vf-card p-5">
          <MessageCircle className="h-5 w-5 text-primary" />
          <div className="mt-2 text-sm font-semibold">Live chat</div>
          <p className="text-xs text-muted-foreground">Chat with a human 9am–9pm CET, Mon–Fri.</p>
          <a className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline" href="#">
            Start chat <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="vf-card p-5">
          <Mail className="h-5 w-5 text-primary" />
          <div className="mt-2 text-sm font-semibold">Email</div>
          <p className="text-xs text-muted-foreground">Reach our team at support@visionflow.ai.</p>
          <a className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline" href="mailto:support@visionflow.ai">
            Send email <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" />
          <div className="text-sm font-semibold">Frequently asked</div>
        </div>
        <div className="space-y-2">
          {FAQS.map((f) => (
            <details key={f.q} className="vf-card p-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between">
                <span className="text-sm font-semibold">{f.q}</span>
                <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
