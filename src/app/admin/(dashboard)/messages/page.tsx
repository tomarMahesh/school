import { prisma } from "@/lib/prisma";
import { markMessageRead, deleteMessage } from "@/lib/actions/contact";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Contact Messages</h1>

      <ul className="mt-6 flex max-w-2xl flex-col gap-4">
        {messages.map((msg) => (
          <li
            key={msg.id}
            className={`rounded border p-4 text-sm ${
              msg.read
                ? "border-black/10 dark:border-white/10"
                : "border-[#d4a017] bg-[#d4a017]/5"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{msg.name}</span>
              <span className="text-xs opacity-60">
                {msg.createdAt.toLocaleString()}
              </span>
            </div>
            <p className="opacity-70">
              {msg.email}
              {msg.phone ? ` · ${msg.phone}` : ""}
            </p>
            <p className="mt-2">{msg.message}</p>
            <div className="mt-3 flex gap-4">
              {!msg.read && (
                <form action={markMessageRead.bind(null, msg.id)}>
                  <button type="submit" className="text-xs underline">
                    Mark as read
                  </button>
                </form>
              )}
              <DeleteButton
                action={deleteMessage.bind(null, msg.id)}
                confirmMessage={`Delete message from "${msg.name}"?`}
              />
            </div>
          </li>
        ))}
        {messages.length === 0 && (
          <p className="opacity-60">No messages yet.</p>
        )}
      </ul>
    </div>
  );
}
