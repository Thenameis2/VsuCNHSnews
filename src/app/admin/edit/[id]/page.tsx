"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  doc,
  updateDoc,
  onSnapshot,
  collection,
  getDocs,
  DocumentData,
} from "firebase/firestore";
import { db, storage } from "@/firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { slugifySentences } from "@/app/utils";

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

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params.id; // string | string[]
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const [post, setPost] = useState<DocumentData | null>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [selectedTab, setSelectedTab] = useState<Tab | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("none");
  const [coverPhoto, setCoverPhoto] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  // Fetch tabs once
  useEffect(() => {
    const fetchTabs = async () => {
      const tabsSnap = await getDocs(collection(db, "nav"));
      const tabsData: Tab[] = [];

      tabsSnap.forEach((d) => {
        const data = d.data() as Omit<Tab, "id">; // ignore any id in Firestore
        tabsData.push({ id: d.id, ...data });
      });

      setTabs(tabsData);
    };
    fetchTabs();
  }, []);

  // Listen to post document in real-time
  useEffect(() => {
    if (!id) return;

    const docRef = doc(db, "posts", id);
    const unsubscribe = onSnapshot(docRef, (snap) => {
      const data = snap.data();
      if (!data) return;

      setPost(data);
      setTitle(data.title || "");
      setContent(data.content || "");
      setPostType(data.post_type || "none");
      setCoverPhoto(data.image_url || "");

      // Select tab & section
      const tab = tabs.find((t) => t.slug === data.tab_slug) || null;
      setSelectedTab(tab);
      const section = tab?.sections.find(
        (s) => s.slug === data.section_slug
      ) || null;
      setSelectedSection(section);
    });

    return () => unsubscribe();
  }, [id, tabs]);

  const handleFileReader = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }
    reader.onload = (readerEvent) => {
      if (readerEvent.target?.result)
        setCoverPhoto(readerEvent.target.result as string);
    };
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !selectedTab || !selectedSection) {
      alert("Please select tab & section");
      return;
    }
    if (!id) return;
  
    setUploading(true);
  
    const docRef = doc(db, "posts", id);
  
    // Update post data
    await updateDoc(docRef, {
      title,
      content,
      tab_id: selectedTab.id,
      tab_slug: selectedTab.slug,
      section_slug: selectedSection.slug,
      post_type: postType,
      slug: slugifySentences(title),
    });
  
    // Upload image if replaced
    if (coverPhoto && coverPhoto.startsWith("data:")) {
      const imageRef = ref(storage, `posts/${id}/image`);
      await uploadString(imageRef, coverPhoto, "data_url");
      const downloadURL = await getDownloadURL(imageRef);
      await updateDoc(docRef, { image_url: downloadURL });
    }
  
    // ✅ Trigger ISR revalidation (admin check server-side)
    try {
      const userJson = localStorage.getItem("user");
      const user = JSON.parse(userJson || "{}");
  
      await fetch(
        `/api/revalidate/posts?userId=${user.u_id}&slug=${slugifySentences(title)}`
      );
    } catch (err) {
      console.error("Revalidation failed", err);
    }
  
    setUploading(false);
    alert("✅ Post updated and revalidated!");
    router.push("/admin");
  };
  
  

  if (!post) return <p className="p-5">Loading...</p>;

  return (
    <form onSubmit={handleUpdate} className="flex flex-col w-full p-5">
      <h2 className="text-2xl font-bold mb-4">Edit Post</h2>

      <label className="text-sm text-blue-600">Title</label>
      <input
        className="px-4 py-2 border rounded mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label className="text-sm text-blue-600">Content</label>
      <textarea
        rows={10}
        className="px-4 py-2 border rounded mb-4"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <label className="text-sm text-blue-600">Tab</label>
      <select
        className="px-4 py-2 border rounded mb-4"
        value={selectedTab?.id || ""}
        onChange={(e) => {
          const tab = tabs.find((t) => t.id === e.target.value) || null;
          setSelectedTab(tab);
          setSelectedSection(tab?.sections[0] || null);
        }}
      >
        <option value="">Select a tab</option>
        {tabs.map((t) => (
          <option key={t.id} value={t.id}>
            {t.title}
          </option>
        ))}
      </select>

      <label className="text-sm text-blue-600">Section</label>
      <select
        className="px-4 py-2 border rounded mb-4"
        value={selectedSection?.slug || ""}
        onChange={(e) =>
          setSelectedSection(
            selectedTab?.sections.find((s) => s.slug === e.target.value) ||
              null
          )
        }
      >
        <option value="">Select a section</option>
        {selectedTab?.sections.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.title}
          </option>
        ))}
      </select>

      <label className="text-sm text-blue-600">Post Type</label>
      <select
        className="px-4 py-2 border rounded mb-4"
        value={postType}
        onChange={(e) => setPostType(e.target.value)}
      >
        <option value="none">Normal Post</option>
        <option value="feature">Feature</option>
        <option value="recommended">Recommended</option>
        <option value="spotlight">Spotlight</option>
      </select>

      <label className="text-sm text-blue-600">Cover Photo</label>
      {coverPhoto && (
        <img
          src={coverPhoto}
          className="w-40 h-40 object-cover rounded mb-2"
          alt="Cover"
        />
      )}
      <input
        type="file"
        accept="image/*"
        className="mb-4"
        onChange={handleFileReader}
      />

      <button
        disabled={uploading}
        className="bg-blue-600 text-white py-3 rounded"
      >
        {uploading ? "Updating..." : "Update Post"}
      </button>
    </form>
  );
}
