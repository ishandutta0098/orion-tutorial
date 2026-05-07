import { notFound } from "next/navigation";
import { chapters, getChapter } from "@/lib/registry";
import { ChapterLayout } from "@/components/IDE/ChapterLayout";

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

  return <ChapterLayout chapter={chapter} />;
}
