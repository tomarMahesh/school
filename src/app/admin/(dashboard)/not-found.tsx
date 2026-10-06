import { NotFoundView } from "@/components/NotFoundView";

export default function DashboardNotFound() {
  return <NotFoundView homeHref="/admin" homeLabel="Back to the dashboard" variant="app" />;
}
