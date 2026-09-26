import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ValBo Apps — приложения за реална работа',
  description: 'Инсталатори за Windows и macOS на практични приложения за печат, обучение, организация и автоматизация.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="bg"><body>{children}</body></html>;
}
