'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ms';

interface Translations {
  [key: string]: string;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Translations> = {
  en: {
    'app.title': 'AMR Home Solution',
    'app.subtitle': 'Property Management',
    'nav.dashboard': 'Dashboard',
    'nav.properties': 'Rooms',
    'nav.rooms.find': 'Find Room',
    'nav.tenants': 'Tenants',
    'nav.leases': 'Leases',
    'nav.payments': 'Payments',
    'nav.reports': 'Reports',
    'nav.reports.financial': 'Financial Reports',
    'nav.reports.profit': 'Profit by Source',
    'nav.settings': 'Settings',
    'nav.import': 'Import',
    'nav.marketing': 'Marketing',
    'nav.logout': 'Log out',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.loading': 'Loading...',
    'common.noData': 'No data available',
    'common.confirm': 'Confirm',
    'property.title': 'Properties',
    'property.addNew': 'Add Property',
    'property.name': 'Property Name',
    'property.address': 'Address',
    'property.type': 'Type',
    'property.status': 'Status',
    'property.floors': 'Floors',
    'property.rooms': 'Rooms',
    'property.vacant': 'Vacant',
    'property.occupied': 'Occupied',
    'property.addFloor': 'Add Floor',
    'property.addRoom': 'Add Room',
    'property.noFloors': 'No floors yet',
    'property.noRooms': 'No rooms yet',
    'floor.title': 'Floor',
    'floor.addNew': 'Add Floor',
    'floor.name': 'Floor Name',
    'room.title': 'Room',
    'room.addNew': 'Add Room',
    'room.name': 'Room Name',
    'room.rent': 'Monthly Rent',
    'room.status': 'Status',
    'room.beds': 'Beds',
    'room.baths': 'Baths',
    'room.area': 'Area (sqft)',
    'financial.income': 'Income',
    'financial.expense': 'Expense',
    'financial.profit': 'Profit',
    'financial.zakat': 'Zakat',
    'financial.sst': 'SST',
    'financial.netProfit': 'Net Profit',
    'tenant.title': 'Tenants',
    'tenant.addNew': 'Add Tenant',
    'tenant.name': 'Tenant Name',
    'tenant.email': 'Email',
    'tenant.phone': 'Phone',
    'lease.title': 'Leases',
    'lease.addNew': 'Add Lease',
    'lease.startDate': 'Start Date',
    'lease.endDate': 'End Date',
    'lease.rent': 'Monthly Rent',
    'payment.title': 'Payments',
    'payment.addNew': 'Add Payment',
    'payment.amount': 'Amount',
    'payment.date': 'Payment Date',
    'payment.status': 'Status',
    'payment.received': 'Received',
    'payment.pending': 'Pending',
    'report.income': 'Income Report',
    'report.expense': 'Expense Report',
    'report.profit': 'Profit & Loss',
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
  },
  ms: {
    'app.title': 'AMR Home Solution',
    'app.subtitle': 'Pengurusan Hartanah',
    'nav.dashboard': 'Papan Pemuka',
    'nav.properties': 'Hartanah',
    'nav.tenants': 'Penyewa',
    'nav.leases': 'Lesen',
    'nav.payments': 'Pembayaran',
    'nav.reports': 'Laporan',
    'nav.reports.financial': 'Laporan Kewangan',
    'nav.reports.profit': 'Untung Mengikut Sumber',
    'nav.settings': 'Tetapan',
    'nav.import': 'Import',
    'nav.marketing': 'Pemasaran',
    'nav.logout': 'Log keluar',
    'common.save': 'Simpan',
    'common.cancel': 'Batal',
    'common.delete': 'Padam',
    'common.edit': 'Edit',
    'common.add': 'Tambah',
    'common.search': 'Cari',
    'common.filter': 'Tapis',
    'common.export': 'Eksport',
    'common.loading': 'Memuat...',
    'common.noData': 'Tiada data',
    'common.confirm': 'Pasti',
    'property.title': 'Hartanah',
    'property.addNew': 'Tambah Hartanah',
    'property.name': 'Nama Hartanah',
    'property.address': 'Alamat',
    'property.type': 'Jenis',
    'property.status': 'Status',
    'property.floors': 'Tingkat',
    'property.rooms': 'Bilik',
    'property.vacant': 'Kosong',
    'property.occupied': 'Ditempati',
    'property.addFloor': 'Tambah Tingkat',
    'property.addRoom': 'Tambah Bilik',
    'property.noFloors': 'Tiada tingkat',
    'property.noRooms': 'Tiada bilik',
    'floor.title': 'Tingkat',
    'floor.addNew': 'Tambah Tingkat',
    'floor.name': 'Nama Tingkat',
    'room.title': 'Bilik',
    'room.addNew': 'Tambah Bilik',
    'room.name': 'Nama Bilik',
    'room.rent': 'Sewa Bulanan',
    'room.status': 'Status',
    'room.beds': 'Katil',
    'room.baths': 'Bilik Air',
    'room.area': 'Luas (kpj)',
    'financial.income': 'Pendapatan',
    'financial.expense': 'Perbelanjaan',
    'financial.profit': 'Untung',
    'financial.zakat': 'Zakat',
    'financial.sst': 'SST',
    'financial.netProfit': 'Untung Bersih',
    'tenant.title': 'Penyewa',
    'tenant.addNew': 'Tambah Penyewa',
    'tenant.name': 'Nama Penyewa',
    'tenant.email': 'Emel',
    'tenant.phone': 'Telefon',
    'lease.title': 'Lesen',
    'lease.addNew': 'Tambah Lesen',
    'lease.startDate': 'Tarikh Mula',
    'lease.endDate': 'Tarikh Tamat',
    'lease.rent': 'Sewa Bulanan',
    'payment.title': 'Pembayaran',
    'payment.addNew': 'Tambah Pembayaran',
    'payment.amount': 'Amaun',
    'payment.date': 'Tarikh Pembayaran',
    'payment.status': 'Status',
    'payment.received': 'Diterima',
    'payment.pending': 'Menunggu',
    'report.income': 'Laporan Pendapatan',
    'report.expense': 'Laporan Perbelanjaan',
    'report.profit': 'Untung & Rugi',
    'settings.title': 'Tetapan',
    'settings.language': 'Bahasa',
    'settings.theme': 'Tema',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'sublet-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const stored = localStorage.getItem(LANGUAGE_KEY) as Language | null;
    if (stored && (stored === 'en' || stored === 'ms')) {
      setLanguageState(stored);
    } else if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang') as Language | null;
      if (urlLang && (urlLang === 'en' || urlLang === 'ms')) {
        setLanguageState(urlLang);
        localStorage.setItem(LANGUAGE_KEY, urlLang);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [mounted]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}