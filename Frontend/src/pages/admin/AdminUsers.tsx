import React, { useState, useCallback } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone,
  Shield,
  User as UserIcon,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGetAllUsersQuery } from "@/store/api/authApi";
import { usePageRefresh } from "@/hooks/usePageRefresh";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  profilePic?: string;
  createdAt: string;
}

const AdminUsers = () => {
  const usersQuery = useGetAllUsersQuery();
  const { data: users, isLoading } = usersQuery;
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [verificationFilter, setVerificationFilter] = useState<"all" | "verified" | "unverified">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");

  // Real-time refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      await usersQuery.refetch();
      console.log("✅ Users refreshed");
    } catch (error) {
      console.error("❌ Error refreshing users:", error);
    }
  }, [usersQuery]);

  // Listen for page refresh events
  usePageRefresh({
    page: "users",
    onRefresh: handleRefresh,
  });

  const filteredUsers = [...(users || [])]
    .filter((u: User) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((u: User) => (roleFilter === "all" ? true : u.role === roleFilter))
    .filter((u: User) => {
      if (verificationFilter === "all") return true;
      return verificationFilter === "verified" ? u.isVerified : !u.isVerified;
    })
    .sort((a: User, b: User) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-1">View and manage your store's customers and staff.</p>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search users by name or email..." 
              className="pl-10 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-xl gap-2">
                <Filter className="h-4 w-4" /> Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Role</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={roleFilter} onValueChange={(value) => setRoleFilter(value as typeof roleFilter)}>
                <DropdownMenuRadioItem value="all">All roles</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="admin">Admins only</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="user">Users only</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Verification</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={verificationFilter} onValueChange={(value) => setVerificationFilter(value as typeof verificationFilter)}>
                <DropdownMenuRadioItem value="all">All users</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="verified">Verified only</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="unverified">Unverified only</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Sort</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                <DropdownMenuRadioItem value="newest">Newest first</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="oldest">Oldest first</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="name">Name A-Z</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid gap-4 p-4 md:hidden">
          {isLoading ? (
            <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">No users found.</div>
          ) : filteredUsers.map((user: User) => (
            <div key={user._id} className="rounded-2xl border bg-slate-50/70 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border">
                    {user.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : <UserIcon className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-[11px] text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigator.clipboard?.writeText(user.email)}>Copy Email</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigator.clipboard?.writeText(user._id)}>Copy User ID</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                  user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {user.role === "admin" && <Shield className="h-3 w-3" />}
                  {user.role}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${
                  user.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {user.isVerified ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {user.isVerified ? "Verified" : "Unverified"}
                </span>
              </div>
              <div className="mt-4 text-xs text-muted-foreground space-y-1">
                {user.phone ? <p>Phone: {user.phone}</p> : null}
                <p>Joined: {format(new Date(user.createdAt), "dd MMM, yyyy")}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b">
                <th className="p-4">User</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">Loading users...</td>
                </tr>
              ) : filteredUsers?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">No users found.</td>
                </tr>
              ) : filteredUsers?.map((user: User) => (
                <tr key={user._id} className="group hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border">
                        {user.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : <UserIcon className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{user.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{user._id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" /> {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" /> {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {user.role === "admin" && <Shield className="h-3 w-3" />}
                      {user.role}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${user.isVerified ? "text-green-600" : "text-orange-600"}`}>
                      {user.isVerified ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      {user.isVerified ? "Verified" : "Unverified"}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-xs text-muted-foreground">{format(new Date(user.createdAt), "dd MMM, yyyy")}</p>
                  </td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigator.clipboard?.writeText(user.email)}>
                          Copy Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigator.clipboard?.writeText(user._id)}>
                          Copy User ID
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSearchTerm(user.email)}>
                          Find Similar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminUsers;
