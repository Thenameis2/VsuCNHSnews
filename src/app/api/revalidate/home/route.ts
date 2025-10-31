import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId"); // get userId from query

  if (!userId) {
    return NextResponse.json({ message: "Missing userId" }, { status: 401 });
  }

  // Verify user role in Firestore
  const userDoc = await getDoc(doc(db, "users", userId));
  if (!userDoc.exists() || userDoc.data().role !== "admin") {
    return NextResponse.json({ message: "Not authorized" }, { status: 403 });
  }

  try {
    // Rebuild Home page
    revalidatePath("/");

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    console.error("Error revalidating home:", err);
    return NextResponse.json(
      { message: "Error revalidating home", error: err },
      { status: 500 }
    );
  }
}
