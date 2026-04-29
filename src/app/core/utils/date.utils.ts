export function startOfDay(date = new Date()): Date {
  const currentDate = new Date(date);
  currentDate.setHours(0, 0, 0, 0);

  return currentDate;
}

export function endOfDay(date = new Date()): Date {
  const currentDate = new Date(date);
  currentDate.setHours(23, 59, 59, 999);

  return currentDate;
}
