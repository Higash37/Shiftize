

type HolidayMap = Record<string, string>;

let cachedHolidays: HolidayMap | null = null;

let fetchPromise: Promise<HolidayMap> | null = null;

async function fetchHolidaysFromAPI(): Promise<HolidayMap> {

  if (cachedHolidays) return cachedHolidays;

  try {
    const res = await fetch(
      "https://holidays-jp.github.io/api/v1/date.json"
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: HolidayMap = await res.json();
    cachedHolidays = data;
    return data;
  } catch {

    return {};
  }
}

export async function loadJapaneseHolidays(): Promise<HolidayMap> {
  if (cachedHolidays) return cachedHolidays;
  if (!fetchPromise) {
    fetchPromise = fetchHolidaysFromAPI().finally(() => {

      fetchPromise = null;
    });
  }
  return fetchPromise;
}

export function getHolidaysSync(): HolidayMap {
  if (cachedHolidays) return cachedHolidays;

  loadJapaneseHolidays();
  return {};
}

export function isHoliday(dateString: string): boolean {
  const holidays = getHolidaysSync();

  return dateString in holidays;
}

export function getHolidayName(dateString: string): string | undefined {
  const holidays = getHolidaysSync();
  return holidays[dateString];
}
