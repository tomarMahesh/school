import Image from "next/image";
import { fillSchoolName, getPageContent } from "@/lib/pageContent";
import { getSiteSettings } from "@/lib/settings";

export default async function AboutPage() {
  const [settings, content] = await Promise.all([
    getSiteSettings(),
    getPageContent("about"),
  ]);
  const SCHOOL_NAME = settings.schoolName;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-center text-3xl font-bold text-[#0f3d63] sm:text-4xl">
        {content.title}
      </h1>

      {content.sections.map((section, i) => {
        const imageFirst = i % 2 === 0;
        return (
          <section
            key={i}
            className={`grid items-center gap-8 md:grid-cols-2 md:gap-12 ${
              i === 0 ? "mt-12" : "mt-16"
            }`}
          >
            <div
              className={`relative aspect-[4/3] overflow-hidden rounded-xl shadow-md ${
                imageFirst ? "" : "order-1 md:order-2"
              }`}
            >
              <Image
                src={section.image}
                alt={section.imageAlt}
                fill
                priority={i === 0}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className={imageFirst ? "" : "order-2 md:order-1"}>
              <h2 className="text-2xl font-bold text-[#0f3d63]">{section.heading}</h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed opacity-80">
                {fillSchoolName(section.text, SCHOOL_NAME)}
              </p>
            </div>
          </section>
        );
      })}
    </div>
  );
}
