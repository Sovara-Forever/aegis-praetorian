import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = sessionClaims?.metadata?.role as string | undefined;
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const client = await clerkClient();
    const users = await client.users.getUserList({ limit: 100 });

    const userList = users.data.map((user) => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || "",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown",
      role: user.publicMetadata?.role || "user",
      isApproved: user.publicMetadata?.isApproved || false,
      createdAt: user.createdAt,
    }));

    return NextResponse.json({ users: userList });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = sessionClaims?.metadata?.role as string | undefined;
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { targetUserId, isApproved, role: newRole } = body;

    if (!targetUserId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const client = await clerkClient();
    const updates: Record<string, any> = {};

    if (typeof isApproved === "boolean") {
      updates.isApproved = isApproved;
    }

    if (newRole) {
      updates.role = newRole;
    }

    await client.users.updateUserMetadata(targetUserId, {
      publicMetadata: updates,
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
