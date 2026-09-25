import { useState, useEffect } from 'react'
import { HttpError } from '../utils/HttpError'

export type FetchState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  // HTTP-статус последнего ответа. Нужен, чтобы отличить 404 от других ошибок
  status: number | null;
  // Повторить запрос (для кнопки «Повторить»)
  refetch: () => void;
};

/**
 * TODO (задача 1): реализуйте хук загрузки данных.
 *
 * Требования:
 * - запрос уходит при монтировании и при каждой смене url;
 * - isLoading = true, пока запрос выполняется;
 * - ответ со статусом 4xx/5xx считается ошибкой (проверьте response.ok);
 * - в status записывается HTTP-статус ответа;
 * - предыдущий запрос отменяется через AbortController
 *   (при смене url и при размонтировании компонента);
 * - AbortError не показывается пользователю как ошибка;
 * - refetch() повторяет запрос по тому же url.
 *
 * Подсказка для refetch: заведите в хуке счётчик попыток
 * и добавьте его в зависимости useEffect.
 */
export function useFetch<T>(url: string): FetchState<T> {
  // Заглушка, чтобы проект собирался. Замените её своей реализацией.

  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<number | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setIsLoading(true)
        setError(null)
        setData(null)
        setStatus(null)

        if (url) {
          const response = await fetch(url, { signal: controller.signal})
          setStatus(response.status);

          // response.ok — true, если код от 200 до 299, иначе false.
          if (!response.ok) {
            throw new HttpError(`Ошибка ${response.status}`, response.status)
          }

          const result: T = await response.json();
          setData(result)
        }  
      } catch(err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }  
      }
    }  

    load();
    return () => controller.abort();
  }, [url, retryCount])   
  
  function refetch() {
    setRetryCount((count) => count + 1)
  }

  return {
    data,
    isLoading,
    error,
    status,
    refetch,
  };
}
