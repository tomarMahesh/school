import { requirePermission } from "@/lib/permissions";
import { getSiteSettings } from "@/lib/settings";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  await requirePermission("admin.settings");
  const settings = await getSiteSettings();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Settings"
        description="School information shown across the public website."
      />
      <SettingsForm
        initial={{
          schoolName: settings.schoolName,
          address: settings.address,
          phone: settings.phone,
          email: settings.email,
          logoUrl: settings.logoUrl,
        }}
      />
    </div>
  );
}
