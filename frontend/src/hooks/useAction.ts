import { useLoadingStore } from "@/store/loadingStore";

export function useAction() {
  const { startLoading, stopLoading } = useLoadingStore();

  // Wraps any async function to automatically handle the global loader
  const run = async <T>(
    action: () => Promise<T>,
    loadingText = "Processing..."
  ): Promise<T> => {
    try {
      startLoading(loadingText);
      const result = await action();
      return result;
    } finally {
      stopLoading();
    }
  };

  return { run };
}