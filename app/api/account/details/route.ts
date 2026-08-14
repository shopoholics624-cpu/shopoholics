import { NextRequest } from "next/server";
import { PUT as updateProfileHandler } from "@/app/api/account/profile/route";

export async function POST(request: NextRequest) {
  return updateProfileHandler(request);
}

export async function PUT(request: NextRequest) {
  return updateProfileHandler(request);
}
