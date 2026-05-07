'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Room {
  id: string;
  img: string;
  title: string;
  price: string;
  deposit: string;
  location: string;
  tag: string;
  tagColor: string;
  beds: string;
  gender: string;
  moveIn: string;
  available: number;
}

const rooms: Room[] = [
  {
    id: '1',
    img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
    title: 'One Damansara — Master Bedroom',
    price: 'RM 1,200',
    deposit: 'RM 2,400',
    location: 'Damansara Damai, PJ',
    tag: 'Muslimin',
    tagColor: 'bg-blue-100 text-blue-800',
    beds: 'Single Bed',
    gender: 'Male',
    moveIn: 'Immediate',
    available: 1,
  },
  {
    id: '2',
    img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80',
    title: 'Aster Residence — Premium Room',
    price: 'RM 1,000',
    deposit: 'RM 2,000',
    location: 'Jalan Cheras, KL',
    tag: 'Muslimah',
    tagColor: 'bg-pink-100 text-pink-800',
    beds: 'Single Bed',
    gender: 'Female',
    moveIn: '1 June',
    available: 1,
  },
  {
    id: '3',
    img: 'https://images.unsplash.com/photo-1584132967334-10e958bd3987?w=600&q=80',
    title: 'Residensi M Vertica — Standard Room',
    price: 'RM 700',
    deposit: 'RM 1,400',
    location: 'Jalan Cheras, KL',
    tag: 'Muslimah',
    tagColor: 'bg-pink-100 text-pink-800',
    beds: 'Single Bed',
    gender: 'Female',
    moveIn: 'Immediate',
    available: 2,
  },
  {
    id: '4',
    img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
    title: 'PARC3 — Deluxe Room',
    price: 'RM 750',
    deposit: 'RM 1,500',
    location: 'Pudu Perdana, KL',
    tag: 'Muslimah',
    tagColor: 'bg-pink-100 text-pink-800',
    beds: 'Single Bed',
    gender: 'Female',
    moveIn: '15 June',
    available: 1,
  },
  {
    id: '5',
    img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
    title: 'Pixel City Sentral — Master Bedroom',
    price: 'RM 1,300',
    deposit: 'RM 2,600',
    location: 'Bandar Sri Permaisuri, KL',
    tag: 'Muslimah',
    tagColor: 'bg-pink-100 text-pink-800',
    beds: 'Single Bed',
    gender: 'Female',
    moveIn: 'Immediate',
    available: 1,
  },
  {
    id: '6',
    img: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600&q=80',
    title: 'The Hipster — Medium Room',
    price: 'RM 750',
    deposit: 'RM 1,500',
    location: 'Taman Desa, KL',
    tag: 'Muslimah',
    tagColor: 'bg-pink-100 text-pink-800',
    beds: 'Single Bed',
    gender: 'Female',
    moveIn: '1 July',
    available: 2,
  },
];

const steps = [
  {
    num: '1',
    title: 'Choose Your Room',
    desc: 'Browse our fully furnished rooms near LRT/MRT. Pick a single or shared room that fits your budget and location preference.',
    icon: '🏠',
  },
  {
    num: '2',
    title: 'Inquire & View',
    desc: 'Chat with AIrene — our AI assistant qualifies your inquiry in 2 minutes. If eligible, she schedules your viewing session.',
    icon: '💬',
  },
  {
    num: '3',
    title: 'Move In',
    desc: 'Accept the offer, sign digitally, pay deposit (2 months rent + utilities). Keys handed over on move-in day. Simple.',
    icon: '🔑',
  },
];

