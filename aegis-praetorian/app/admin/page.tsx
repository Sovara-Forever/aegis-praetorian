"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isApproved: boolean;
  createdAt: number;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string, isApproved: boolean) => {
    setUpdating(userId);

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUserId: userId,
          isApproved,
        }),
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setUpdating(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId);

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUserId: userId,
          role: newRole,
        }),
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setUpdating(null);
    }
  };

  const pendingUsers = users.filter((u) => !u.isApproved);
  const approvedUsers = users.filter((u) => u.isApproved);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage user access and permissions
        </p>
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>
            Users waiting for access approval ({pendingUsers.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No pending approval requests
            </p>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Requested: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(user.id, true)}
                      disabled={updating === user.id}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleApprove(user.id, false)}
                      disabled={updating === user.id}
                    >
                      Deny
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Users */}
      <Card>
        <CardHeader>
          <CardTitle>Approved Users</CardTitle>
          <CardDescription>
            Active users with platform access ({approvedUsers.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {approvedUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No approved users yet</p>
          ) : (
            <div className="space-y-4">
              {approvedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{user.name}</p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {user.role !== "admin" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRoleChange(user.id, "admin")}
                        disabled={updating === user.id}
                      >
                        Make Admin
                      </Button>
                    )}
                    {user.role === "admin" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRoleChange(user.id, "user")}
                        disabled={updating === user.id}
                      >
                        Remove Admin
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleApprove(user.id, false)}
                      disabled={updating === user.id}
                    >
                      Revoke Access
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingUsers.length}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
