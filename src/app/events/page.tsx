import Footer from "@/app/components/Footer";

// Disable automatic ISR; we’ll manually trigger revalidation
// export const revalidate = false;

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-[#f5f7ff] py-10 px-6 flex flex-col items-center">
      {/* <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        Upcoming Events
      </h1> */}

      <div className="w-full max-w-5xl mb-10">
        <iframe
          src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FNew_York&showTitle=0&src=c2hpZnV0dUBnbWFpbC5jb20&src=ZW4udXNhI2hvbGlkYXlAZ3JvdXAudi5jYWxlbmRhci5nb29nbGUuY29t&color=%237986cb&color=%230b8043"
          style={{ border: 0 }}
          width="100%"
          height="600"
        ></iframe>
      </div>

      {/* Footer */}
      <div className="w-full">
        <Footer />
      </div>
    </main>
  );
}

