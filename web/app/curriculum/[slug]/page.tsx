import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { chapters, getChapter, getAdjacentChapters } from "@/lib/registry";
import { ChapterSidebar } from "@/components/AppShell/ChapterSidebar";
import { DemoStation } from "@/components/Chapter/DemoStation";

export function generateStaticParams() {
  return chapters.map((ch) => ({ slug: ch.slug }));
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) notFound();

  const { prev, next } = getAdjacentChapters(slug);

  return (
    <div className="flex">
      <ChapterSidebar />

      <div className="lg:pl-64 flex-1">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="mb-10">
            <span className="font-code text-primary-light text-label-caps uppercase tracking-widest">
              {chapter.notebook} / Chapter {String(chapter.number).padStart(2, "0")}
            </span>
            <h1 className="font-headline text-headline-lg text-ink mt-2">
              {chapter.title}
            </h1>
            <p className="font-body text-body-lg text-gray2 mt-3">
              {chapter.subtitle}
            </p>
          </div>

          {chapter.cursorFeature && (
            <div className="flex items-center gap-3 mb-8">
              <span className="font-code text-[10px] tracking-widest uppercase text-gray3">
                Cursor Feature:
              </span>
              <span className="px-3 py-1 rounded-full bg-surface border border-hairline font-code text-xs text-secondary">
                {chapter.cursorFeature}
              </span>
              {chapter.designPatterns?.map((p) => (
                <span key={p} className="px-3 py-1 rounded-full bg-surface border border-hairline font-code text-xs text-accent">
                  {p}
                </span>
              ))}
            </div>
          )}

          <div className="bg-surface/50 border border-hairline rounded-lg p-6 mb-12">
            <p className="font-body text-body-md text-ink leading-relaxed">
              {chapter.intro}
            </p>
          </div>

          {chapter.demos.length > 0 && (
            <section className="space-y-12 mb-16">
              {chapter.demos.map((demo) => (
                <DemoStation key={demo.id} demo={demo} />
              ))}
            </section>
          )}

          <div className="bg-surface/50 border border-primary/20 rounded-lg p-6 mb-12">
            <h2 className="font-headline text-label-caps uppercase text-primary-light tracking-widest mb-2">
              Key Takeaway
            </h2>
            <p className="font-body text-body-md text-ink leading-relaxed">
              {chapter.takeaway}
            </p>
          </div>

          <nav className="flex items-center justify-between border-t border-hairline pt-8">
            {prev ? (
              <Link
                href={`/curriculum/${prev.slug}`}
                className="flex items-center gap-2 font-code text-sm text-gray2 hover:text-primary-light transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>
                  {String(prev.number).padStart(2, "0")}. {prev.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                href={`/curriculum/${next.slug}`}
                className="flex items-center gap-2 font-code text-sm text-gray2 hover:text-primary-light transition-colors"
              >
                <span>
                  {String(next.number).padStart(2, "0")}. {next.title}
                </span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <div />
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
