import { prisma } from "@/lib/prisma";
import { markMessageRead, deleteMessage } from "@/lib/actions/contact";
import { DeleteAlertButton } from "@/components/admin/DeleteAlertButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Contact Messages"
        description={`${messages.length} message${messages.length === 1 ? "" : "s"}`}
      />

      <div className="flex max-w-2xl flex-col gap-3">
        {messages.map((msg) => (
          <Card
            key={msg.id}
            className={!msg.read ? "border-primary/40 bg-primary/5" : ""}
          >
            <CardContent className="flex gap-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                  {initialsOf(msg.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{msg.name}</span>
                    {!msg.read && (
                      <Badge className="bg-primary/10 text-primary">New</Badge>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {msg.createdAt.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {msg.email}
                  {msg.phone ? ` · ${msg.phone}` : ""}
                </p>
                <p className="mt-2 text-sm">{msg.message}</p>
                <div className="mt-3 flex items-center gap-2">
                  {!msg.read && (
                    <form action={markMessageRead.bind(null, msg.id)}>
                      <Button type="submit" variant="outline" size="sm">
                        Mark as read
                      </Button>
                    </form>
                  )}
                  <DeleteAlertButton
                    action={deleteMessage.bind(null, msg.id)}
                    itemLabel={`the message from ${msg.name}`}
                    successMessage="Message deleted."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">No messages yet.</p>
        )}
      </div>
    </div>
  );
}
