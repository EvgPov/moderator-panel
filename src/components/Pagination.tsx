type PaginationProps = {
  page: number;
  hasNext: boolean;
  isDisabled: boolean;
  onChange: (page: number) => void;
};

export function Pagination({ page, hasNext, isDisabled, onChange }: PaginationProps) {
  return (
    <div className="pagination">
      <button
        type="button"
        className="button"
        disabled={page === 1 || isDisabled}
        onClick={() => onChange(page - 1)}
      >
        Назад
      </button>
      <span>Страница {page}</span>
      <button
        type="button"
        className="button"
        disabled={!hasNext || isDisabled}
        onClick={() => onChange(page + 1)}
      >
        Вперёд
      </button>
    </div>
  );
}
