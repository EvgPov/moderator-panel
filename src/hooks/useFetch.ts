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
 * Хук загрузки данных (GET-запрос).
 *
 * - Запрос уходит при монтировании и при каждой смене url.
 * - Ответ со статусом 4xx/5xx считается ошибкой (проверка response.ok),
 *   его код записывается в status.
 * - HTTP-ошибка показывается как «Ошибка N», сетевая — как «Нет соединения с сервером».
 * - Предыдущий запрос отменяется через AbortController при смене url
 *   и при размонтировании компонента; AbortError не считается ошибкой.
 * - refetch() увеличивает счётчик retryCount. Он стоит в зависимостях useEffect,
 *   поэтому эффект перезапускается и запрос уходит заново по тому же url.
 */
export function useFetch<T>(url: string): FetchState<T> {

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
      } catch (err) {
        if (err instanceof HttpError) {
          // сервер ответил, но с кодом 4xx/5xx
          setError(err.message);
        } else if (err instanceof Error && err.name !== 'AbortError') {
          // ответа не было: нет сети, сервер недоступен
          setError('Нет соединения с сервером');
        }
      } finally {
        // Отменённый запрос не должен снимать флаг загрузки у нового запроса
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
