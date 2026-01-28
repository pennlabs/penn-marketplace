interface Props {
  title: string;
  description: string;
}

export const PageHeader = ({ title, description }: Props) => {
  return (
    <>
      <h1 className="mb-2 text-2xl font-bold">{title}</h1>
      <p className="mb-6 text-gray-600">{description}</p>
    </>
  );
};
