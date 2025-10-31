import { adminDb } from "@/lib/firebaseAdmin";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/app/components/Footer";
import {
  SiInstagram,
  SiX,
  SiLinkedin,
  SiFacebook,
} from "react-icons/si";

// Manual revalidation only
export const revalidate = false;

interface LatestPostCache {
	id: string;
	slug: string;
	title: string;
	image_url?: string | null;
	pub_date?: string;
  }

  
interface Post {
  id: string;
  title: string;
  slug: string;
  image_url?: string;
  author_name?: string;
  pub_date?: string;
  content?: string;
  category?: string;
}

// ✅ STATIC GENERATION of *all slugs*
export async function generateStaticParams() {
  const snapshot = await adminDb.collection("posts").get();

  return snapshot.docs.map(doc => ({
    slug: [doc.data().slug], // `...slug` expects array
  }));
}

export default async function PostPage({ params }: { params: { slug: string[] } }) {
  const slug = params.slug[0]; // `/posts/{slug}`

  // ✅ Fetch post by slug
  const snapshot = await adminDb
    .collection("posts")
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snapshot.empty) return notFound();

  const post = {
    id: snapshot.docs[0].id,
    ...snapshot.docs[0].data(),
  } as Post;

  // ✅ Fetch latest posts
// ✅ Fetch cached latest posts
const cacheDoc = await adminDb.collection("metadata").doc("latestPosts").get();
const cache = cacheDoc.exists ? cacheDoc.data()?.posts || [] : [];

const latestPosts = (cache as LatestPostCache[])
  .filter((p) => p.slug !== slug)
  .slice(0, 4);



  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <main className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 mt-10 px-6">

        {/* ARTICLE */}
        <article className="md:col-span-2">
          {post.image_url && (
            <div className="relative w-full h-72 md:h-[26rem] mb-8">
              <Image
                src={post.image_url}
                alt={post.title}
                fill
                className="object-cover rounded-lg shadow-sm"
              />
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {post.title}
          </h1>

          <p className="text-sm text-gray-500 mb-8 border-b border-gray-200 pb-2">
            Published {post.pub_date || "—"} | By {post.author_name || "Staff Writer"}
          </p>

          <div className="prose prose-lg text-gray-800 max-w-none leading-relaxed">
            {post.content}
          </div>
        </article>

        {/* SIDEBAR */}
        <aside className="space-y-8 border-t md:border-t-0 md:border-l border-gray-200 md:pl-8">

          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-widest mb-2">
              Published
            </h3>
            <p className="text-gray-600">{post.pub_date || "N/A"}</p>
          </div>

          {/* Share */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-widest mb-2">
              Share this story
            </h3>
            <div className="flex gap-4 text-gray-500">
              <SiFacebook size={20} className="hover:text-blue-600 cursor-pointer" />
              <SiLinkedin size={20} className="hover:text-blue-600 cursor-pointer" />
              <SiInstagram size={20} className="hover:text-blue-600 cursor-pointer" />
              <SiX size={20} className="hover:text-blue-600 cursor-pointer" />
            </div>
          </div>

          {/* Latest Stories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-widest mb-3">
              Latest Stories
            </h3>
            <ul className="space-y-3 text-sm text-blue-700">
              {latestPosts.map((item) => (
                <li key={item.id}>
                  <Link href={`/posts/${item.slug}`} className="hover:underline">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <Link
                href="https://your-submission-link.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition"
              >
                Submit News
              </Link>
            </div>
          </div>

        </aside>
      </main>

      <Footer />
    </div>
  );
}
