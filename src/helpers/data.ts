// Fungsi bantuan untuk mendapatkan nomor minggu dalam tahun
function getWeekNumber(date: any) {
  const yearStart: any = new Date(date.getFullYear(), 0, 1);
  const diff = date - yearStart;
  const weekNumber = Math.ceil((diff + yearStart.getDay() + 1) / 604800000);

  return weekNumber;
}

// Fungsi bantuan untuk mendapatkan nomor minggu saat ini
function getCurrentWeekNumber() {
  const currentDate = new Date();
  return getWeekNumber(currentDate);
}

export const filterDataByWeek = (data: any[], date_selector = "created_at") => {
  let currentWeek = null;
  let currentWeekData = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const week = getWeekNumber(new Date(row[date_selector]));
    if (currentWeek === null) {
      currentWeek = week;
    }
    if (week !== currentWeek) {
      if (currentWeek === getCurrentWeekNumber()) {
        currentWeekData.push(...currentWeekData);
        break;
      }
      currentWeek = week;
      currentWeekData = [];
    }
    currentWeekData.push(row);
  }
  return currentWeekData;
};
