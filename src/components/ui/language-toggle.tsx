'use client';

import { Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  const toggle = () => {
    setLanguage(language === 'en' ? 'ms' : 'en');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="flex items-center gap-1.5"
      title={t('settings.language')}
    >
      <Globe className="h-4 w-4" />
      <span className="text-xs font-medium">{language === 'en' ? 'EN' : 'BM'}</span>
    </Button>
  );
}