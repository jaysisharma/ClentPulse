import React from "react";
import Image from "next/image";
import { Quote } from "lucide-react";
import SectionHeader from "@/components/home/section-header";
import { founderNote, testimonials, type Testimonial } from "@/components/home/social-proof";

function Avatar({ src, name, size }: { src?: string; name: string; size: number }) {
  if (src) {
    return <Image src={src} alt={name} width={size} height={size} className="rounded-full object-cover shrink-0" />;
  }
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      style={{ width: size, height: size }}
      className="rounded-full bg-accent/10 text-brand font-semibold text-sm flex items-center justify-center shrink-0"
    >
      {initials}
    </span>
  );
}

function Attribution({ t }: { t: Testimonial }) {
  const role = [t.role, t.company].filter(Boolean).join(", ");
  return (
    <figcaption className="flex items-center gap-3 mt-6">
      <Avatar src={t.avatar} name={t.name} size={40} />
      <div className="text-sm">
        {t.link ? (
          <a href={t.link} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
            {t.name}
          </a>
        ) : (
          <p className="font-semibold">{t.name}</p>
        )}
        <p className="text-muted-foreground">{role}</p>
      </div>
    </figcaption>
  );
}

export default function TestimonialsSection() {
  if (testimonials.length === 0 && !founderNote) return null;

  const [featured, ...rest] = testimonials;

  return (
    <section
      id="testimonials"
      className="w-full py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background text-foreground border-b border-border"
    >
      <div className="max-w-7xl mx-auto">
        {featured ? (
          <SectionHeader kicker="From freelancers using Frevio" title="Less chasing. More work that gets paid." />
        ) : (
          <SectionHeader kicker="Why Frevio exists" title="A note from the founder." />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {featured && (
            <figure className="lg:col-span-7 rounded-lg border border-border bg-card p-8 sm:p-10 flex flex-col">
              <Quote className="w-8 h-8 text-brand mb-6" />
              <blockquote className="text-xl sm:text-2xl font-medium tracking-tight leading-snug">
                &ldquo;{featured.quote}&rdquo;
              </blockquote>
              <div className="mt-auto">
                <Attribution t={featured} />
              </div>
            </figure>
          )}

          {founderNote && (
            <figure
              className={`rounded-lg bg-accent text-white p-8 sm:p-10 flex flex-col ${
                featured ? "lg:col-span-5" : "lg:col-span-12 lg:p-14"
              }`}
            >
              {featured && <p className="text-sm font-semibold text-white/70 mb-4">Why Frevio exists</p>}
              <blockquote
                className={`leading-relaxed text-white/90 whitespace-pre-line ${
                  featured ? "text-lg" : "text-xl sm:text-2xl max-w-3xl"
                }`}
              >
                {founderNote.body}
              </blockquote>
              <figcaption className="flex items-center gap-3 mt-auto pt-6">
                {founderNote.avatar && (
                  <Image
                    src={founderNote.avatar}
                    alt={founderNote.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                )}
                <div className="text-sm">
                  <p className="font-semibold">{founderNote.name}</p>
                  <p className="text-white/70">{founderNote.title}</p>
                </div>
              </figcaption>
            </figure>
          )}

          {rest.map((t) => (
            <figure key={t.name + t.quote.slice(0, 20)} className="lg:col-span-4 rounded-lg border border-border bg-card p-6 sm:p-7 flex flex-col">
              <blockquote className="text-base leading-relaxed">&ldquo;{t.quote}&rdquo;</blockquote>
              <div className="mt-auto">
                <Attribution t={t} />
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
