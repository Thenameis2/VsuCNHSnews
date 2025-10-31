import { revalidatePath } from "next/cache";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export async function POST(request: Request) {
  try {
    const { slug, userId } = await request.json(); // removed secret

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: missing userId" }),
        { status: 401 }
      );
    }

    // Verify user role
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists() || userDoc.data().role !== "admin") {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 403,
      });
    }

    // Revalidate the post page
    revalidatePath(`/posts/${slug}`);

    return new Response(JSON.stringify({ revalidated: true, slug }), {
      status: 200,
    });
  } catch (err) {
    console.error("Error revalidating post:", err);
    return new Response(
      JSON.stringify({ error: "Error revalidating post", details: err }),
      { status: 500 }
    );
  }
}
