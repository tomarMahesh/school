import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminStreamsPage() {
  const streams = await prisma.stream.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Streams</h1>
        <Link
          href="/admin/streams/new"
          className="rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
        >
          New Stream
        </Link>
      </div>

      <table className="mt-6 w-full max-w-sm text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 dark:border-white/10">
            <th className="py-2">Name</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {streams.map((stream) => (
            <tr key={stream.id} className="border-b border-black/5 dark:border-white/5">
              <td className="py-2">{stream.name}</td>
              <td className="py-2">
                <Link href={`/admin/streams/${stream.id}`} className="underline">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
          {streams.length === 0 && (
            <tr>
              <td colSpan={2} className="py-6 text-center opacity-60">
                No streams yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
