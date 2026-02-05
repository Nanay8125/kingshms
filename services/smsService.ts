import twilio from 'twilio';

interface SMSOptions {
  to: string;
  message: string;
}

class SMSService {
  private client: twilio.Twilio;

  constructor() {
    // For demo purposes, we'll use mock SMS sending
    // In production, you'd use real Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID || 'ACdemo-account-sid-demo-demo-demo-demo';
    const authToken = process.env.TWILIO_AUTH_TOKEN || 'demo-auth-token-demo-demo-demo-demo';
    const fromNumber = process.env.TWILIO_FROM_NUMBER || '+1234567890';

    this.client = twilio(accountSid, authToken);
  }

  async sendSMS(options: SMSOptions): Promise<boolean> {
    try {
      // For demo purposes, log the SMS instead of sending it
      console.log('=== SMS WOULD BE SENT ===');
      console.log('To:', options.to);
      console.log('Message Length:', options.message.length);
      console.log('=== SMS CONTENT PREVIEW ===');
      console.log('Message:', options.message);
      console.log('=== END SMS PREVIEW ===');

      // In production, uncomment the following lines:
      /*
      await this.client.messages.create({
        body: options.message,
        from: process.env.TWILIO_FROM_NUMBER,
        to: options.to
      });
      */

      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      // For demo purposes, we'll log but not throw - in production you'd want to handle this properly
      return false;
    }
  }

  generateBookingConfirmationSMS(booking: any, guest: any, room: any): SMSOptions {
    const checkInDate = new Date(booking.checkIn).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    const checkOutDate = new Date(booking.checkOut).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    const message = `StayOS: Booking confirmed! 🎉\nRoom ${room.number}\n${checkInDate} - ${checkOutDate}\n${booking.guestsCount} guests\nTotal: $${booking.totalPrice}\nCheck-in: 3PM`;

    return {
      to: guest.phone || '+1234567890', // Fallback for demo
      message: message
    };
  }

  generateFoodOrderConfirmationSMS(order: any, guest: any, room: any): SMSOptions {
    const itemsCount = order.items.length;
    const total = order.total;

    const message = `StayOS: Order received! 🍽️\nRoom ${room.number}\n${itemsCount} items ordered\nTotal: $${total.toFixed(2)}\nDelivery: 25-35 mins\nCall 777 for changes`;

    return {
      to: guest.phone || '+1234567890', // Fallback for demo
      message: message
    };
  }

  generateRoomReadySMS(booking: any, guest: any, room: any): SMSOptions {
    const message = `StayOS: Your room is ready! 🏨\nRoom ${room.number} is prepared\nWelcome to StayOS!\nEnjoy your stay!`;

    return {
      to: guest.phone || '+1234567890', // Fallback for demo
      message: message
    };
  }

  generateCheckoutReminderSMS(booking: any, guest: any, room: any): SMSOptions {
    const message = `StayOS: Checkout reminder ⏰\nRoom ${room.number}\nCheckout by 11AM tomorrow\nThank you for staying with us!`;

    return {
      to: guest.phone || '+1234567890', // Fallback for demo
      message: message
    };
  }
}

export const smsService = new SMSService();
