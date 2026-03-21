import { useGetContactsQuery, useUpdateContactStatusMutation, useDeleteContactMutation } from "@/store/api/contactApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Eye, MailOpen, Inbox, Archive } from "lucide-react";
import { useState } from "react";

const statusColors: Record<string, { bg: string; text: string }> = {
  new: { bg: "bg-blue-100", text: "text-blue-800" },
  replied: { bg: "bg-green-100", text: "text-green-800" },
  archived: { bg: "bg-gray-100", text: "text-gray-800" },
};

export default function AdminContact() {
  const { data: contacts = [], isLoading } = useGetContactsQuery({});
  const [updateStatus] = useUpdateContactStatusMutation();
  const [deleteContact] = useDeleteContactMutation();
  const [selectedContact, setSelectedContact] = useState<any | null>(null);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
    } catch (error: any) {
      console.error("❌ Error:", error);
      alert("Error updating status: " + (error?.data?.message || error?.message));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteContact(id).unwrap();
    } catch (error: any) {
      console.error("❌ Error:", error);
      alert("Error deleting contact: " + (error?.data?.message || error?.message));
    }
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
          <h1 className="text-3xl font-display font-bold text-foreground">Contact Messages</h1>
          <p className="text-muted-foreground mt-1">
            Total messages: {contacts.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">New</p>
              <p className="mt-2 text-3xl font-display font-bold">{contacts.filter((c: any) => c.status === "new").length}</p>
            </div>
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600"><Inbox className="h-5 w-5" /></div>
          </div>
        </div>
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Replied</p>
              <p className="mt-2 text-3xl font-display font-bold">{contacts.filter((c: any) => c.status === "replied").length}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600"><MailOpen className="h-5 w-5" /></div>
          </div>
        </div>
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Archived</p>
              <p className="mt-2 text-3xl font-display font-bold">{contacts.filter((c: any) => c.status === "archived").length}</p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-600"><Archive className="h-5 w-5" /></div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:hidden">
        {contacts.length === 0 ? (
          <div className="rounded-3xl border border-dashed p-8 text-center text-sm text-muted-foreground">No contact messages yet</div>
        ) : (
          contacts.map((contact: any) => (
            <div key={contact._id} className="rounded-3xl border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.email}</p>
                  <p className="text-sm text-muted-foreground">{contact.phone}</p>
                </div>
                <Badge className={statusColors[contact.status].bg}>
                  <span className={statusColors[contact.status].text}>
                    {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                  </span>
                </Badge>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-slate-600">{contact.subject || "No subject"}</p>
              <p className="mt-2 text-xs text-muted-foreground">{formatDate(contact.createdAt)}</p>
              <div className="mt-4 flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl" onClick={() => setSelectedContact(contact)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Message Details</DialogTitle>
                      <DialogDescription>Read the full customer message and review its current handling status.</DialogDescription>
                    </DialogHeader>
                    {selectedContact && (
                      <div className="space-y-4">{/* same content */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div><p className="text-sm font-medium text-muted-foreground">Name</p><p>{selectedContact.name}</p></div>
                          <div><p className="text-sm font-medium text-muted-foreground">Email</p><p>{selectedContact.email}</p></div>
                          <div><p className="text-sm font-medium text-muted-foreground">Phone</p><p>{selectedContact.phone}</p></div>
                          <div className="sm:col-span-2"><p className="text-sm font-medium text-muted-foreground">Subject</p><p>{selectedContact.subject || "—"}</p></div>
                        </div>
                        <div><p className="text-sm font-medium text-muted-foreground mb-2">Message</p><div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm">{selectedContact.message}</div></div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="rounded-xl">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogTitle>Delete Message</AlertDialogTitle>
                    <AlertDialogDescription>Are you sure you want to delete this contact message? This cannot be undone.</AlertDialogDescription>
                    <div className="flex gap-2 justify-end">
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(contact._id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden bg-card rounded-2xl border overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No contact messages yet
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact: any) => (
                <TableRow key={contact._id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell className="max-w-xs truncate">{contact.subject || "—"}</TableCell>
                  <TableCell>{formatDate(contact.createdAt)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[contact.status].bg}>
                      <span className={statusColors[contact.status].text}>
                        {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedContact(contact)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Message Details</DialogTitle>
                          <DialogDescription>
                            Read the full customer message and review its current handling status.
                          </DialogDescription>
                        </DialogHeader>
                        {selectedContact && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Name</p>
                                <p className="text-foreground">{selectedContact.name}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Email</p>
                                <p className="text-foreground">{selectedContact.email}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                <p className="text-foreground">{selectedContact.phone}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm font-medium text-muted-foreground">Subject</p>
                                <p className="text-foreground">{selectedContact.subject || "—"}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                                <p className="text-foreground">{formatDate(selectedContact.createdAt)}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">Message</p>
                              <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm">
                                {selectedContact.message}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">Update Status</p>
                              <div className="flex gap-2">
                                {["new", "replied", "archived"].map((status) => (
                                  <Button
                                    key={status}
                                    variant={selectedContact.status === status ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                      handleStatusChange(selectedContact._id, status);
                                      setSelectedContact({ ...selectedContact, status });
                                    }}
                                  >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>Delete Message</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this contact message? This cannot be undone.
                        </AlertDialogDescription>
                        <div className="flex gap-2 justify-end">
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(contact._id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
