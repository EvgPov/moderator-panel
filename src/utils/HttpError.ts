// Наследуемся от Error, чтобы через instanceof HttpError в catch
// отличать HTTP-ошибку (сервер ответил, но с кодом) от сетевой (запрос не дошёл)

export class HttpError extends Error {
  // Добавляем поле status (HTTP-код), которого нет во встроенном Error
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
