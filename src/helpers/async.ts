interface IProcessingCallback<T> {
  (row: T, i: number): Promise<any>;
}

export const createPromise = async <T>(
  array: T[],
  processing: IProcessingCallback<T>
): Promise<any[]> => {
  let i = 0;
  const result: T[] = [];
  while (i < array.length) {
    const row = array[i];
    result.push(await processing(row, i));
    i++;
  }
  return result;
};
