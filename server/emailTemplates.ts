/**
 * Comfy's Glow — Glow with Elegance
 * Brand-Styled Transactional Email Templates
 */

import type { Order } from '../src/types/index.ts';

function formatNaira(amount: number): string {
  return '₦' + amount.toLocaleString('en-NG');
}

export function generateOrderEmailHtml(order: Order, status: 'confirmed' | 'dispatched' | 'delivered'): {
  subject: string;
  html: string;
} {
  const brandGold = '#C9A15B';
  const brandBurgundy = '#59172F';
  const brandPlum = '#5B286F';
  const brandIvory = '#FFF9F2';
  const brandCharcoal = '#29232B';

  let statusTitle = '';
  let statusBannerText = '';
  let statusBannerBg = brandBurgundy;
  let statusDescription = '';
  let subject = '';

  switch (status) {
    case 'confirmed':
      subject = `Order Confirmed [${order.reference}] — Comfy's Glow`;
      statusTitle = 'Your Order Has Been Confirmed';
      statusBannerBg = brandBurgundy;
      statusBannerText = 'Confirmed & In Production';
      statusDescription = `Dear ${order.customer.fullName}, your order <strong>${order.reference}</strong> has been officially confirmed by our beauty boutique team. We are carefully preparing your artisanal beauty selections for dispatch.`;
      break;
    case 'dispatched':
      subject = `Order Dispatched & On Its Way [${order.reference}] — Comfy's Glow`;
      statusTitle = 'Your Glow Is On The Way!';
      statusBannerBg = brandPlum;
      statusBannerText = 'Dispatched / In Transit';
      statusDescription = `Exciting news, ${order.customer.fullName}! Your package for order <strong>${order.reference}</strong> has been handed to our trusted delivery courier for prompt delivery to ${order.delivery.town}, ${order.delivery.state}.`;
      break;
    case 'delivered':
      subject = `Order Delivered! [${order.reference}] — Comfy's Glow`;
      statusTitle = 'Package Successfully Delivered';
      statusBannerBg = '#2E7D32'; // refined forest green
      statusBannerText = 'Delivered';
      statusDescription = `Hello ${order.customer.fullName}, your package for order <strong>${order.reference}</strong> has been marked as delivered. We hope our nourishing skincare brings unmatched elegance and radiance to your daily self-care ritual!`;
      break;
  }

  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #E9DDF2;">
        <div style="font-weight: 600; color: ${brandCharcoal}; font-size: 15px;">${item.name}</div>
        ${item.selectedVariant ? `<div style="font-size: 13px; color: #736B76;">Size / Variant: ${item.selectedVariant}</div>` : ''}
        <div style="font-size: 13px; color: #736B76;">Quantity: ${item.quantity} × ${formatNaira(item.unitPrice)}</div>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #E9DDF2; text-align: right; font-weight: 600; color: ${brandBurgundy}; font-size: 15px;">
        ${formatNaira(item.lineTotal)}
      </td>
    </tr>
  `
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: ${brandIvory}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: ${brandCharcoal}; line-height: 1.6;">
  <table role="presentation" style="max-width: 620px; width: 100%; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #EADDCF; box-shadow: 0 4px 20px rgba(89, 23, 47, 0.05);">
    <!-- Brand Header -->
    <tr>
      <td style="background-color: ${brandBurgundy}; padding: 32px 24px; text-align: center; border-bottom: 3px solid ${brandGold};">
        <div style="font-family: Georgia, serif; font-size: 26px; color: #FFFFFF; letter-spacing: 2px; font-weight: bold; margin-bottom: 4px;">
          COMFY’S GLOW
        </div>
        <div style="font-size: 12px; color: ${brandGold}; text-transform: uppercase; letter-spacing: 3px; font-weight: 600;">
          Glow with Elegance • Ado-Ekiti, Nigeria
        </div>
      </td>
    </tr>

    <!-- Status Banner -->
    <tr>
      <td style="padding: 24px 32px 10px 32px;">
        <div style="display: inline-block; background-color: ${statusBannerBg}; color: #FFFFFF; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">
          ${statusBannerText}
        </div>
        <h1 style="font-family: Georgia, serif; font-size: 24px; color: ${brandBurgundy}; margin: 16px 0 10px 0;">
          ${statusTitle}
        </h1>
        <p style="font-size: 15px; color: #4A434D; margin: 0 0 20px 0;">
          ${statusDescription}
        </p>
      </td>
    </tr>

    <!-- Order Summary Card -->
    <tr>
      <td style="padding: 0 32px;">
        <div style="background-color: ${brandIvory}; border: 1px solid #E8DCDE; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="font-size: 13px; color: #736B76; text-transform: uppercase; letter-spacing: 1px;">Order Reference</td>
              <td style="font-size: 13px; color: #736B76; text-transform: uppercase; letter-spacing: 1px; text-align: right;">Order Date</td>
            </tr>
            <tr>
              <td style="font-size: 18px; font-weight: bold; color: ${brandBurgundy};">${order.reference}</td>
              <td style="font-size: 14px; font-weight: 500; color: ${brandCharcoal}; text-align: right;">${new Date(order.createdAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</td>
            </tr>
          </table>
        </div>
      </td>
    </tr>

    <!-- Items List -->
    <tr>
      <td style="padding: 0 32px;">
        <h2 style="font-family: Georgia, serif; font-size: 18px; color: ${brandBurgundy}; margin: 0 0 12px 0; border-bottom: 2px solid ${brandGold}; padding-bottom: 6px;">
          Selected Items
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
        </table>
      </td>
    </tr>

    <!-- Totals -->
    <tr>
      <td style="padding: 16px 32px 24px 32px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; font-size: 14px; color: #736B76;">Subtotal</td>
            <td style="padding: 4px 0; font-size: 14px; text-align: right; color: ${brandCharcoal};">${formatNaira(order.subtotal)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-size: 14px; color: #736B76;">Delivery Charge (${order.delivery.zoneName || order.delivery.state})</td>
            <td style="padding: 4px 0; font-size: 14px; text-align: right; color: ${brandCharcoal};">
              ${order.deliveryFee > 0 ? formatNaira(order.deliveryFee) : 'To be confirmed'}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0 0 0; font-size: 18px; font-weight: bold; color: ${brandBurgundy}; border-top: 1px solid #E9DDF2;">Total</td>
            <td style="padding: 12px 0 0 0; font-size: 20px; font-weight: bold; text-align: right; color: ${brandBurgundy}; border-top: 1px solid #E9DDF2;">${formatNaira(order.total)}</td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Delivery & Contact Details -->
    <tr>
      <td style="padding: 0 32px 32px 32px;">
        <div style="background-color: #FBF8F5; border: 1px solid #ECE3D7; border-radius: 8px; padding: 20px;">
          <h3 style="font-size: 15px; margin: 0 0 10px 0; color: ${brandBurgundy}; font-family: Georgia, serif;">Delivery Destination</h3>
          <p style="margin: 0 0 6px 0; font-size: 14px; color: #4A434D;">
            <strong>Recipient:</strong> ${order.customer.fullName} (${order.customer.phone})
          </p>
          <p style="margin: 0; font-size: 14px; color: #4A434D;">
            <strong>Address:</strong> ${order.delivery.address}, ${order.delivery.town}, ${order.delivery.state}
          </p>
          ${order.delivery.instructions ? `<p style="margin: 6px 0 0 0; font-size: 13px; color: #736B76;"><em>Instructions: ${order.delivery.instructions}</em></p>` : ''}
        </div>
      </td>
    </tr>

    <!-- Customer Support Footer -->
    <tr>
      <td style="background-color: #FAF4EB; padding: 24px 32px; border-top: 1px solid #EADDCF; font-size: 13px; color: #695E69; text-align: center;">
        <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: ${brandBurgundy};">
          Questions or Delivery Updates?
        </p>
        <p style="margin: 0 0 8px 0;">
          Call us directly: <a href="tel:0000000000" style="color: ${brandBurgundy}; font-weight: bold; text-decoration: none;">000-000-0000</a>
        </p>
        <p style="margin: 0 0 12px 0;">
          Email: <a href="mailto:contact@example.invalid" style="color: ${brandBurgundy}; text-decoration: none;">contact@example.invalid</a>
        </p>
        <div style="margin-top: 16px;">
          <a href="https://wa.me/2348020836595?text=Hello%20Comfys%20Glow%2C%20inquiring%20about%20my%20order%20${order.reference}" style="display: inline-block; background-color: ${brandGold}; color: #FFFFFF; text-decoration: none; padding: 8px 18px; border-radius: 6px; font-size: 13px; font-weight: bold;">
            Chat on WhatsApp
          </a>
        </div>
        <p style="margin: 20px 0 0 0; font-size: 11px; color: #A098A2;">
          © 2026 Comfy’s Glow. Glow with Elegance. Ado-Ekiti, Ekiti State, Nigeria.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { subject, html };
}
