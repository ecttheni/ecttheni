import { NextRequest, NextResponse } from "next/server";
import { bookEvent } from "@/lib/actions/events";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" }, 
        { status: 401 }
      );
    }

    const result = await bookEvent(id, session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in event booking API:", error);
    return NextResponse.json(
      { error: "Failed to process booking" }, 
      { status: 500 }
    );
  }
}