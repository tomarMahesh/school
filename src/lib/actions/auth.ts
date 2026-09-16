"use server";

import { signOut } from "@/lib/auth";

export async function signOutOfAdmin() {
  await signOut({ redirectTo: "/admin/login" });
}

export async function signOutOfPortal() {
  await signOut({ redirectTo: "/portal/login" });
}
