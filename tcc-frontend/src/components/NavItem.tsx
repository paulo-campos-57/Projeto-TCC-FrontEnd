import type { ReactNode } from 'react';

export default function NavItem({ children }: { children: ReactNode }) {
  return (
    <div className="group relative mx-4 cursor-pointer font-bold transition-colors duration-300 hover:text-goldenYellow">
      {children}
      <span className="after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:w-0 after:bg-goldenYellow after:transition-all after:duration-300 after:content-[''] after:group-hover:w-full" />
    </div>
  );
}
