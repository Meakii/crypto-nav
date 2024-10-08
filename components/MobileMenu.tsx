"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X, DollarSign, Bitcoin, CreditCard } from 'lucide-react';

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const menuSections = [
    {
      heading: 'Explore',
      items: [
        { label: 'Prices', icon: <DollarSign size={20} />, href: '/prices' },
      ],
    },
    {
      heading: 'Buy / Sell',
      items: [
        { label: 'Crypto assets', icon: <Bitcoin size={20} />, href: '/crypto-assets' },
      ],
    },
    {
      heading: 'Deposit',
      items: [
        { label: 'AUD', icon: <CreditCard size={20} />, href: '/deposit-aud' },
      ],
    },
  ];

  const handleOpen = () => {
    setIsOpen(true);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimating(false);
    }, 300);
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    handleClose();
  };

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex justify-between items-center">
        <Button variant="outline" onClick={() => handleNavigation('/deposit-aud')}>Deposit AUD</Button>
        <Button variant="ghost" size="icon" onClick={handleOpen}>
          <Menu size={24} />
        </Button>
      </div>
      {(isOpen || isAnimating) && (
        <div 
          className={`lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
            isOpen && !isAnimating ? 'opacity-100' : 'opacity-0'
          }`} 
          onClick={handleClose}
        >
          <div 
            className={`absolute right-0 top-0 h-full w-[90%] max-w-[300px] bg-background transform transition-transform duration-300 ease-in-out ${
              isOpen && !isAnimating ? 'translate-x-0 slide-in' : 'translate-x-full slide-out'
            }`} 
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="ghost" className="absolute top-4 right-4" onClick={handleClose}>
              <X size={24} />
            </Button>
            <nav className="p-4 mt-16 overflow-y-auto h-full">
              <ul className="space-y-6">
                {menuSections.map((section) => (
                  <li key={section.heading}>
                    <h3 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">
                      {section.heading}
                    </h3>
                    <ul className="space-y-1">
                      {section.items.map((item) => (
                        <li key={item.label}>
                          <Button
                            variant="ghost"
                            className={`w-full justify-start px-4 ${
                              pathname === item.href ? 'bg-accent text-accent-foreground relative after:content-[""] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-5 after:bg-green-500 after:rounded-l-full' : ''
                            }`}
                            onClick={() => handleNavigation(item.href)}
                            aria-current={pathname === item.href ? 'page' : undefined}
                          >
                            {item.icon}
                            <span className="ml-2">{item.label}</span>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="absolute bottom-4 left-4 right-4">
              <Button variant="outline" className="w-full" onClick={handleClose}>
                Go to advanced
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;