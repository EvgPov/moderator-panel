import { useEffect, useState } from 'react';
/**
 * TODO (задача 2): реализуйте хук debounce.
 *
 * Хук возвращает value, но обновляет его только тогда,
 * когда исходное значение не менялось delay миллисекунд.
 * Не забудьте очищать таймер в функции очистки useEffect.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Ставим таймер: обновить debouncedValue через delay мс
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // При смене value React вызовет эту функцию перед новым запуском эффекта,
   // и старый таймер не сработает
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}