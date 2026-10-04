import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContentForm } from "@/components/admin/content/ContentForm";
import { ImagePicker, type PickerImage } from "@/components/admin/content/ImagePicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PAGE_KEYS, PAGE_LABELS, getPageContent, type PageKey } from "@/lib/pageContent";
import { prisma } from "@/lib/prisma";

const BUILT_IN_IMAGES: PickerImage[] = [
  { url: "/images/hero/classroom.jpg", label: "Classroom (built-in)" },
  { url: "/images/hero/sports-day.jpg", label: "Sports field (built-in)" },
  { url: "/images/hero/assembly.jpg", label: "Assembly (built-in)" },
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>
        {label}
        {hint && <span className="ml-1 font-normal text-muted-foreground">({hint})</span>}
      </Label>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}

async function HomeFields({ images }: { images: PickerImage[] }) {
  const c = await getPageContent("home");
  return (
    <>
      <Section title="Hero">
        <Field label="Tagline">
          <Textarea name="heroTagline" defaultValue={c.heroTagline} rows={2} required />
        </Field>
        {c.slides.map((slide, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-md border p-3">
            <p className="text-sm font-medium">Slide {i + 1}</p>
            <ImagePicker name={`slides.${i}.image`} defaultValue={slide.image} options={images} />
            <Field label="Caption">
              <Input name={`slides.${i}.caption`} defaultValue={slide.caption} />
            </Field>
          </div>
        ))}
      </Section>

      <Section title="Welcome">
        <Field label="Title">
          <Input name="welcomeTitle" defaultValue={c.welcomeTitle} required />
        </Field>
        <Field label="Text" hint="{schoolName} is replaced with the school's name">
          <Textarea name="welcomeText" defaultValue={c.welcomeText} rows={5} required />
        </Field>
      </Section>

      <Section title="Stats">
        <p className="text-sm text-muted-foreground">
          Leave a label empty to hide that stat. These are sample figures until you enter the real ones.
        </p>
        {Array.from({ length: 4 }).map((_, i) => {
          const s = c.stats[i];
          return (
            <div key={i} className="grid grid-cols-[1fr_6rem_5rem] gap-2">
              <Input name={`stats.${i}.label`} defaultValue={s?.label ?? ""} placeholder="Label" />
              <Input name={`stats.${i}.value`} type="number" min={0} defaultValue={s?.value ?? ""} placeholder="Number" />
              <Input name={`stats.${i}.suffix`} defaultValue={s?.suffix ?? ""} placeholder="+ or %" />
            </div>
          );
        })}
      </Section>

      <Section title="Mission, Vision & Focus">
        {c.missionVision.map((b, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-md border p-3">
            <Field label="Title">
              <Input name={`mv.${i}.title`} defaultValue={b.title} required />
            </Field>
            <Field label="Summary">
              <Textarea name={`mv.${i}.summary`} defaultValue={b.summary} rows={2} required />
            </Field>
            <Field label="Points" hint="one per line, shown under Read more">
              <Textarea name={`mv.${i}.details`} defaultValue={b.details.join("\n")} rows={4} />
            </Field>
          </div>
        ))}
      </Section>

      <Section title="Principal's Note">
        <Field
          label="Message"
          hint="shown only when a Principal exists; {schoolName} is replaced with the school's name"
        >
          <Textarea name="principalMessage" defaultValue={c.principalMessage} rows={5} />
        </Field>
      </Section>

      <Section title="Testimonials">
        <p className="text-sm text-muted-foreground">
          Leave a quote empty to remove it. Clear all three to hide the section. These are samples until you add real ones.
        </p>
        {Array.from({ length: 3 }).map((_, i) => {
          const t = c.testimonials[i];
          return (
            <div key={i} className="flex flex-col gap-2 rounded-md border p-3">
              <Textarea name={`t.${i}.quote`} defaultValue={t?.quote ?? ""} rows={3} placeholder="Quote" />
              <div className="grid grid-cols-2 gap-2">
                <Input name={`t.${i}.name`} defaultValue={t?.name ?? ""} placeholder="Name (e.g. A Parent)" />
                <Input name={`t.${i}.role`} defaultValue={t?.role ?? ""} placeholder="Role (e.g. Class VI)" />
              </div>
            </div>
          );
        })}
      </Section>
    </>
  );
}

async function AboutFields({ images }: { images: PickerImage[] }) {
  const c = await getPageContent("about");
  return (
    <>
      <Section title="Page">
        <Field label="Title">
          <Input name="title" defaultValue={c.title} required />
        </Field>
      </Section>
      {c.sections.map((s, i) => (
        <Section key={i} title={`Section ${i + 1}${i === 0 ? " (image left)" : " (image right)"}`}>
          <Field label="Heading">
            <Input name={`sections.${i}.heading`} defaultValue={s.heading} required />
          </Field>
          <Field label="Text" hint="{schoolName} is replaced with the school's name">
            <Textarea name={`sections.${i}.text`} defaultValue={s.text} rows={5} required />
          </Field>
          <Field label="Image">
            <ImagePicker name={`sections.${i}.image`} defaultValue={s.image} options={images} />
          </Field>
          <Field label="Image description" hint="for screen readers">
            <Input name={`sections.${i}.imageAlt`} defaultValue={s.imageAlt} />
          </Field>
        </Section>
      ))}
    </>
  );
}

async function ContactFields() {
  const c = await getPageContent("contact");
  return (
    <>
      <Section title="Page">
        <Field label="Title">
          <Input name="title" defaultValue={c.title} required />
        </Field>
        <Field label="Intro text" hint="optional, shown under the title">
          <Textarea name="intro" defaultValue={c.intro} rows={3} />
        </Field>
        <Field label="Office hours" hint="optional, e.g. Mon–Sat, 8:00 AM – 2:00 PM">
          <Textarea name="hours" defaultValue={c.hours} rows={2} />
        </Field>
      </Section>
      <p className="text-sm text-muted-foreground">
        The address, phone and email on this page are edited in{" "}
        <Link href="/admin/settings" className="underline">
          Settings
        </Link>
        .
      </p>
    </>
  );
}

export default async function EditPageContent(props: PageProps<"/admin/content/[key]">) {
  const { key } = await props.params;
  if (!PAGE_KEYS.includes(key as PageKey)) notFound();
  const pageKey = key as PageKey;

  const gallery = await prisma.galleryImage.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  const images: PickerImage[] = [
    ...BUILT_IN_IMAGES,
    ...gallery.map((g) => ({ url: g.url, label: g.caption ?? "Gallery photo" })),
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={`Edit ${PAGE_LABELS[pageKey].title}`}
        description="Images come from the built-in photos and your Gallery uploads."
      />
      <ContentForm pageKey={pageKey}>
        {pageKey === "home" && <HomeFields images={images} />}
        {pageKey === "about" && <AboutFields images={images} />}
        {pageKey === "contact" && <ContactFields />}
      </ContentForm>
    </div>
  );
}
