export function normalizeNigerianPhoneNumber(phone: unknown): string | null {
  if (typeof phone !== 'string') return null;

  const trimmed = phone.trim();
  if (!/^\+?[\d\s()-]+$/.test(trimmed)) return null;

  const digits = trimmed.replace(/\D/g, '');
  let nationalNumber: string;

  if (digits.length === 13 && digits.startsWith('234')) {
    nationalNumber = digits.slice(3);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    nationalNumber = digits.slice(1);
  } else if (digits.length === 10) {
    nationalNumber = digits;
  } else {
    return null;
  }

  if (!/^[789]\d{9}$/.test(nationalNumber)) return null;
  if (trimmed.startsWith('+') && !trimmed.startsWith('+234')) return null;

  return `+234${nationalNumber}`;
}
