/**
 * Generates a unique 10-digit alphanumeric patient registration ID.
 * Example format: MB-A1B2C3D4E5
 * @returns {string} 10-digit alphanumeric string
 */
export const generatePatientRegId = (): string => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
