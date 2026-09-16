import { ContactForm } from "@/components/site/ContactForm";
import { getSiteSettings } from "@/lib/settings";

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-center text-3xl font-bold">Contact Us</h1>
      <div className="mt-12 grid gap-10 sm:grid-cols-2">
        <ContactForm />
        <div className="flex flex-col gap-4 text-sm">
          <div>
            <h3 className="font-semibold text-[#0f3d63]">Address</h3>
            <p className="opacity-70">{settings.address ?? "School address — to be updated"}</p>
          </div>
          <div>
            <h3 className="font-semibold text-[#0f3d63]">Phone</h3>
            <p className="opacity-70">{settings.phone ?? "+91-00000-00000"}</p>
          </div>
          <div>
            <h3 className="font-semibold text-[#0f3d63]">Email</h3>
            <p className="opacity-70">{settings.email ?? "info@school.local"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
