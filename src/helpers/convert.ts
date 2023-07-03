export const newNameUpload = (filename: string) => {
  filename = String(filename).replace(/ /g, "_").toLowerCase();
  const now = new Date();
  return `${now.getFullYear()}-${
    now.getMonth() + 1
  }-${now.getDate()}_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}-${now.getMilliseconds()}-${filename}`;
};

export const createProductUrl = (name: string) =>
  String(name)
    .toLowerCase()
    .replace(/[~`!@#$%^&*()-\_+={}\[\]:;"'<>,.?/|\\]/g, "")
    .replace(/\s+/g, "-");
