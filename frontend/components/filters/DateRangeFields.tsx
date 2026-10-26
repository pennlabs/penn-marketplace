import { DatePicker } from "@/components/filters/DatePicker";
import { parseDateOnly, toDateOnlyString } from "@/lib/utils";

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
    <DatePicker
      label="Start Date"
      date={startDate ? parseDateOnly(startDate) : undefined}
      onDateChange={(date) => onStartDateChange(date ? toDateOnlyString(date) : undefined)}
    />
  );
  const endPicker = (
    <DatePicker
      label="End Date"
      date={endDate ? parseDateOnly(endDate) : undefined}
      onDateChange={(date) => onEndDateChange(date ? toDateOnlyString(date) : undefined)}
    />
  );

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
