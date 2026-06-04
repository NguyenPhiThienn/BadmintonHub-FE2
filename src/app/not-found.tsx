"use client"

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <div>
      <div className="text-center mt-20">
        <h1 className="text-3xl font-semibold text-neutral-300 mb-4">
          Page Not Found
        </h1>
        <p className="text-[#909296] mb-6">Oops! Page not found.</p>
        <button
          className="bg-primary hover:bg-opacity-90 !text-emerald-50/80 px-3 py-2 rounded-lg"
          onClick={() => router.back()}
        >
          Return
        </button>
      </div>
    </div>
  );
}
