
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Room, Booking, Guest, RoomCategory, MenuItem, Conversation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateChatSuggestions = async (
  conversation: Conversation
) => {
  try {
    const history = conversation.messages.slice(-5).map(m => `${m.sender}: ${m.text}`).join('\n');
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are a luxury hotel front desk AI assistant.
        Analyze this conversation between a guest and the hotel:
        ${history}

        Provide 3 short, professional suggested replies for the staff to send back to the guest.
        Format your response as a simple JSON array of strings.
      `,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Suggestions Error:", error);
    return ["Sure, I can help with that.", "I will check on that for you.", "Is there anything else I can assist you with?"];
  }
};

export const translateText = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following text into English. If it is already in English, just return the original text. Text: "${text}"`,
    });
    return response.text;
  } catch (error) {
    return text;
  }
};

export const getHotelAssistantResponse = async (
  query: string,
  context: { rooms: Room[]; bookings: Booking[]; guests: Guest[] }
) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are an intelligent Hotel Operations Assistant for LuxeStay HMS.
        Current Context:
        - Rooms: ${JSON.stringify(context.rooms)}
        - Active Bookings: ${JSON.stringify(context.bookings)}
        - Guests: ${JSON.stringify(context.guests)}

        User Question/Command: "${query}"

        Instructions:
        1. Provide helpful, concise answers based on the context.
        2. If asked about room availability, suggest specific rooms.
        3. If asked for a summary, provide key stats like occupancy (Occupied/Total).
        4. Be professional and data-driven.
      `,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I'm having trouble processing that request right now. Please try again.";
  }
};

const requestHotelServiceDeclaration: FunctionDeclaration = {
  name: 'request_hotel_service',
  parameters: {
    type: Type.OBJECT,
    description: 'Request a specific hotel service (cleaning, towels, maintenance, etc.) for a guest room.',
    properties: {
      roomNumber: { type: Type.STRING, description: 'The room number requesting the service.' },
      serviceType: { type: Type.STRING, enum: ['cleaning', 'maintenance', 'towel', 'pillows', 'other'], description: 'Type of service requested.' },
      details: { type: Type.STRING, description: 'Specific details about the request.' },
      priority: { type: Type.STRING, enum: ['low', 'medium', 'high'], description: 'Urgency of the request.' }
    },
    required: ['roomNumber', 'serviceType', 'details']
  }
};

export const getGuestAssistantResponse = async (
  query: string,
  context: { menu: MenuItem[]; categories: RoomCategory[]; availableRooms: number }
) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are the LuxeStay Digital Concierge. You assist guests with their stay.
        
        Hotel Information:
        - Current Available Room Types: ${JSON.stringify(context.categories)}
        - Total Rooms Available for Booking: ${context.availableRooms}
        - Dining Menu: ${JSON.stringify(context.menu)}

        Your Goal:
        - Help guests book rooms.
        - Answer questions about amenities (WiFi is free, all rooms have Smart TVs).
        - Help guests order food from the menu.
        - Help guests request services (like extra towels or room cleaning).

        If a guest wants to order food, describe the items from the menu.
        If a guest wants to request a service (towels, cleaning, etc.), use the request_hotel_service tool.

        Guest Message: "${query}"
      `,
      config: {
        tools: [{ functionDeclarations: [requestHotelServiceDeclaration] }]
      }
    });

    return {
      text: response.text,
      functionCalls: response.functionCalls
    };
  } catch (error) {
    console.error("Guest AI Error:", error);
    return { text: "I'm here to help! What can I do for you today?" };
  }
};

export const generateCheckInOutMessage = async (
  type: 'in' | 'out',
  guest: Guest,
  room: Room
) => {
  try {
    const prompt = type === 'in' 
      ? `Generate a warm, professional, one-sentence welcome greeting for guest ${guest.name} checking into room ${room.number}. Mention we hope they enjoy their stay.`
      : `Generate a polite, professional, one-sentence farewell greeting for guest ${guest.name} who just checked out of room ${room.number}. Thank them for staying at LuxeStay and wish them safe travels.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return type === 'in' ? `Welcome, ${guest.name}!` : `Safe travels, ${guest.name}!`;
  }
};

export const generateGuestFollowUpEmail = async (
  guest: Guest,
  booking: Booking
) => {
  try {
    const prompt = `
      Draft a warm, professional follow-up email to a guest who recently stayed at LuxeStay HMS.
      Guest Name: ${guest.name}
      Stay Dates: ${booking.checkIn} to ${booking.checkOut}
      
      Instructions:
      1. Thank them for choosing LuxeStay.
      2. Ask for feedback on their experience and invite them to leave a review.
      3. Mention we hope to see them again soon.
      4. Keep it under 3-4 sentences.
      5. Format the response as:
      SUBJECT: [Subject here]
      BODY: [Body here]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = response.text || "";
    const subject = text.match(/SUBJECT:\s*(.*)/i)?.[1] || "Thank you for your stay at LuxeStay";
    const body = text.split(/BODY:\s*/i)[1] || `Hi ${guest.name}, thank you for staying with us! We'd love to hear your feedback.`;

    return { subject, body };
  } catch (error) {
    return {
      subject: "Thank you for your stay at LuxeStay",
      body: `Hi ${guest.name}, thank you for staying with us! We'd love to hear your feedback.`
    };
  }
};

export const generateRevenueStrategy = async (
  categories: RoomCategory[],
  bookings: Booking[]
) => {
  try {
    const prompt = `
      You are a Revenue Management Consultant for a luxury hotel.
      Analyze the following data and provide a concise pricing strategy for the next 7 days.
      Room Categories: ${JSON.stringify(categories)}
      Recent Bookings: ${JSON.stringify(bookings.slice(0, 10))}

      Provide 3 actionable bullet points for pricing adjustments (e.g., increase suite rates by 10% for high demand).
      Keep it professional and focused on yield management.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Analyze current occupancy trends and consider dynamic pricing for high-demand suite categories.";
  }
};

export const generateStaffNotificationEmail = async (
  type: 'booking_new' | 'check_in' | 'check_out',
  data: { guest: Guest; room: Room; booking: Booking }
) => {
  try {
    const dept = type === 'check_out' ? 'Housekeeping' : (type === 'booking_new' ? 'Front Desk' : 'Concierge');
    const prompt = `
      Draft a professional internal hotel email notification.
      Type: ${type.replace('_', ' ')}
      Guest: ${data.guest.name}
      Room: ${data.room.number}
      Recipient Department: ${dept}
      
      Instructions:
      1. Write a clear Subject Line.
      2. Write a concise Body with the relevant action required (e.g., if check-out, tell Housekeeping to prioritize cleaning room ${data.room.number}).
      3. Format the response as:
      SUBJECT: [Subject here]
      BODY: [Body here]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = response.text || "";
    const subject = text.match(/SUBJECT:\s*(.*)/i)?.[1] || "Internal Notification";
    const body = text.split(/BODY:\s*/i)[1] || "No content generated.";

    return { subject, body, dept: dept as any };
  } catch (error) {
    return {
      subject: `Notification: ${type}`,
      body: `Action required for Room ${data.room.number} regarding Guest ${data.guest.name}.`,
      dept: 'Front Desk' as any
    };
  }
};
