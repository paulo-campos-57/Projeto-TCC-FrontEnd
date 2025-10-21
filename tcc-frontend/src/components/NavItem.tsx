import type { ReactNode } from 'react';

export default function NavItem({ children }: { children: ReactNode }) {
    return (
        <div className="relative group font-bold cursor-pointer transition-colors duration-300 hover:text-goldenYellow mx-4">
            {children}
            <span
                className="
                    after:content-[''] 
                    after:absolute 
                    after:bottom-0 
                    after:left-0 
                    after:right-0 
                    after:h-[3px] 
                    after:bg-goldenYellow 
                    after:w-0 
                    after:group-hover:w-full 
                    after:transition-all 
                    after:duration-300
                "
            />
        </div>
    );
}