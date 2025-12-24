interface Props {
  children: React.ReactNode;
}

export const FilterBar = ({ children }: Props) => {
  return (
    <div className="flex items-center gap-3 w-full flex-wrap bg-white rounded-lg p-4 shadow-sm">
      {children}
    </div>
  );
}