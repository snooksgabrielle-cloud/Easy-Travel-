import React, { useState, useMemo } from 'react';
import { PROPERTIES, COMPANY_INFO } from '../data/lodgingData';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Send,
  Building,
  Bed,
  Bath,
  Sparkles,
  Download
} from 'lucide-react';

interface BookingCalculatorProps {
  initialPropertyId?: string;
}

export const BookingCalculator: React.FC<BookingCalculatorProps> = ({ initialPropertyId }) => {
  // Today + 3 days as default check-in
  const defaultCheckIn = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  }, []);

  // Default check-out 7 days later (5-10 days booking default)
  const defaultCheckOut = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split('T')[0];
  }, []);

  const [checkIn, setCheckIn] = useState<string>(defaultCheckIn);
  const [checkOut, setCheckOut] = useState<string>(defaultCheckOut);
  const [selectedUnitId, setSelectedUnitId] = useState<string>(initialPropertyId || PROPERTIES[0].id);
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);

  // Application form submission states
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmployer, setGuestEmployer] = useState('');
  const [guestRole, setGuestRole] = useState('');
  const [guestNotes, setGuestNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  // Selected unit
  const currentUnit = useMemo(() => {
    return PROPERTIES.find((p) => p.id === selectedUnitId) || PROPERTIES[0];
  }, [selectedUnitId]);

  // Date calculation
  const { nights, isMinStayValid } = useMemo(() => {
    if (!checkIn || !checkOut) return { nights: 0, isMinStayValid: false };
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return {
      nights: Math.max(0, diffDays),
      isMinStayValid: diffDays >= 5
    };
  }, [checkIn, checkOut]);

  // Pricing breakdown
  const pricing = useMemo(() => {
    if (!currentUnit || nights <= 0) {
      return {
        baseRent: 0,
        utilities: 0,
        cleaningFee: 180,
        deposit: 500,
        total: 0
      };
    }
    const monthlyRate = currentUnit.monthlyRate;
    const dailyRate = monthlyRate / 30;
    const calculatedRent = Math.round(dailyRate * nights);
    const cleaningFee = 180;
    const deposit = 500;
    const total = calculatedRent + cleaningFee + deposit;

    return {
      baseRent: calculatedRent,
      utilities: 0,
      cleaningFee,
      deposit,
      total
    };
  }, [currentUnit, nights]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMinStayValid) return;
    const ref = 'ETL-' + Math.floor(100000 + Math.random() * 900000);
    setBookingRef(ref);
    setSubmitted(true);
  };

  return (
    <div id="booking-calculator" className="py-12 sm:py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            Interactive Reservation & Pricing Estimator
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-black text-slate-900 tracking-tight">
            Book Your Stay (5+ Days)
          </h1>

          <p className="text-slate-600 text-base sm:text-lg">
            Configure your travel dates (5 to 10 days or longer), select your preferred unit in Rancho Cordova, and calculate all-inclusive rates.
          </p>
        </div>

        {/* Main Grid: Left Configurator / Right Pricing Summary & Application */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Configurator Column */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-heading font-black text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-sky-600" />
              1. Choose Accommodation & Dates
            </h2>

            {/* Select Unit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Midterm Unit
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PROPERTIES.map((prop) => {
                  const isSelected = selectedUnitId === prop.id;
                  return (
                    <button
                      key={prop.id}
                      type="button"
                      onClick={() => setSelectedUnitId(prop.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50/60 ring-2 ring-sky-200 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-slate-900">
                            {prop.unitNumber} ({prop.code})
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {prop.floor}
                          </span>
                        </div>
                        <p className="font-heading font-bold text-xs text-slate-800 line-clamp-1 mt-1">
                          {prop.title}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 mt-2">
                        <span>{prop.bedrooms} Bed • {prop.bathrooms} Bath</span>
                        <span className="font-bold text-slate-900">{prop.startingRate}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dates Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Check-in Date (2:00 PM) *
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 bg-white outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Check-out Date (11:00 AM) *
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 bg-white outline-none font-medium"
                />
              </div>
            </div>

            {/* Stay Length Status Banner */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold ${
              isMinStayValid
                ? 'bg-teal-50 border-teal-200 text-teal-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-2.5">
                {isMinStayValid ? (
                  <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                )}
                <span>
                  Stay Duration: <strong>{nights} Nights</strong> {isMinStayValid ? '(Flexible 5+ day booking)' : '(Minimum stay is 5 days)'}
                </span>
              </div>
              <span className="text-xs font-mono font-bold">
                ~{(nights / 30).toFixed(1)} Months
              </span>
            </div>

            {/* Guests selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Adult Occupants
                </label>
                <select
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  <option value={1}>1 Adult Professional</option>
                  <option value={2}>2 Adults (Co-workers / Couple)</option>
                  <option value={3}>3 Adults (2-Bed unit only)</option>
                  <option value={4}>4 Adults (Max capacity)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Children / Dependents
                </label>
                <select
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  <option value={0}>0 Children</option>
                  <option value={1}>1 Child</option>
                  <option value={2}>2 Children</option>
                </select>
              </div>
            </div>

            {/* Selected Unit Preview Details */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-slate-900 text-sm">
                  {currentUnit.title}
                </span>
                <span className="text-xs text-sky-700 font-bold">{currentUnit.sqft}</span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">
                {currentUnit.shortDesc}
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-500 font-medium">
                <span>✓ 400+ Mbps WiFi</span>
                <span>•</span>
                <span>✓ In-Unit Laundry</span>
                <span>•</span>
                <span>✓ Fireplace</span>
                <span>•</span>
                <span>✓ Dedicated Parking</span>
              </div>
            </div>
          </div>

          {/* Right Pricing Summary & Reservation Application */}
          <div className="lg:col-span-5 space-y-6">
            {/* Price Itemization Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-heading font-black text-lg text-slate-900">
                  Rate Itemization
                </h3>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  All Utilities Included
                </span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-slate-700">
                  <span>
                    Base Rent ({nights} nights @ ~${Math.round(currentUnit.monthlyRate / 30)}/day)
                  </span>
                  <span className="font-bold text-slate-900">${pricing.baseRent.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-slate-700">
                  <span className="flex items-center gap-1.5 text-teal-700 font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    Utilities & 400+ Mbps Wi-Fi
                  </span>
                  <span className="font-bold text-teal-700">$0 (Paid by ETL)</span>
                </div>

                <div className="flex justify-between items-center text-slate-700">
                  <span>Move-Out Professional Sanitization Fee</span>
                  <span className="font-bold text-slate-900">${pricing.cleaningFee}</span>
                </div>

                <div className="flex justify-between items-center text-slate-700">
                  <span>Refundable Security Deposit</span>
                  <span className="font-bold text-slate-900">${pricing.deposit}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">
                      Total Estimated
                    </span>
                    <span className="text-[11px] text-slate-400">Includes deposit & turn fee</span>
                  </div>
                  <span className="font-heading font-black text-2xl text-slate-900">
                    ${pricing.total.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
                <p>• Electricity, gas, water, garbage, sewer & WiFi are completely paid.</p>
                <p>• Refundable deposit is returned upon inspection at departure.</p>
              </div>
            </div>

            {/* Instant Online Application Form */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
              <div>
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  Direct Application Request
                </span>
                <h3 className="font-heading font-black text-lg text-white">
                  2. Submit Application to Bill & Marlena
                </h3>
              </div>

              {submitted ? (
                <div className="p-6 bg-teal-950/80 rounded-2xl border border-teal-500/50 text-center space-y-3 animate-in fade-in">
                  <CheckCircle2 className="w-10 h-10 text-teal-400 mx-auto" />
                  <h4 className="font-heading font-black text-lg text-white">
                    Application Dispatched!
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Thank you, {guestName}. We have reserved temporary hold on {currentUnit.unitNumber} ({currentUnit.code}) for your dates ({checkIn} to {checkOut}).
                  </p>
                  <div className="p-2.5 bg-white/10 rounded-xl border border-white/20 font-mono text-xs font-bold text-sky-300">
                    Booking Reference: {bookingRef}
                  </div>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="w-full py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Calculate Another Date Range
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3 text-left">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Jessica Williams"
                      className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:border-sky-400 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="jessica@agency.com"
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:border-sky-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="(916) 555-0144"
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:border-sky-400 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Company / Hospital *
                      </label>
                      <input
                        type="text"
                        required
                        value={guestEmployer}
                        onChange={(e) => setGuestEmployer(e.target.value)}
                        placeholder="e.g. Sutter Health"
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:border-sky-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Role / Assignment *
                      </label>
                      <input
                        type="text"
                        required
                        value={guestRole}
                        onChange={(e) => setGuestRole(e.target.value)}
                        placeholder="e.g. Traveling ER Nurse"
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:border-sky-400 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Notes or Special Requests
                    </label>
                    <textarea
                      rows={2}
                      value={guestNotes}
                      onChange={(e) => setGuestNotes(e.target.value)}
                      placeholder="e.g. Need downstairs unit for easy accessibility; arriving with a car..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:border-sky-400 outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!isMinStayValid}
                      className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                        isMinStayValid
                          ? 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                          : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isMinStayValid ? 'Submit Application & Lock Rate' : 'Must Be 5+ Nights to Book'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                    <span>No application fee • Verified local hosts • Fast response</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
