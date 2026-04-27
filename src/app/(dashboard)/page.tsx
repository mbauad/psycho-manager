import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function RootDashboardPage() {
  redirect("/dashboard");
}