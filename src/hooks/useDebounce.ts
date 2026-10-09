import { useEffect, useState } from 'react';
/**
 * Отложенное значение (debounce).
 *
 * Возвращает value, но обновляет его только тогда,
 * когда исходное значение не менялось delay миллисекунд.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Ставим таймер: обновить debouncedValue через delay мс
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // React вызовет эту функцию перед новым запуском эффекта (смена value или delay)
    // и при размонтировании компонента, поэтому старый таймер не сработает
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}