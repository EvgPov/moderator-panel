// Имитация «дорогого» рендера: подсветка совпадений, форматирование и т. п.
// Намеренно занимает основной поток, чтобы был заметен эффект оптимизаций.
export function simulateHeavyRender(ms = 0.05) {
  const start = performance.now();
  while (performance.now() - start < ms) {
    // занимаем основной поток
  }
}
