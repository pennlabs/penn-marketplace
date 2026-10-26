import { DatePicker } from "@/components/common/DatePicker";

interface Props {
  startDate?: string; // "YYYY-MM-DD"
  endDate?: string;
  onStartDateChange: (date?: string) => void;
  onEndDateChange: (date?: string) => void;
  showLabels?: boolean;
}

const LABEL_CLASS = "mb-2 block text-sm font-medium text-gray-700";

export const DateRangeFields = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  showLabels = false,
}: Props) => {
  const startPicker = (
    <DatePicker label="Start Date" value={startDate} onChange={onStartDateChange} />
  );
  const endPicker = <DatePicker label="End Date" value={endDate} onChange={onEndDateChange} />;

  if (!showLabels) {
    return (
      <>
        {startPicker}
        {endPicker}
      </>
    );
  }

  return (
    <>
      <div>
        <label className={LABEL_CLASS}>Start Date</label>
        {startPicker}
      </div>
      <div>
        <label className={LABEL_CLASS}>End Date</label>
        {endPicker}
      </div>
    </>
  );
};
