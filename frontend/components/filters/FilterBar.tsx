interface Props {
  children: React.ReactNode;
}

export const FilterBar = ({ children }: Props) => {
  return (
    <div className="flex w-full flex-wrap items-center gap-3 rounded-lg bg-white p-4 shadow-sm">
      {children}
    </div>
  );
};
