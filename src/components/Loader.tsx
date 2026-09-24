type LoaderProps = {
  text?: string;
};

export function Loader({ text = 'Загрузка...' }: LoaderProps) {
  return <p className="muted">{text}</p>;
}