export default function MockupPage() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? rooms
    : filter === 'muslimin'
      ? rooms.filter(r => r.tag === 'Muslimin')
      : rooms.filter(r => r.tag === 'Muslimah');

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="bg-[#FF6600] text-white text-center py-2 text-sm font-medium">
        AMR Home Solutions — Co-Living Room Rentals in KL · SSM Registered
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/amr-logo.jpg" alt="AMR" className="w-10 h-10 object-contain rounded" />
            <div>
              <h1 className="text-lg font-bold text-[#FF6600] leading-tight">AMR Home Solutions</h1>
              <p className="text-xs text-slate-500 leading-tight">Your One Stop Real Estate Centre</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
            <a href="#listings" className="hover:text-[#FF6600] transition-colors">Rooms</a>
            <a href="#how" className="hover:text-[#FF6600] transition-colors">How It Works</a>
            <Link href="/auth/login" className="hover:text-[#FF6600] transition-colors">Log In</Link>
            <Link
              href="/inquiry"
              className="bg-[#FF6600] text-white px-5 py-2 rounded-full hover:bg-[#e55a00] transition-colors"
            >
              Chat with AIrene
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-[#1a1a2e] to-[#16213e] py-16 px-4">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find Your <span className="text-[#FF6600]">Room</span> in KL
          </h2>
          <p className="text-white/70 text-lg mb-8">
            Fully furnished co-living rooms near LRT/MRT · Starting from RM 500/month
          </p>

          {/* Filter pills */}
          <div className="flex justify-center gap-3 flex-wrap mb-8">
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-[#FF6600] text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              All Rooms ({rooms.length})
            </button>
            <button
              onClick={() => setFilter('muslimin')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                filter === 'muslimin'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              Muslimin ({rooms.filter(r => r.tag === 'Muslimin').length})
            </button>
            <button
              onClick={() => setFilter('muslimah')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                filter === 'muslimah'
                  ? 'bg-pink-600 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              Muslimah ({rooms.filter(r => r.tag === 'Muslimah').length})
            </button>
          </div>
        </div>
      </section>

      {/* Room Listings Grid */}
      <section id="listings" className="py-12 px-4 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((room) => (
              <div
                key={room.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={room.img}
                    alt={room.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${room.tagColor}`}>
                      {room.tag}
                    </span>
                    {room.available === 1 && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 animate-pulse">
                        1 Left!
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-2xl font-bold text-white">{room.price}<span className="text-sm font-normal text-white/70">/mo</span></p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-slate-800 text-base mb-2 line-clamp-1">{room.title}</h3>
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {room.location}
                  </div>

                  {/* Details row */}
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-4 pb-4 border-b border-slate-100">
                    <span className="flex items-center gap-1">
                      🛏 {room.beds}
                    </span>
                    <span className="flex items-center gap-1">
                      {room.gender === 'Male' ? '♂' : '♀'} {room.gender} Only
                    </span>
                    <span className="flex items-center gap-1">
                      📅 {room.moveIn}
                    </span>
                  </div>

                  {/* Price breakdown */}
                  <div className="bg-slate-50 rounded-xl p-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Monthly Rent</span>
                      <span className="font-semibold text-slate-800">{room.price}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-slate-500">Deposit (2 months)</span>
                      <span className="font-semibold text-slate-800">{room.deposit}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/rooms/${room.id}`}
                    className="w-full block text-center bg-[#FF6600] hover:bg-[#e55a00] text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                  >
                    View Details & Inquire
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-3xl font-bold text-slate-800 mb-3">Rent a Room in 3 Easy Steps</h3>
          <p className="text-slate-500 mb-12 max-w-lg mx-auto">
            No agents, no hassle. AIrene handles everything from inquiry to move-in.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="relative">
                {/* Connector line */}
                {step.num !== '3' && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-slate-200" />
                )}
                <div className="w-20 h-20 rounded-full bg-[#FF6600]/10 flex items-center justify-center mx-auto mb-5">
                  <span className="text-4xl">{step.icon}</span>
                </div>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#FF6600] text-white text-sm font-bold flex items-center justify-center">
                  {step.num}
                </div>
                <h4 className="font-bold text-lg text-slate-800 mb-2">{step.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility Notice */}
      <section className="py-12 px-4 bg-slate-50">
        <div className="container mx-auto max-w-2xl text-center">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Eligibility Requirements</h3>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-left">
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <span className="text-[#FF6600] font-bold text-lg leading-none">✓</span>
                Malaysian citizens only
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF6600] font-bold text-lg leading-none">✓</span>
                Muslim only (gender-segregated housing)
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF6600] font-bold text-lg leading-none">✓</span>
                Single, married-staying-alone, or divorced with no children
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF6600] font-bold text-lg leading-none">✓</span>
                No children living with tenant
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF6600] font-bold text-lg leading-none">✓</span>
                Minimum 6-month stay, 1-year contract
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-[#FF6600]">
        <div className="container mx-auto max-w-3xl text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Move In?</h3>
          <p className="text-white/80 mb-8 text-lg">
            Chat with AIrene now — she replies in under 2 minutes, 24/7.
          </p>
          <Link
            href="/inquiry"
            className="inline-flex items-center gap-2 bg-white text-[#FF6600] font-bold px-8 py-4 rounded-full hover:bg-white/90 transition-colors text-lg"
          >
            💬 Chat with AIrene
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <img src="/amr-logo.jpg" alt="AMR" className="w-10 h-10 object-contain rounded" />
          <span className="text-lg font-bold text-[#FF6600]">AMR Home Solutions</span>
        </div>
        <p className="text-slate-500 text-xs">© 2026 AMR Home Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
}
