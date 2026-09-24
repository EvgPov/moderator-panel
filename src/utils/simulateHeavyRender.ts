// Имитация «дорогого» рендера: подсветка совпадений, форматирование и т. п.
// Не удаляйте вызов этой функции -- он часть задания на оптимизацию.
export function simulateHeavyRender(ms = 0.05) {
  const start = performance.now();
  while (performance.now() - start < ms) {
    // занимаем основной поток
  }
}
