const all_characters =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
const otp_characters = '0123456789';

export const Text = (length = 20) => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += all_characters.charAt(
      Math.floor(Math.random() * all_characters.length)
    );
  }
  return result;
};

export const OTP = (length = 4) => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += otp_characters.charAt(
      Math.floor(Math.random() * otp_characters.length)
    );
  }
  return result;
};

export const Integer = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
