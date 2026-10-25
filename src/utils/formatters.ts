/**
 * Currency, phone, date, and WhatsApp helpers
 */

export function formatNaira(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₦0';
  return '₦' + Math.round(amount).toLocaleString('en-NG');
}

export function formatPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function getWhatsAppOrderLink(
  reference: string,
  total: number,
  itemCount: number,
  town: string
): string {
  const phone = '2348020836595';
  const text = encodeURIComponent(
    `Hello Comfy's Glow, I have submitted order [${reference}] (${itemCount} items, Total: ${formatNaira(total)}) for delivery to ${town}. Please confirm my order and payment details. Thank you!`
  );
  return `https://wa.me/${phone}?text=${text}`;
}

export function getWhatsAppInquiryLink(productName?: string): string {
  const phone = '2348020836595';
  const text = productName
    ? encodeURIComponent(`Hello Comfy's Glow, I would like to inquire about "${productName}".`)
    : encodeURIComponent("Hello Comfy's Glow, I would like to ask about your products and wholesale options.");
  return `https://wa.me/${phone}?text=${text}`;
}

export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/Comfy_glow24',
  facebook: 'https://web.facebook.com/profile.php?id=100088602207052',
  whatsapp: 'https://wa.me/2348020836595',
  instagramHandle: '@Comfy_glow24',
  facebookHandle: 'Comfort Oluwarantimi',
};
