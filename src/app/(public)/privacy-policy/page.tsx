import { getSiteSettings } from "@/lib/settings";

export const metadata = {
  title: "Privacy Policy",
  description: "How we collect, use and protect personal information on this website and the school portal.",
};

// Update this date whenever the wording below changes.
const LAST_UPDATED = "6 October 2026";

// NOTE: this text describes what the software actually collects and does. It is
// a good-faith starting point, not legal advice -- have the school's legal
// adviser review it, and keep it in step with the school's real practices
// (especially consent for photographs and how long records are kept).

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-[#0f3d63]">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed opacity-85">{children}</div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-6">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();
  const school = settings.schoolName;

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-[#0f3d63] sm:text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-sm opacity-60">Last updated: {LAST_UPDATED}</p>

      <p className="mt-6 leading-relaxed opacity-85">
        This policy explains what personal information {school} (&ldquo;the school&rdquo;,
        &ldquo;we&rdquo;) collects through this website and the student and staff portal, why we
        collect it, who can see it, and the choices you have. We handle personal data in line with
        applicable Indian law, including the Digital Personal Data Protection Act, 2023.
      </p>

      <Section title="1. Information we collect">
        <p>
          <strong>Visitors to the website.</strong> If you use the contact form we receive your name,
          email address, optional phone number and your message. Our servers also note your internet
          (IP) address for a short time to protect the site from abuse, for example to limit repeated
          form submissions or sign-in attempts.
        </p>
        <p>
          <strong>Students.</strong> Name, email address, class, stream and subjects, father&rsquo;s
          and mother&rsquo;s names, gender, address (state, district and pincode), attendance,
          marks, grades and exam results, and fee and payment records.
        </p>
        <p>
          <strong>Staff.</strong> Name, email address, designation, qualification and education,
          phone number, address, the subjects and classes they teach and, for staff only, Aadhaar
          number (see section 6).
        </p>
        <p>
          <strong>Sign-in details.</strong> Your email address and a password, which we keep only in
          scrambled (hashed) form so nobody, including school staff, can read it. For
          administrators we also keep a mobile number to send sign-in codes by SMS.
        </p>
        <p>
          <strong>Photographs.</strong> The gallery may show photographs taken at school events.
          Photographs that show students are published only with the consent of the student&rsquo;s
          parent or guardian.
        </p>
      </Section>

      <Section title="2. How we use it">
        <List
          items={[
            "Admissions, class and student record keeping.",
            "Taking attendance, recording marks, publishing results and issuing hall tickets and certificates.",
            "Recording and receiving fees.",
            "Running the school and staff records, timetables and class assignments.",
            "Replying to enquiries sent through the website.",
            "Sending you account emails, such as the link to set or reset your password.",
            "Keeping the website and portal secure, and keeping a record of who changed what in the system.",
          ]}
        />
        <p>
          We do not sell personal information, and we do not use it for advertising or for building
          profiles for marketing.
        </p>
      </Section>

      <Section title="3. Children&rsquo;s information">
        <p>
          Most of the people whose information we hold are children. We collect a student&rsquo;s
          information at admission with the knowledge and consent of the parent or guardian, and
          only what is needed for the child&rsquo;s education and the school&rsquo;s records. We do
          not track or monitor children&rsquo;s behaviour online, and we do not show them
          advertising.
        </p>
      </Section>

      <Section title="4. Who can see it">
        <p>
          Access is limited by role. Students see their own records. Teachers see the classes
          assigned to them. Administrators and the principal see what they need to run the school.
          The system keeps an audit record of changes made by staff.
        </p>
        <p>
          We use trusted service providers to run the website: hosting, email delivery and SMS
          delivery. They handle information only to provide those services to us. We may also share
          information where the law or an authority such as an education board, government
          department or court requires it.
        </p>
      </Section>

      <Section title="5. How we protect it">
        <List
          items={[
            "The website is served over an encrypted (HTTPS) connection.",
            "Passwords are stored hashed, and strong passwords are required.",
            "Administrator sign-in needs a password and a one-time SMS code.",
            "Repeated wrong passwords temporarily lock an account.",
            "Aadhaar numbers are encrypted in the database.",
            "Access to records depends on a person's role, and changes made by staff are logged.",
            "The database is backed up regularly.",
          ]}
        />
        <p>
          No system is perfectly secure, but we work to protect the information we hold and to fix
          problems promptly.
        </p>
      </Section>

      <Section title="6. Aadhaar numbers">
        <p>
          We collect Aadhaar numbers only from staff, only for staff records, and never from
          students or website visitors. The number is stored encrypted, and a staff member sees it
          only in masked form (for example XXXX XXXX 1234) in their own account.
        </p>
      </Section>

      <Section title="7. Cookies">
        <p>
          We use only the essential cookies needed to keep you signed in and to protect the sign-in
          process. We do not use advertising or tracking cookies, and we do not run third-party
          analytics on this site.
        </p>
      </Section>

      <Section title="8. How long we keep it">
        <p>
          We keep student and staff records for as long as the person studies or works here and for
          as long afterwards as the school needs them for its records, certificates and legal
          obligations. Messages sent through the contact form are kept only as long as needed to
          deal with your enquiry. When information is no longer needed we delete it or make it
          anonymous.
        </p>
      </Section>

      <Section title="9. Your rights and how to reach us">
        <p>
          You, or a student&rsquo;s parent or guardian, may ask to see the information we hold, ask
          us to correct anything that is wrong or out of date, ask us to erase information we no
          longer need, or withdraw a consent you gave. You may also raise a complaint about how
          your information is handled.
        </p>
        <p>
          To do any of these, contact the school office. If your complaint is not resolved, you may
          approach the Data Protection Board of India.
        </p>
        <address className="not-italic rounded-lg bg-[#f7f5ef] p-4 text-sm leading-relaxed">
          <strong className="text-[#0f3d63]">{school}</strong>
          <br />
          {settings.address ?? "Address: please see the Contact page"}
          <br />
          {settings.phone ? `Phone: ${settings.phone}` : null}
          {settings.phone && settings.email ? <br /> : null}
          {settings.email ? `Email: ${settings.email}` : null}
        </address>
      </Section>

      <Section title="10. Changes to this policy">
        <p>
          We may update this policy from time to time. The date at the top shows when it last
          changed, and the current version is always on this page.
        </p>
      </Section>
    </article>
  );
}
