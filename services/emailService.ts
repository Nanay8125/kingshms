import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // For demo purposes, we'll use a test SMTP service
    // In production, you'd use a real SMTP service like SendGrid, Mailgun, etc.
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'demo@example.com',
        pass: process.env.EMAIL_PASS || 'demo-password'
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // For demo purposes, log the email instead of sending it
      console.log('=== EMAIL WOULD BE SENT ===');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('HTML Content Length:', options.html.length);
      console.log('Text Content Length:', options.text?.length || 0);
      console.log('=== EMAIL CONTENT PREVIEW ===');
      console.log('HTML:', options.html.substring(0, 200) + '...');
      if (options.text) {
        console.log('Text:', options.text.substring(0, 200) + '...');
      }
      console.log('=== END EMAIL PREVIEW ===');

      // In production, uncomment the following lines:
      /*
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"LuxeStay Hotels" <noreply@luxestay.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      */

      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      // For demo purposes, we'll log but not throw - in production you'd want to handle this properly
      return false;
    }
  }

  generateBookingConfirmationEmail(booking: any, guest: any, room: any, category: any): EmailOptions {
    const checkInDate = new Date(booking.checkIn).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const checkOutDate = new Date(booking.checkOut).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const nights = Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24));

    return {
      to: guest.email,
      subject: `Booking Confirmation - ${booking.id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Booking Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; background-color: #f1f5f9; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 24px; }
            .card { background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08); }
            .header { background: #0f172a; color: #ffffff; padding: 28px; text-align: center; }
            .brand { font-size: 18px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
            .headline { font-size: 26px; font-weight: 800; margin: 8px 0 0; }
            .content { padding: 28px; }
            .section { margin: 20px 0; }
            .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; font-weight: 700; }
            .value { font-size: 14px; font-weight: 700; color: #0f172a; }
            .divider { height: 1px; background: #e2e8f0; margin: 20px 0; }
            .summary { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
            .total { font-size: 22px; font-weight: 800; color: #4f46e5; text-align: right; }
            .pill { display: inline-block; background: #e0e7ff; color: #4338ca; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
            .footer { text-align: center; margin-top: 22px; color: #64748b; font-size: 12px; }
            .muted { color: #64748b; font-size: 13px; }
            .cta { display: inline-block; margin-top: 10px; padding: 10px 16px; background: #0f172a; color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 13px; font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <div class="brand">LuxeStay</div>
                <div class="headline">Booking Confirmed</div>
                <div class="muted" style="color:#cbd5f5;">Your reservation is secured</div>
              </div>
              <div class="content">
                <p style="margin:0 0 10px 0;">Hi ${guest.name},</p>
                <p class="muted" style="margin:0 0 18px 0;">Thank you for booking with LuxeStay. Below is your reservation summary.</p>

                <div class="summary">
                  <div class="label">Confirmation</div>
                  <div class="value">LS-${booking.id}</div>
                  <div class="divider"></div>

                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="padding-bottom:10px;">
                        <div class="label">Room</div>
                        <div class="value">Room ${room.number} &bull; ${category.name}</div>
                      </td>
                      <td style="padding-bottom:10px; text-align:right;">
                        <div class="label">Guests</div>
                        <div class="value">${booking.guestsCount}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom:10px;">
                        <div class="label">Check-in</div>
                        <div class="value">${checkInDate}</div>
                      </td>
                      <td style="padding-bottom:10px; text-align:right;">
                        <div class="label">Check-out</div>
                        <div class="value">${checkOutDate}</div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div class="label">Nights</div>
                        <div class="value">${nights}</div>
                      </td>
                      <td style="text-align:right;">
                        <div class="label">Status</div>
                        <div class="pill">Confirmed</div>
                      </td>
                    </tr>
                  </table>
                </div>

                <div class="section">
                  <div class="label">Total Amount</div>
                  <div class="total">$${booking.totalPrice}</div>
                </div>

                <div class="divider"></div>

                <div class="section">
                  <div class="label">Important Info</div>
                  <p class="muted" style="margin:6px 0 0;">
                    Check-in 3:00 PM &bull; Check-out 11:00 AM &bull; Please bring a valid ID and credit card for incidentals.
                  </p>
                  <p class="muted" style="margin:6px 0 0;">
                    Complimentary WiFi and parking included.
                  </p>
                </div>

                <div class="section">
                  <div class="label">Need Help?</div>
                  <p class="muted" style="margin:6px 0 0;">
                    Email reservations@luxestay.com or call +1 (555) 123-4567.
                  </p>
                  <a class="cta" href="https://luxestay.com">View Reservation</a>
                </div>

                <p style="margin:18px 0 0;">Warm regards,<br><strong>The LuxeStay Team</strong></p>
              </div>
            </div>
            <div class="footer">
              LuxeStay Hotels & Resorts &bull; 123 Luxury Avenue, Paradise City
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Booking Confirmation - ${booking.id}

        Hi ${guest.name},

        Thanks for booking with LuxeStay! Your reservation is confirmed.

        Booking Details:
        - Confirmation: LS-${booking.id}
        - Room: ${room.number} - ${category.name}
        - Check-in: ${checkInDate}
        - Check-out: ${checkOutDate}
        - Guests: ${booking.guestsCount}
        - Nights: ${nights}
        - Total: $${booking.totalPrice}

        Check-in time: 3:00 PM
        Check-out time: 11:00 AM
        Please bring a valid ID and credit card for incidentals.
        Complimentary WiFi and parking included.

        Need help? reservations@luxestay.com | +1 (555) 123-4567

        We look forward to your stay.

        Best regards,
        The LuxeStay Team
      `
    };
  }

  generateFoodOrderConfirmationEmail(order: any, guest: any, room: any): EmailOptions {
    const orderTime = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const itemsList = order.items.map((item: any) =>
      `${item.quantity}x ${item.item.name} - $${(item.item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    return {
      to: guest.email,
      subject: `Food Order Confirmation - Room ${room.number}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Food Order Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px; }
            .order-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .total { font-size: 24px; font-weight: bold; color: #f5576c; text-align: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍽️ Order Confirmed!</h1>
              <p>Your delicious meal is being prepared</p>
            </div>
            <div class="content">
              <h2>Dear ${guest.name},</h2>
              <p>Thank you for your order! Our chefs are preparing your meal with the finest ingredients.</p>

              <div class="order-details">
                <h3>Order Details</h3>
                <p><strong>Room:</strong> ${room.number}</p>
                <p><strong>Order Time:</strong> ${orderTime}</p>
                <p><strong>Items:</strong></p>
                <pre style="font-family: Arial, sans-serif; white-space: pre-line;">${itemsList}</pre>
              </div>

              <div class="total">
                Total Amount: $${order.total.toFixed(2)}
              </div>

              <p><strong>Estimated Delivery Time:</strong> 25-35 minutes</p>

              <p>If you have any special dietary requirements or need to modify your order, please contact room service immediately at extension 777.</p>

              <p>Enjoy your meal!</p>

              <p>Best regards,<br>The LuxeStay Culinary Team</p>
            </div>
            <div class="footer">
              <p>LuxeStay Hotels & Resorts | In-Room Dining Service</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Food Order Confirmation - Room ${room.number}

        Dear ${guest.name},

        Thank you for your order! Your meal is being prepared.

        Order Details:
        - Room: ${room.number}
        - Order Time: ${orderTime}
        - Items:
        ${itemsList}

        - Total: $${order.total.toFixed(2)}

        Estimated Delivery: 25-35 minutes

        Enjoy your meal!

        Best regards,
        The LuxeStay Culinary Team
      `
    };
  }
}

export const emailService = new EmailService();
