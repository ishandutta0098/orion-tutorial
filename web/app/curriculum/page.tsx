import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { chapters } from "@/lib/registry";

const notebookGroups = [
  {
    notebook: "Notebook 01" as const,
    title: "Code Generator with Tools",
    description: "Set up your LLM, define tools, build the agent graph, and generate code with streaming and multi-turn conversations.",
    chapters: chapters.filter((ch) => ch.notebook === "Notebook 01"),
  },
  {
    notebook: "Notebook 02" as const,
    title: "Self-Correcting Agent",
    description: "Add structured output, self-correction loops, reflection, dynamic rules, and inline editing capabilities.",
    chapters: chapters.filter((ch) => ch.notebook === "Notebook 02"),
  },
  {
    notebook: "Notebook 03" as const,
    title: "Production Coding Agent",
    description: "Build a multi-agent system with codebase RAG, human-in-the-loop gates, parallel generation, and time-travel debugging.",
    chapters: chapters.filter((ch) => ch.notebook === "Notebook 03"),
  },
];

export default function CurriculumPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <span className="font-code text-primary-light text-label-caps uppercase tracking-widest">
          Curriculum
        </span>
        <h1 className="font-headline text-headline-lg text-ink mt-2">
          18 Chapters to Production
        </h1>
        <p className="font-body text-body-lg text-gray2 mt-3">
          Each chapter introduces one concept and lets you compare baseline vs
          enhanced output in an interactive demo.
        </p>
      </div>

      <div className="space-y-12">
        {notebookGroups.map((group) => (
          <section key={group.notebook}>
            <div className="mb-5">
              <span className="font-code text-primary-light text-label-caps uppercase tracking-widest">
                {group.notebook}
              </span>
              <h2 className="font-headline text-headline-md text-ink mt-2">
                {group.title}
              </h2>
              <p className="font-body text-sm text-gray2 mt-2">
                {group.description}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {group.chapters.map((ch) => (
                <Link
                  key={ch.slug}
                  href={`/curriculum/${ch.slug}`}
                  className="group bg-surface border border-hairline rounded-lg p-6 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-code text-primary-light text-xs font-bold">
                      {String(ch.number).padStart(2, "0")}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray3 group-hover:text-primary-light transition-colors" />
                  </div>
                  <h3 className="font-headline text-headline-sm text-ink mb-2">
                    {ch.title}
                  </h3>
                  <p className="font-body text-sm text-gray2 line-clamp-3">
                    {ch.subtitle}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
