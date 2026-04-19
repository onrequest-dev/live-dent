export async function fetchWithRetry(url: string, options: RequestInit, maxRetries: number = 7): Promise<Response> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok || i === maxRetries - 1) {
        return response; // نجاح أو آخر محاولة
      }
      // انتظر ثانية واحدة قبل إعادة المحاولة
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      lastError = error as Error;
      if (i === maxRetries - 1) throw lastError;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw lastError!;
}
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}