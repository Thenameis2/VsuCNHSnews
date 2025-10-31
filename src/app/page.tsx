import Link from "next/link";
import Image from "next/image";
import Footer from "@/app/components/Footer";
import { adminDb } from "@/lib/firebaseAdmin";

interface Post {
  id: string;
  title: string;
  slug: string;
  image_url: string;
  author_name?: string;
  pub_date?: string;
  content?: string;
  post_type?: string;
}

// Disable automatic ISR; manual revalidation only
export const revalidate = false;

export default async function HomePage() {
  // --- Fetch all posts ---
  const postsSnapshot = await adminDb.collection("posts").get();
  const posts: Post[] = postsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Post));

  if (!posts.length) {
    return <p className="p-8 text-center text-gray-500">No posts available</p>;
  }

  // --- FILTER POSTS BY TYPE ---
  const featuredPost = posts.find(p => p.post_type === "feature");
  const recommendedPosts = posts.filter(p => p.post_type === "recommended");
  const spotlightPosts = posts.filter(p => p.post_type === "spotlight");

  const shortenText = (text: string, len = 55) =>
    text?.length <= len ? text : text.slice(0, len) + "...";

  return (
    <>
      <main className="p-8 max-w-7xl mx-auto">
        {/* === FEATURED POST === */}
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Feature</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          {featuredPost ? (
            <Link
              href={`/posts/${featuredPost.slug}`}
              className="lg:w-2/3 bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
            >
              <Image
                src={featuredPost.image_url}
                alt={featuredPost.title}
                width={800}
                height={450}
                className="w-full h-96 object-cover"
              />
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-3">{featuredPost.title}</h2>
                <p className="text-gray-600 text-sm mb-2">
                  {featuredPost.pub_date}{" "}
                  {featuredPost.author_name && ` • By ${featuredPost.author_name}`}
                </p>
                {featuredPost.content && (
                  <p className="text-gray-700">{shortenText(featuredPost.content, 120)}</p>
                )}
              </div>
            </Link>
          ) : (
            <div className="lg:w-2/3 bg-gray-100 rounded-xl p-6 flex items-center justify-center text-gray-500">
              No featured post available
            </div>
          )}

          {/* === RECOMMENDED POSTS === */}
          <div className="lg:w-1/3 flex flex-col gap-6">
            {recommendedPosts.length > 0 ? (
              recommendedPosts.slice(0, 3).map(post => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  className="flex gap-4 border-b pb-4 hover:bg-gray-50 rounded transition"
                >
                  <div className="w-32 h-24 relative flex-shrink-0">
                    <Image src={post.image_url} alt={post.title} fill className="object-cover rounded" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                      {shortenText(post.title, 65)}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1">
                      {post.pub_date} {post.author_name && `• ${post.author_name}`}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-center">No recommended posts</p>
            )}
            <Link
              href="/news"
              className="text-blue-600 font-semibold text-sm mt-2 hover:underline"
            >
              See all news →
            </Link>
          </div>
        </div>

        {/* === SPOTLIGHT POSTS === */}
        {spotlightPosts.length > 0 && (
          <section className="mt-16 bg-gray-50 p-8 rounded-xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Spotlights</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {spotlightPosts.map(post => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden"
                >
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-base mb-2">
                      {shortenText(post.title, 70)}
                    </h3>
                    <p className="text-gray-600 text-sm">{shortenText(post.content || "", 90)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
