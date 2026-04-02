import { parseDateTimeValue } from "../../utils/dateTime";

const THIRTY_MINUTES_MS = 30 * 60 * 1000;

const toDate = (value) => parseDateTimeValue(value);

export const useAnnulmentWindow = () => {
  const getAnnulmentMeta = (createdAt, isActive) => {
    const createdDate = toDate(createdAt);
    const hasExpired = createdDate
      ? Date.now() - createdDate.getTime() > THIRTY_MINUTES_MS
      : false;

    return {
      isAnnulled: !Boolean(isActive),
      hasExpired,
      isDisabled: !Boolean(isActive) || hasExpired,
      limitMinutes: 30,
    };
  };

  return { getAnnulmentMeta };
};
