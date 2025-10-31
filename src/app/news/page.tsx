import Link from "next/link";
import Footer from "@/app/components/Footer";
import { adminDb } from "@/lib/firebaseAdmin";
import Sidebar from "@/app/components/Sidebar"; 
interface NewsItem {
  id: string;
  title: string;
  pub_date: string;
  content: string;
  image_url?: string;
  author_name?: string;
  slug?: string;
  section_slug: string;
  tab_slug: string;
}

interface Section {
  title: string;
  slug: string;
}

interface Tab {
  id: string;
  title: string;
  slug: string;
  sections: Section[];
}

// Disable automatic ISR; only rebuild when manually triggered
export const revalidate = false;

export default async function NewsPage() {
  // --- Fetch nav tabs ---
  const navSnapshot = await adminDb.collection("nav").get();
  const tabs: Tab[] = navSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tab));

  const newsTab = tabs.find(tab => tab.slug === "news") || tabs[0];
  const sections = newsTab?.sections || [];

  if (!newsTab) {
    return <div className="p-10 text-gray-500">No news tab found.</div>;
  }

  // --- Fetch posts for tab_slug = news ---
  const postsSnapshot = await adminDb
    .collection("posts")
    .where("tab_slug", "==", newsTab.slug)
    .get();

  const posts: NewsItem[] = postsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as NewsItem));

  // --- Group posts by section_slug ---
  const grouped: Record<string, NewsItem[]> = {};
  sections.forEach(section => {
    grouped[section.slug] = posts.filter(p => p.section_slug === section.slug);
  });

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 py-12 px-6">
      <div className="flex gap-10">
        {/* Sidebar */}
        <div className="hidden md:block w-64 sticky top-32 self-start">
  <Sidebar sections={sections} />
</div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-20">
          {sections.map(section => (
            <div key={section.slug} id={section.slug} className="scroll-mt-28">
              <h2 className="text-3xl font-bold mb-4">{section.title}</h2>

              {grouped[section.slug]?.length ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {grouped[section.slug].map(item => (
                    <Link
                      key={item.id}
                      href={`/posts/${item.slug}`}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer block"
                    >
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                          No Image
                        </div>
                      )}

                      <div className="p-4">
                        <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                        <p className="text-gray-500 text-sm mb-2">{item.pub_date}</p>
                        <p className="text-gray-700 text-sm line-clamp-3">
                          {item.content?.slice(0, 120) || "No summary available."}
                        </p>
                        {item.author_name && (
                          <p className="text-sm text-gray-500 mt-2">By {item.author_name}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No posts yet in this section.</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
