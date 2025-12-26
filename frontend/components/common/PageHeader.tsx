interface Props {
  title: string;
  description: string;
}

export const PageHeader = ({ title, description }: Props) => {
  return (
    <>
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-gray-600 mb-6">{description}</p>
    </>
  );
}