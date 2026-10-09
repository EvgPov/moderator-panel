import { useCallback, useState } from 'react';

type MutationOptions = {
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
};

type MutationState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  // Возвращает созданный объект или null, если запрос завершился ошибкой
  execute: (body?: unknown) => Promise<T | null>;
};

// Хук для запросов по действию пользователя (POST, PUT, PATCH, DELETE):
// запрос уходит только при вызове execute().
export function useMutation<T>(
  url: string,
  options: MutationOptions = {}
): MutationState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const method = options.method ?? 'POST';

  const execute = useCallback(
    async (body?: unknown): Promise<T | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
          throw new Error(`Ошибка ${response.status}`);
        }

        const result: T = await response.json();
        setData(result);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [url, method]
  );

  return { data, isLoading, error, execute };
}
