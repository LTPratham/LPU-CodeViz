import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, department, studentCount, message } = body;

    // Validate required fields
    if (!name || !email || !department || !studentCount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Log the lead details (in database or server logs)
    console.log("DEMO REQUEST RECEIVED:", {
      name,
      email,
      department,
      studentCount,
      message,
      timestamp: new Date().toISOString(),
    });

    // In a real production system, you would send an email here using Resend or SendGrid:
    // await resend.emails.send({ ... });

    return NextResponse.json(
      { success: true, message: "Demo request recorded successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DEMO REQUEST ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
