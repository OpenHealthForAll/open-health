import { NextRequest, NextResponse } from "next/server";
import { getGoogleHealthData, saveHealthData } from "@/lib/google-health/data";
import { authenticateGoogleHealth } from "@/lib/google-health/auth";

export async function GET(req: NextRequest) {
  try {
    const authToken = await authenticateGoogleHealth(req);
    const healthData = await getGoogleHealthData(authToken);
    return NextResponse.json({ healthData });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const savedData = await saveHealthData(data);
    return NextResponse.json({ savedData });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
