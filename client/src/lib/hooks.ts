import { useState, useEffect } from "react";

export function useTypingIndicator(channelId: number) {
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    // Simulate typing indicator logic
    const timer = setTimeout(() => {
      setIsTyping(false);
      setTypingUsers([]);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isTyping]);

  const startTyping = (userName: string) => {
    setIsTyping(true);
    setTypingUsers(prev => [...prev.filter(u => u !== userName), userName]);
  };

  const stopTyping = (userName: string) => {
    setTypingUsers(prev => prev.filter(u => u !== userName));
    if (typingUsers.length <= 1) {
      setIsTyping(false);
    }
  };

  return {
    isTyping,
    typingUsers,
    startTyping,
    stopTyping
  };
}

export function usePresence(userId: number) {
  const [status, setStatus] = useState<"online" | "offline" | "away" | "busy">("offline");

  useEffect(() => {
    // Simulate presence updates
    const interval = setInterval(() => {
      // Randomly update status for demo
      const statuses: ("online" | "offline" | "away" | "busy")[] = ["online", "away", "busy"];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setStatus(randomStatus);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [userId]);

  const updateStatus = (newStatus: "online" | "offline" | "away" | "busy") => {
    setStatus(newStatus);
    // In a real app, this would make an API call
  };

  return { status, updateStatus };
}

export function usePolling<T>(
  queryKey: string[],
  fetcher: () => Promise<T>,
  interval: number = 5000
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetcher();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return { data, isLoading, error };
}
