interface Props {
  description?: string;
}

const NO_DESCRIPTION = "No description";

export const ListingDescription = ({ description }: Props) => {
  const hasDescription = description && description.trim().length > 0;

  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">Description</h2>
      <p className="text-sm leading-relaxed whitespace-pre-line text-gray-700">
        {hasDescription ? description : NO_DESCRIPTION}
      </p>
    </section>
  );
};
