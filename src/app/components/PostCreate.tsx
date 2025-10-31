"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  updateDoc,
  doc,
  onSnapshot,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  setDoc,
} from "firebase/firestore";
import { auth, db, storage } from "@/firebase";
import { getCurrentDate, slugifySentences } from "@/app/utils";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

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

export default function PostCreate() {
  const [userData, setUserData] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [selectedTab, setSelectedTab] = useState<Tab | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [postType, setPostType] = useState<string>("none"); 
  const router = useRouter();

  // Auth & role check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.back();

      setUserData(user);

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists() || userDoc.data().role !== "admin") {
        alert("Access denied: Admins only");
        router.back();
        return;
      }

      setIsAdmin(true);
    });

    return () => unsubscribe();
  }, [router]);

  // Real-time tabs fetch
  useEffect(() => {
    const tabsRef = collection(db, "nav");
    const unsubscribe = onSnapshot(tabsRef, (snapshot) => {
      const data: Tab[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as Tab));
      setTabs(data);

      // Keep current selection or default to first
      setSelectedTab((prevTab) => {
        const found = data.find((t) => t?.id === prevTab?.id);
        if (!found && data.length > 0) return data[0];
        return found || null;
      });
      setSelectedSection((prevSection) => {
        const tab = selectedTab || data[0];
        if (!tab) return null;
        const found = tab.sections.find((s) => s.slug === prevSection?.slug);
        return found || tab.sections[0] || null;
      });
    });

    return () => unsubscribe();
  }, []);

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

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTab || !selectedSection) return alert("Select tab and section");
    if (!isAdmin) return alert("Not authorized");

    setUploading(true);

    try {
      const slug = slugifySentences(title);
      const docRef = await addDoc(collection(db, "posts"), {
        author_id: userData.uid,
        author_name: userData.displayName,
        title,
        content,
        tab_id: selectedTab.id,
        tab_slug: selectedTab.slug,
        section_slug: selectedSection.slug,
        post_type: postType,
        pub_date: getCurrentDate(),
        slug,
        comments: [],
      });

      if (coverPhoto) {
        const imageRef = ref(storage, `posts/${docRef.id}/image`);
        await uploadString(imageRef, coverPhoto, "data_url");
        const downloadURL = await getDownloadURL(imageRef);
        await updateDoc(doc(db, "posts", docRef.id), { image_url: downloadURL });
      }

      // Update latest posts cache
      const latestQuery = query(
        collection(db, "posts"),
        orderBy("pub_date", "desc"),
        limit(5)
      );

      const latestSnap = await getDocs(latestQuery);
      const latestPosts = latestSnap.docs.map((d) => ({
        id: d.id,
        title: d.data().title,
        slug: d.data().slug,
        pub_date: d.data().pub_date,
        image_url: d.data().image_url || null,
      }));

      await setDoc(doc(db, "metadata", "latestPosts"), { posts: latestPosts });

      alert("Post created successfully!");
      router.push("/news");
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Error creating post");
    } finally {
      setUploading(false);
    }
  };

  if (!isAdmin) return null; // Prevent render until admin is verified

  return (
    <form className="flex flex-col w-full" onSubmit={handleCreatePost}>
      {/* TITLE */}
      <label className="text-sm text-blue-600">Title</label>
      <input
        type="text"
        value={title}
        required
        onChange={(e) => setTitle(e.target.value)}
        className="px-4 py-3 border-2 rounded-md text-lg mb-4"
      />

      {/* CONTENT */}
      <label className="text-sm text-blue-600">Content</label>
      <textarea
        rows={15}
        value={content}
        required
        onChange={(e) => setContent(e.target.value)}
        className="px-4 py-3 border-2 rounded-md mb-4"
      ></textarea>

      {/* TAB SELECT */}
      <label className="text-sm text-blue-600">Select Tab</label>
      <select
        value={selectedTab?.id || ""}
        onChange={(e) => {
          const tab = tabs.find((t) => t.id === e.target.value) || null;
          setSelectedTab(tab);
          setSelectedSection(tab?.sections[0] || null);
        }}
        className="px-4 py-3 border-2 rounded-md mb-4"
      >
        {tabs.map((tab) => (
          <option key={tab.id} value={tab.id}>
            {tab.title}
          </option>
        ))}
      </select>

      {/* SECTION SELECT */}
      <label className="text-sm text-blue-600">Select Section</label>
      <select
        value={selectedSection?.slug || ""}
        onChange={(e) => {
          const section =
            selectedTab?.sections.find((s) => s.slug === e.target.value) || null;
          setSelectedSection(section);
        }}
        className="px-4 py-3 border-2 rounded-md mb-4"
      >
        {selectedTab?.sections.map((section) => (
          <option key={section.slug} value={section.slug}>
            {section.title}
          </option>
        ))}
      </select>

      {/* POST TYPE SELECT */}
      <label className="text-sm text-blue-600">Post Type</label>
      <select
        value={postType}
        onChange={(e) => setPostType(e.target.value)}
        className="px-4 py-3 border-2 rounded-md mb-4"
      >
        <option value="none">Normal Post</option>
        <option value="feature">Feature Post</option>
        <option value="recommended">Recommended</option>
        <option value="spotlight">Spotlight</option>
      </select>

      {/* UPLOAD COVER PHOTO */}
      <label className="text-sm text-blue-600">Upload Cover Photo</label>
      <input
        type="file"
        onChange={handleFileReader}
        className="px-4 py-3 border-2 rounded-md mb-4"
        accept="image/jpeg, image/png"
      />

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        className="bg-blue-600 mt-4 text-white py-4 rounded-md"
        disabled={uploading}
      >
        {uploading ? "Creating post..." : "Create Post"}
      </button>
    </form>
  );
}
