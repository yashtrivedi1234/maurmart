import { useGetNewslettersQuery } from "@/store/api/newsletterApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function AdminNewsletter() {
  const { data: newsletters = [], isLoading } = useGetNewslettersQuery({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Newsletter Subscribers</h1>
          <p className="text-muted-foreground mt-1">
            Total subscribers: {newsletters.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="rounded-3xl border bg-white shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Subscribers</p>
            <p className="mt-2 text-3xl font-display font-bold">{newsletters.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border bg-white shadow-sm md:col-span-2">
          <CardContent className="p-6">
            <p className="font-semibold text-foreground">Use this list for campaign exports and targeted announcements.</p>
            <p className="mt-1 text-sm text-muted-foreground">Copy individual emails quickly on mobile or desktop and keep messaging relevant.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:hidden">
        {newsletters.length === 0 ? (
          <div className="rounded-3xl border border-dashed p-8 text-center text-sm text-muted-foreground">No newsletter subscribers yet</div>
        ) : newsletters.map((subscriber: any) => (
          <Card key={subscriber._id} className="rounded-3xl shadow-sm">
            <CardContent className="p-5">
              <p className="font-semibold text-foreground break-all">{subscriber.email}</p>
              <p className="mt-2 text-sm text-muted-foreground">{formatDate(subscriber.createdAt)}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyEmail(subscriber.email, subscriber._id)}
                className="mt-4 w-full gap-2 rounded-xl"
              >
                {copiedId === subscriber._id ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Email
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="hidden md:block rounded-3xl">
        <CardHeader>
          <CardTitle>All Subscribers</CardTitle>
        </CardHeader>
        <CardContent>
          {newsletters.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No newsletter subscribers yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Subscribed Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newsletters.map((subscriber: any) => (
                    <TableRow key={subscriber._id}>
                      <TableCell className="font-medium">
                        {subscriber.email}
                      </TableCell>
                      <TableCell>
                        {formatDate(subscriber.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleCopyEmail(subscriber.email, subscriber._id)
                          }
                          className="gap-2"
                        >
                          {copiedId === subscriber._id ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
