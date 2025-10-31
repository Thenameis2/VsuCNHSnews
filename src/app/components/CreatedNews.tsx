"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import Link from "next/link";

export default function CreatedNews() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("pub_date", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      setPosts(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleDeletePost = async (id: string) => {
    if (confirm("Delete this post?")) {
      await deleteDoc(doc(db, "posts", id));
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.section_slug.toLowerCase().includes(search.toLowerCase());

    const matchesTab = filterTab === "all" || post.tab_slug === filterTab;

    return matchesSearch && matchesTab;
  });

  // Create unique tab slugs without spread operator
  const uniqueTabSlugs = Array.from(new Set(posts.map((p) => p.tab_slug)));

  return (
    <>
      {/* Search + Filter */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search posts..."
          className="border px-3 py-2 rounded-md w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-2 rounded-md"
          value={filterTab}
          onChange={(e) => setFilterTab(e.target.value)}
        >
          <option value="all">All Tabs</option>
          {uniqueTabSlugs.map((ts) => (
            <option key={ts} value={ts}>
              {ts}
            </option>
          ))}
        </select>
      </div>

      {/* Skeleton Loader */}
      {loading && (
        <ul className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <li
              key={i}
              className="border p-4 rounded-md animate-pulse bg-gray-100 h-20"
            ></li>
          ))}
        </ul>
      )}

      {/* Posts List */}
      {!loading && (
        <ul className="space-y-4">
          {filteredPosts.map((post) => (
            <li
              key={post.id}
              className="border p-4 rounded-md flex items-center gap-4"
            >
              {/* Thumbnail */}
              {post.image_url ? (
                <img
                  src={post.image_url}
                  className="w-20 h-20 rounded object-cover border"
                  alt="Thumbnail"
                />
              ) : (
                <div className="w-20 h-20 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-500 border">
                  No Image
                </div>
              )}

              {/* Text info */}
              <div className="flex flex-col flex-1">
                <p className="font-semibold">{post.title}</p>
                <p className="text-gray-600 text-sm">{post.pub_date}</p>
                <p className="text-gray-500 text-sm">
                  {post.tab_slug} / {post.section_slug}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/admin/edit/${post.id}`}
                  className="bg-blue-500 text-white px-3 py-1 rounded-md"
                >
                  Edit
                </Link>

                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-md"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
