
import React, { useState } from 'react';
import { X, Star, MessageSquare, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface Feedback {
  id: string;
  bookingId: string;
  guestId: string;
  roomId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  documentId: string;
  nationality: string;
  ageGroup: '18-25' | '26-35' | '36-50' | '50+';
}

interface Room {
  id: string;
  number: string;
  categoryId: string;
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance';
  floor: number;
  maintenanceHistory: { date: string; description: string; type: 'routine' | 'repair' }[];
}

interface Booking {
  id: string;
  roomId: string;
  guestId: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  guestsCount: number;
  source: 'Direct' | 'Booking.com' | 'Expedia' | 'Airbnb' | 'Corporate';
  specialRequests?: string;
  internalNotes?: string;
}

interface FeedbackFormProps {
  booking: Booking;
  guest: Guest | undefined;
  room: Room | undefined;
  onClose: () => void;
  onSubmit: (feedback: Feedback) => void;
  isSubmitting?: boolean;
  error?: string | null;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  booking,
  guest,
  room,
  onClose,
  onSubmit,
  isSubmitting = false,
  error
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newFeedback: Feedback = {
      id: `f-${Math.random().toString(36).substring(2, 11)}`,
      bookingId: booking.id,
      guestId: guest?.id || '',
      roomId: room?.id || '',
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };
    onSubmit(newFeedback);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[80] p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-sm sm:max-w-md mx-2 sm:mx-0 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
        <div className="bg-indigo-600 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-white">
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <MessageSquare size={18} className="sm:w-5 sm:h-5" />
            Guest Feedback
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors" title="Close feedback form">
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 text-center">
          <div className="mb-4">
            <p className="text-sm font-bold text-slate-800 leading-tight">How was {guest?.name}'s stay in room {room?.number}?</p>
            <p className="text-xs text-slate-500 mt-1">Collecting internal review for quality assurance.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  title={`${star} star${star > 1 ? 's' : ''}`}
                  onClick={() => setRating(star)}
                  className="p-1 sm:p-1 transition-transform active:scale-90 touch-manipulation"
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    size={28}
                    className={`sm:w-8 sm:h-8 ${
                      (hoverRating || rating) >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Internal Comments</label>
              <textarea
                required
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-medium resize-none"
                placeholder="What did the guest mention during checkout?"
                value={comment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
              />
            </div>

            {error && (
              <div role="alert" className="p-2 sm:p-3 bg-red-50 text-red-600 text-sm rounded-lg sm:rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={14} className="sm:w-4 sm:h-4" />
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-slate-200 text-slate-600 rounded-lg sm:rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg sm:rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-900/20 text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
