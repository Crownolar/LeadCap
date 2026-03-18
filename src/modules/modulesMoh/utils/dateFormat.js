function getUTCDayRange(dateStr) {
  if (!dateStr) return { fromDate: undefined, toDate: undefined };

  const date = new Date(dateStr);

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return {
    fromDate: start.toISOString(),
    toDate: end.toISOString(),
  };
}

export default getUTCDayRange;