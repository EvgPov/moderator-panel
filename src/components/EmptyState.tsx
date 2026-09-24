type EmptyStateProps = {
  text: string;
};

export function EmptyState({ text }: EmptyStateProps) {
  return <p className="muted">{text}</p>;
}
