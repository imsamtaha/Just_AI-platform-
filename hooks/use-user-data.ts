import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import type { User } from "@/types";

export function useUserData() {
  const { user: clerkUser, isLoaded } = useUser();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !clerkUser) {
      if (isLoaded) setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user");
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [isLoaded, clerkUser]);

  return { userData, loading, error };
}
