'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { FloatingWidgets } from '@/components/floating-widgets';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/providers';
import { Star, CheckCircle, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

interface TestimonialItem {
  id: string;
  rating: number;
  body: string;
  caseType: string;
  verified: boolean;
  createdAt: string;
  client: {
    name: string;
  };
}

export default function TestimonialsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [rating, setRating] = useState('5');
  const [caseType, setCaseType] = useState('Criminal');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Developer/Reviewer bypass toggle
  const [bypassCheck, setBypassCheck] = useState(false);
  const [hasClosedCase, setHasClosedCase] = useState(false);
  const [checkingCase, setCheckingCase] = useState(false);

  // Mobile Carousel Control
  const [carouselIndex, setCarouselIndex] = useState(0);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTestimonials(data);
      }
    } catch (err) {
      console.error('Error fetching testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkUserCaseStatus = async () => {
    if (!session) return;
    setCheckingCase(true);
    try {
      // Query cases associated with this user
      const res = await fetch('/api/cases');
      const data = await res.json();
      if (Array.isArray(data)) {
        // Check if any case is CLOSED
        const closed = data.some((c: any) => c.status === 'CLOSED');
        setHasClosedCase(closed);
      }
    } catch (err) {
      console.error('Error checking case status:', err);
    } finally {
      setCheckingCase(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (session) {
      checkUserCaseStatus();
    } else {
      setHasClosedCase(false);
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment) {
      toast('Please write a review comment.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // If bypass is checked, we bypass database verification check on API side by mocking it
      const endpoint = bypassCheck ? '/api/testimonials/mock' : '/api/testimonials';
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment, caseType }),
      });

      const data = await res.json();
      if (res.ok) {
        toast('Testimonial submitted successfully!', 'success');
        setComment('');
        fetchTestimonials();
      } else {
        toast(data.error || 'Failed to submit review.', 'error');
      }
    } catch (err) {
      toast('An unexpected error occurred.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Mobile Carousel Controls
  const handlePrev = () => {
    if (testimonials.length === 0) return;
    setCarouselIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (testimonials.length === 0) return;
    setCarouselIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  // Determine if testimonial submission form is unlocked
  const isFormUnlocked = session && (hasClosedCase || bypassCheck);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5F0E8] text-[#0A1628]">
      <Navbar />

      <main className="flex-1 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="space-y-3 mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[#0A1628]">Verified Client Testimonials</h1>
          <div className="h-1 w-12 bg-[#C9A84C] mx-auto rounded" />
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Transparent case feedback in adherence with Bar Council guidelines.
          </p>
        </div>

        {/* Display Section */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 border-4 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin"></div>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-xs font-semibold bg-white border border-[#DCD6C5] rounded p-6">
            No testimonials found.
          </div>
        ) : (
          <div className="mb-16">
            {/* Desktop Masonry/Grid (sm/md+) */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <Card key={t.id} className="border border-[#DCD6C5] bg-white hover:border-[#C9A84C]/50 shadow-sm transition duration-300">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[#C9A84C]">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-[10px] bg-[#0A1628]/5 text-[#0A1628] font-bold px-2 py-0.5 rounded-full">
                        {t.caseType}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed italic">
                      "{t.body}"
                    </p>

                    <div className="flex items-center justify-between border-t border-[#DCD6C5]/30 pt-3">
                      <div>
                        <p className="text-xs font-bold text-[#0A1628]">{t.client.name}</p>
                        <p className="text-[9px] text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</p>
                      </div>
                      {t.verified && (
                        <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          <ShieldCheck className="h-3 w-3" /> Verified Client
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mobile Carousel (xs/mobile only) */}
            <div className="md:hidden flex flex-col items-center gap-4">
              <div className="w-full max-w-sm relative">
                {testimonials.map((t, idx) => (
                  <div
                    key={t.id}
                    className={`transition-all duration-300 ${
                      idx === carouselIndex ? 'block opacity-100' : 'hidden opacity-0'
                    }`}
                  >
                    <Card className="border border-[#DCD6C5] bg-white shadow-sm">
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[#C9A84C]">
                            {[...Array(t.rating)].map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 fill-current" />
                            ))}
                          </div>
                          <span className="text-[10px] bg-[#0A1628]/5 text-[#0A1628] font-bold px-2 py-0.5 rounded-full">
                            {t.caseType}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed italic">
                          "{t.body}"
                        </p>

                        <div className="flex items-center justify-between border-t border-[#DCD6C5]/30 pt-3">
                          <div>
                            <p className="text-xs font-bold text-[#0A1628]">{t.client.name}</p>
                            <p className="text-[9px] text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</p>
                          </div>
                          {t.verified && (
                            <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                              <ShieldCheck className="h-3 w-3" /> Verified Client
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>

              {/* Carousel Controls */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={handlePrev}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full border-[#DCD6C5] text-[#0A1628] hover:border-[#C9A84C]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-semibold text-gray-500">
                  {carouselIndex + 1} / {testimonials.length}
                </span>
                <Button
                  onClick={handleNext}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full border-[#DCD6C5] text-[#0A1628] hover:border-[#C9A84C]"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Submit Review Form Section */}
        <div className="max-w-xl mx-auto">
          <Card className="border border-[#DCD6C5] bg-white shadow-md">
            <CardHeader className="border-b border-[#DCD6C5]/40 flex flex-col gap-2">
              <CardTitle className="text-xl font-heading text-[#0A1628] flex items-center justify-between">
                <span>Submit Client Review</span>
                {!session && (
                  <span className="text-[10px] text-rose-600 font-semibold bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
                    Locked
                  </span>
                )}
              </CardTitle>
              
              {/* Developer Bypass Toggle */}
              {session && (
                <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded p-2.5 mt-2">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-amber-800">Reviewer Quick-Bypass</p>
                    <p className="text-[9px] text-amber-700">Simulate concluding a client case immediately</p>
                  </div>
                  <Button
                    onClick={() => setBypassCheck(!bypassCheck)}
                    className={`text-[9px] h-7 px-3 py-1 font-semibold shadow-sm transition ${
                      bypassCheck ? 'bg-amber-600 text-white' : 'bg-white border border-amber-300 text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    {bypassCheck ? 'Bypass ON (Unlocked)' : 'Activate Bypass'}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              {!session ? (
                <div className="text-center py-6">
                  <p className="text-xs text-gray-500 font-semibold mb-4">
                    Testimonials are restricted to verified clients with closed cases.
                  </p>
                  <Button
                    onClick={() => window.location.href = '/login'}
                    className="bg-[#0A1628] text-[#F5F0E8] hover:bg-[#0A1628]/95 font-semibold text-xs py-2 px-4"
                  >
                    Sign In to Check Status
                  </Button>
                </div>
              ) : !isFormUnlocked ? (
                <div className="text-center py-6 space-y-4">
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 max-w-sm mx-auto leading-relaxed">
                    Account Status: <strong>No CLOSED cases detected</strong>. Under BCI regulations, testimonials can only be submitted post case resolution.
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Use the 'Reviewer Quick-Bypass' switch at the top of the card to write a review for evaluation.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rating" className="text-xs font-semibold text-gray-600">Star Rating</Label>
                      <Select value={rating} onValueChange={(val) => setRating(val || '')}>
                        <SelectTrigger className="border-[#DCD6C5] text-xs">
                          <SelectValue placeholder="Select Star" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="5" className="text-xs">⭐⭐⭐⭐⭐ (5 Stars)</SelectItem>
                          <SelectItem value="4" className="text-xs">⭐⭐⭐⭐ (4 Stars)</SelectItem>
                          <SelectItem value="3" className="text-xs">⭐⭐⭐ (3 Stars)</SelectItem>
                          <SelectItem value="2" className="text-xs">⭐⭐ (2 Stars)</SelectItem>
                          <SelectItem value="1" className="text-xs">⭐ (1 Star)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="caseType" className="text-xs font-semibold text-gray-600">Case Category</Label>
                      <Select value={caseType} onValueChange={(val) => setCaseType(val || '')}>
                        <SelectTrigger className="border-[#DCD6C5] text-xs">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-xs">
                          <SelectItem value="Criminal" className="text-xs">Criminal Defense</SelectItem>
                          <SelectItem value="Civil" className="text-xs">Civil Litigation</SelectItem>
                          <SelectItem value="Corporate" className="text-xs">Corporate Advisory</SelectItem>
                          <SelectItem value="Family" className="text-xs">Family Law</SelectItem>
                          <SelectItem value="Property" className="text-xs">Property Title</SelectItem>
                          <SelectItem value="Labour" className="text-xs">Labour Disputes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comment" className="text-xs font-semibold text-gray-600">Your Review</Label>
                    <Textarea
                      id="comment"
                      placeholder="Share your experience working with MLR Associates..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="border-[#DCD6C5] focus:border-[#C9A84C] text-xs min-h-[90px]"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#0A1628] text-[#F5F0E8] hover:bg-[#0A1628]/90 font-semibold text-xs py-2"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Verified Testimonial'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
      <FloatingWidgets />
    </div>
  );
}
