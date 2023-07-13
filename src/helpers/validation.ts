export const isArray = (value: any) => {
  return value && typeof value === 'object' && Array.isArray(value);
};
export const isObject = (value: any) => {
  return value && typeof value === 'object' && !Array.isArray(value);
};

export const isUndefined = (value: any) => typeof value === 'undefined';

export const isNumber = (val: any) => /^(\d+)$/.test(val);
export const isDateFormat = (date: any) => /^\d{4}-\d{2}-\d{2}$/.test(date);
