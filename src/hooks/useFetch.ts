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
  return {
    data: null,
    isLoading: false,
    error: null,
    status: null,
    refetch: () => {},
  };
}
