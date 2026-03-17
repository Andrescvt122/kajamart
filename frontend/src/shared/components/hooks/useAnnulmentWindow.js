const THIRTY_MINUTES_MS = 30 * 60 * 1000;

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

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
