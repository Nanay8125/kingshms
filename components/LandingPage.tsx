import React from 'react';
import {
  Hotel,
  Calendar,
  Users,
  ChevronRight,
  Star,
  Wifi,
  Tv,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Award,
  Heart,
  ArrowRight
} from 'lucide-react';

interface LandingPageProps {
  onStartBooking: () => void;
  onViewMenu: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartBooking, onViewMenu }) => {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Best Price Guarantee',
      description: 'Find it cheaper elsewhere? We\'ll match it and give you a free upgrade.'
    },
    {
      icon: Wifi,
      title: 'Premium Perks',
      description: 'Direct bookers receive free high-speed WiFi and late checkout options.'
    },
    {
      icon: CheckCircle2,
      title: 'Zero Commissions',
      description: 'No hidden service fees. What you see is exactly what you pay.'
    },
    {
      icon: Award,
      title: 'Award Winning',
      description: 'Recognized as the #1 luxury hotel chain for guest satisfaction.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      location: 'New York, NY',
      rating: 5,
      text: 'Absolutely stunning property with impeccable service. The attention to detail is remarkable.'
    },
    {
      name: 'Michael Chen',
      location: 'San Francisco, CA',
      rating: 5,
      text: 'Luxury redefined. Every moment of our stay was perfect. Highly recommend!'
    },
    {
      name: 'Emma Rodriguez',
      location: 'Miami, FL',
      rating: 5,
      text: 'The staff went above and beyond. This is what true hospitality looks like.'
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-y-auto">
      {/* Navigation */}
      <nav className="h-20 bg-white/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white">
            <Hotel size={24} />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">LuxeStay</span>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={onViewMenu}
            className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Digital Menu
          </button>
          <button
            onClick={onStartBooking}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20"
          >
            Book Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-slate-900/80 to-slate-900/90 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://picsum.photos/seed/luxury-hotel/1920/1080)' }}
        />
        <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-8">
          <div className="mb-6">
            <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-bold uppercase tracking-widest border border-white/20">
              Welcome to Luxury Redefined
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
            Experience
            <span className="block text-indigo-300">LuxeStay</span>
          </h1>
          <p className="text-xl md:text-2xl font-medium text-slate-200 mb-12 max-w-2xl mx-auto leading-relaxed">
            Where every moment becomes a cherished memory. Discover unparalleled luxury and exceptional service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onStartBooking}
              className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-lg hover:bg-indigo-50 transition-all shadow-2xl flex items-center justify-center gap-3 group"
            >
              Start Your Journey
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onViewMenu}
              className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all border border-white/20"
            >
              Explore Dining
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Why Choose LuxeStay?</h2>
            <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto">
              Experience the difference that sets us apart from ordinary hotels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all text-center group">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-100 transition-colors">
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Booking Section */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Ready to Book?</h2>
          <p className="text-xl text-slate-600 font-medium mb-12">
            Check availability and secure your perfect stay in just a few clicks.
          </p>

          <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Check-in Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Check-out Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Guests</label>
                <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium">
                  <option>1 Guest</option>
                  <option>2 Guests</option>
                  <option>3 Guests</option>
                  <option>4 Guests</option>
                </select>
              </div>
            </div>

            <button
              onClick={onStartBooking}
              className="w-full md:w-auto px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-3 mx-auto"
            >
              Check Availability
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-8 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">What Our Guests Say</h2>
            <p className="text-xl text-slate-300 font-medium">
              Real experiences from real guests who chose LuxeStay.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-200 font-medium leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <p className="font-bold text-white">{testimonial.name}</p>
                  <p className="text-sm text-slate-400">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities Preview */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black text-slate-900 mb-6">
                World-Class Amenities
              </h2>
              <p className="text-xl text-slate-600 font-medium mb-8 leading-relaxed">
                Every detail crafted for your comfort and convenience. Experience luxury that feels like home.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <Wifi size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">High-Speed WiFi</h4>
                    <p className="text-slate-600">Complimentary throughout the property</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">24/7 Concierge</h4>
                    <p className="text-slate-600">Personalized assistance anytime</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                    <Heart size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Spa & Wellness</h4>
                    <p className="text-slate-600">Rejuvenate with our premium treatments</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-slate-100 rounded-[40px] overflow-hidden">
                <img
                  src="https://picsum.photos/seed/hotel-amenities/600/600"
                  alt="Hotel amenities"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Need Assistance?</h2>
          <p className="text-xl text-slate-600 font-medium mb-12">
            Our team is here to help make your stay perfect.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Phone size={32} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Call Us</h3>
              <p className="text-slate-600 font-medium">+1 (555) 123-4567</p>
              <p className="text-sm text-slate-400">24/7 Support</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Mail size={32} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Email Us</h3>
              <p className="text-slate-600 font-medium">reservations@luxestay.com</p>
              <p className="text-sm text-slate-400">Response within 1 hour</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <MapPin size={32} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Visit Us</h3>
              <p className="text-slate-600 font-medium">123 Luxury Avenue</p>
              <p className="text-sm text-slate-400">Downtown District</p>
            </div>
          </div>

          <button
            onClick={onStartBooking}
            className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20"
          >
            Book Your Stay Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-xl text-white">
              <Hotel size={18} />
            </div>
            <span className="text-sm font-black text-slate-900 tracking-tight uppercase">LuxeStay Hotels & Resorts</span>
          </div>

          <div className="flex gap-8 text-sm font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Careers</a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-400 font-medium">
            © 2024 LuxeStay Hotels & Resorts. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
