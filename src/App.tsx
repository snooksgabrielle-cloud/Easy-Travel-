/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AwardsSection } from './components/AwardsSection';
import { PropertiesSection } from './components/PropertiesSection';
import { AmenitiesSection } from './components/AmenitiesSection';
import { ReviewsSection } from './components/ReviewsSection';
import { AreaGuideSection } from './components/AreaGuideSection';
import { CorporateView } from './components/CorporateView';
import { AboutView } from './components/AboutView';
import { HostDesignView } from './components/HostDesignView';
import { FAQView } from './components/FAQView';
import { TermsView } from './components/TermsView';
import { BlogView } from './components/BlogView';
import { ContactSection } from './components/ContactSection';
import { BookingCalculator } from './components/BookingCalculator';
import { PrivacyPolicyView } from './components/PrivacyPolicyView';
import { BrochureModal } from './components/BrochureModal';
import { PropertyDetailView } from './components/PropertyDetailView';
import { Footer } from './components/Footer';
import { PROPERTIES } from './data/lodgingData';
import { X, Calendar, CheckCircle2, ShieldCheck, Send } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [brochureOpen, setBrochureOpen] = useState<boolean>(false);
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('any');

  // Modal form states
  const [modalName, setModalName] = useState('');
  const [modalEmail, setModalEmail] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalCompany, setModalCompany] = useState('');
  const [modalRole, setModalRole] = useState('');
  const [modalDate, setModalDate] = useState('');
  const [modalDuration, setModalDuration] = useState('30-90');
  const [modalMessage, setModalMessage] = useState('');
  const [modalSubmitted, setModalSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  // Handle URL hash if any
  useEffect(() => {
    const handleHash = () => {
      let hash = window.location.hash.replace('#', '').replace(/^\//, '').replace(/\/$/, '');
      if (!hash || hash === 'home') {
        setCurrentTab('home');
        return;
      }
      
      const tabMap: Record<string, string> = {
        'corporate': 'corporate',
        'portfolio': 'portfolio',
        'calculator': 'calculator',
        'about': 'about',
        'about-us': 'about',
        'beahost': 'beahost',
        'want-to-be-a-host': 'beahost',
        'guide': 'guide',
        'area-guide': 'guide',
        'faq': 'faq',
        'faqs': 'faq',
        'terms': 'terms',
        'terms-and-conditions': 'terms',
        'blog': 'blog',
        'contact': 'contact',
        'contact-us': 'contact',
        'privacy': 'privacy',
        'privacy-policy': 'privacy'
      };

      if (tabMap[hash]) {
        setCurrentTab(tabMap[hash]);
        return;
      }

      if (hash.startsWith('listing:')) {
        setCurrentTab(hash);
        return;
      }

      // Check if hash matches any property slug or ID
      const matched = PROPERTIES.find(p => p.slug === hash || p.id === hash || p.unitNumber === hash || p.code === hash);
      if (matched) {
        setCurrentTab(`listing:${matched.id}`);
        return;
      }

      setCurrentTab('home');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleOpenBooking = (propertyId?: string, moveInDate?: string, duration?: string) => {
    if (propertyId) {
      setSelectedPropertyId(propertyId);
    } else {
      setSelectedPropertyId('any');
    }
    if (moveInDate) {
      setModalDate(moveInDate);
    }
    if (duration) {
      setModalDuration(duration);
    }
    setModalSubmitted(false);
    setBookingModalOpen(true);
  };

  const handleModalBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = 'ETL-' + Math.floor(100000 + Math.random() * 900000);
    setBookingRef(code);
    setModalSubmitted(true);
  };

  const navigateToTab = (tab: string) => {
    setCurrentTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={navigateToTab}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* Main View Switching */}
      <main className="flex-1">
        {(currentTab === 'home' || (!['corporate','portfolio','calculator','about','beahost','guide','faq','terms','blog','contact','privacy'].includes(currentTab) && !currentTab.startsWith('listing:'))) && (
          <>
            <Hero
              onExploreListings={() => navigateToTab('portfolio')}
              onOpenBooking={() => handleOpenBooking()}
              onOpenBrochure={() => setBrochureOpen(true)}
              onLearnEthics={() => navigateToTab('about')}
            />
            <AwardsSection
              onOpenBrochure={() => setBrochureOpen(true)}
              onExploreListings={() => navigateToTab('portfolio')}
            />
            <ReviewsSection />
            <AmenitiesSection />
            <AreaGuideSection
              onOpenBooking={() => handleOpenBooking()}
              onOpenDiscoveryCall={() => navigateToTab('beahost')}
            />
          </>
        )}

        {currentTab === 'corporate' && (
          <CorporateView
            onOpenBooking={() => handleOpenBooking()}
            onOpenBrochure={() => setBrochureOpen(true)}
            onOpenDiscoveryCall={() => navigateToTab('beahost')}
          />
        )}

        {currentTab === 'portfolio' && (
          <>
            <div className="bg-slate-900 text-white py-12 px-4 text-center">
              <span className="text-xs uppercase font-extrabold text-sky-400 tracking-wider">
                Full Sacramento Inventory
              </span>
              <h1 className="text-3xl sm:text-4xl font-heading font-black mt-1">
                Portfolio & Midterm Listings
              </h1>
              <p className="text-slate-300 text-sm max-w-xl mx-auto mt-2">
                Units 91, 173, 250, 333, and 335 in Rancho Cordova for 30+ day stays.
              </p>
            </div>
            <PropertiesSection
              onSelectPropertyForBooking={(id, date, dur) => handleOpenBooking(id, date, dur)}
              onViewListingDetails={(property) => navigateToTab(`listing:${property.id}`)}
              onOpenCalculator={() => navigateToTab('calculator')}
            />
            <div className="max-w-4xl mx-auto px-4 py-8 text-center">
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left">
                  <h3 className="font-heading font-bold text-slate-900 text-base">
                    Want to estimate your exact stay costs?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Use our interactive calculator to see prorated rent with all utilities included.
                  </p>
                </div>
                <button
                  onClick={() => navigateToTab('calculator')}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 cursor-pointer"
                >
                  Open Rate Calculator
                </button>
              </div>
            </div>
            <AmenitiesSection />
          </>
        )}

        {currentTab.startsWith('listing:') && (() => {
          const propId = currentTab.replace('listing:', '');
          const property = PROPERTIES.find(p => p.id === propId || p.slug === propId) || PROPERTIES[0];
          return (
            <PropertyDetailView
              property={property}
              onBack={() => navigateToTab('portfolio')}
              onOpenBooking={(id, date, dur) => handleOpenBooking(id, date, dur)}
              onSelectAnotherProperty={(id) => navigateToTab(`listing:${id}`)}
            />
          );
        })()}

        {currentTab === 'calculator' && (
          <>
            <BookingCalculator initialPropertyId={selectedPropertyId !== 'any' ? selectedPropertyId : undefined} />
            <AmenitiesSection />
          </>
        )}

        {currentTab === 'about' && (
          <>
            <AboutView onOpenBooking={() => handleOpenBooking()} />
            <AwardsSection />
            <ReviewsSection />
          </>
        )}

        {currentTab === 'beahost' && (
          <HostDesignView />
        )}

        {currentTab === 'guide' && (
          <>
            <div className="bg-slate-900 text-white py-12 px-4 text-center">
              <span className="text-xs uppercase font-extrabold text-teal-400 tracking-wider">
                Local Area Highlights
              </span>
              <h1 className="text-3xl sm:text-4xl font-heading font-black mt-1">
                Sacramento & Rancho Cordova Travel Guide
              </h1>
              <p className="text-slate-300 text-sm max-w-xl mx-auto mt-2">
                Discover local dining, the 6-brewery Barrel District, historic parks, and Sierra day trips.
              </p>
            </div>
            <AreaGuideSection
              onOpenBooking={() => handleOpenBooking()}
              onOpenDiscoveryCall={() => navigateToTab('beahost')}
            />
          </>
        )}

        {currentTab === 'faq' && (
          <FAQView onOpenBooking={() => handleOpenBooking()} />
        )}

        {currentTab === 'terms' && (
          <TermsView onOpenBooking={() => handleOpenBooking()} />
        )}

        {currentTab === 'blog' && (
          <BlogView onOpenBooking={() => handleOpenBooking()} />
        )}

        {currentTab === 'contact' && (
          <div className="pt-8">
            <ContactSection preselectedPropertyId={selectedPropertyId} />
          </div>
        )}

        {currentTab === 'privacy' && (
          <PrivacyPolicyView />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavClick={navigateToTab}
        onOpenBooking={() => handleOpenBooking()}
        onOpenBrochure={() => setBrochureOpen(true)}
      />

      {/* Global Booking / Reservation Inquiry Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 text-left relative flex flex-col">
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                  Flexible Stay Reservation Inquiry (5+ Days)
                </span>
                <h3 className="text-xl font-heading font-black text-slate-900">
                  Book Your Stay With Bill & Marlena
                </h3>
              </div>
              <button
                onClick={() => setBookingModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1">
              {modalSubmitted ? (
                <div className="p-8 text-center space-y-4 bg-teal-50 rounded-2xl border border-teal-200 animate-in fade-in">
                  <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
                  <h4 className="font-heading font-black text-2xl text-teal-950">
                    Inquiry Received, {modalName}!
                  </h4>
                  <p className="text-xs sm:text-sm text-teal-800 leading-relaxed max-w-md mx-auto">
                    Hosts Bill & Marlena have received your reservation request for the Sacramento area. We will contact you at <strong>{modalEmail}</strong> within 24 hours to confirm vacancy and send onboarding details.
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-teal-300 font-mono text-xs font-bold text-slate-800">
                    Booking Reference: <span className="text-sky-600">{bookingRef}</span>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => setBookingModalOpen(false)}
                      className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleModalBookingSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={modalName}
                      onChange={(e) => setModalName(e.target.value)}
                      placeholder="e.g. Amanda Clark"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={modalEmail}
                        onChange={(e) => setModalEmail(e.target.value)}
                        placeholder="amanda@agency.com"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={modalPhone}
                        onChange={(e) => setModalPhone(e.target.value)}
                        placeholder="(916) 555-0182"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Employer / Hospital / Agency *
                      </label>
                      <input
                        type="text"
                        required
                        value={modalCompany}
                        onChange={(e) => setModalCompany(e.target.value)}
                        placeholder="e.g. Kaiser Permanente"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Job Title / Traveler Role *
                      </label>
                      <input
                        type="text"
                        required
                        value={modalRole}
                        onChange={(e) => setModalRole(e.target.value)}
                        placeholder="e.g. Travel Physical Therapist"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-sky-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Preferred Accommodation Unit
                    </label>
                    <select
                      value={selectedPropertyId}
                      onChange={(e) => setSelectedPropertyId(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                    >
                      <option value="any">Any Available Unit (1 or 2 Bed)</option>
                      {PROPERTIES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.unitNumber} ({p.code}) - {p.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Estimated Move-In Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={modalDate}
                        onChange={(e) => setModalDate(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Expected Duration
                      </label>
                      <select
                        value={modalDuration}
                        onChange={(e) => setModalDuration(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                      >
                        <option value="5-10">5 – 10 Days (Short Stay)</option>
                        <option value="10-30">10 – 30 Days</option>
                        <option value="30-60">30 – 60 Days</option>
                        <option value="60-90">60 – 90 Days</option>
                        <option value="90-180">90 – 180 Days</option>
                        <option value="6mo+">6+ Months</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Notes or Special Accommodations
                    </label>
                    <textarea
                      rows={2}
                      value={modalMessage}
                      onChange={(e) => setModalMessage(e.target.value)}
                      placeholder="e.g. Arriving with a colleague; prefer downstairs unit; etc."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none"
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setBookingModalOpen(false)}
                      className="w-1/3 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Application Request</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Your privacy is protected • Direct contact with hosts Bill & Marlena</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Brochure Modal */}
      <BrochureModal
        isOpen={brochureOpen}
        onClose={() => setBrochureOpen(false)}
      />
    </div>
  );
}
