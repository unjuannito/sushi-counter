export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return "Unknown date";
  
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "Invalid date";

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // APP_CONSTANTS.MONTHS are 0 to 11
  const year = date.getFullYear();

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
