type ErrorMessageProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="error-box">
      <p>Не удалось загрузить данные: {message}</p>
      {onRetry && (
        <button type="button" className="button" onClick={onRetry}>
          Повторить
        </button>
      )}
    </div>
  );
}
