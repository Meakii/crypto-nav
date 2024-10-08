"use client";

import { useState, forwardRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Bitcoin,
  CreditCard,
  BarChart2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MenuItemProps {
  item: {
    label: string;
    icon: JSX.Element;
    href: string;
  };
  section: {
    heading: string;
  };
  isActive: boolean;
}

interface MenuItemWithTooltipProps {
  item: {
    label: string;
    icon: JSX.Element;
    href: string;
  };
  section: {
    heading: string;
  };
  isActive: boolean;
}

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const pathname = usePathname();

  const menuSections = [
    {
      heading: "Explore",
      items: [
        { label: "Prices", icon: <DollarSign size={20} />, href: "/prices" },
      ],
    },
    {
      heading: "Buy / Sell",
      items: [
        {
          label: "Crypto assets",
          icon: <Bitcoin size={20} />,
          href: "/crypto-assets",
        },
      ],
    },
    {
      heading: "Deposit",
      items: [
        { label: "AUD", icon: <CreditCard size={20} />, href: "/deposit-aud" },
      ],
    },
  ];

  const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(
    ({ item, section, isActive, ...props }, ref) => (
      <Link href={item.href} passHref>
      <Button
        ref={ref}
        variant="ghost"
        className={`w-full font-thin relative ${
          isCollapsed ? "justify-center px-0" : "justify-start px-4"
        } ${
          isActive
            ? 'bg-accent text-accent-foreground relative after:content-[""] outline-active-right'
            : ""
        }`}
        aria-current={isActive ? "page" : undefined}
        {...props}
      >
        {item.icon}
        {!isCollapsed && <span className="ml-2">{item.label}</span>}
      </Button>
    </Link>
    )
  );
  MenuItem.displayName = 'MenuItem';

  const MenuItemWithTooltip = ({ item, section, isActive }: MenuItemWithTooltipProps) => (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <MenuItem item={item} section={section} isActive={isActive} />
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={10}>
          <p>
            <span className="font-semibold">{section.heading}:</span>{" "}
            {item.label}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const handleToggle = () => {
    setIsAnimating(true);
    setShowContent(false);
    setTimeout(() => {
      setIsCollapsed(!isCollapsed);
      setTimeout(() => {
        setShowContent(true);
        setIsAnimating(false);
      }, 300); // Wait for collapse/expand animation to finish
    }, 200); // Wait for fade out animation to finish
  };

  const ToggleButton = () => (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`flex justify-center items-center ${
              isCollapsed ? "w-full" : ""
            }`}
            onClick={handleToggle}
          >
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={10}>
          <p>{isCollapsed ? "Expand menu" : "Collapse menu"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <motion.div
      className={`bg-background border-r divider-strong transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } hidden lg:flex flex-col`}
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex flex-col h-full">
        <AnimatePresence mode="wait">
          {showContent && (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              <div className={`p-4 ${isCollapsed ? "pb-2" : "pb-4"}`}>
                <div
                  className={`flex ${
                    isCollapsed
                      ? "flex-col items-center"
                      : "items-center justify-between"
                  }`}
                >
                  {isCollapsed ? (
                    <>
                      <div className="w-[28px] h-[16px] bg-gray-200 mb-2">
                        {/* Placeholder for small logo */}
                      </div>
                      <ToggleButton />
                    </>
                  ) : (
                    <>
                      <div className="w-[154px] h-[16px] bg-gray-200">
                        {/* Placeholder for full logo */}
                      </div>
                      <ToggleButton />
                    </>
                  )}
                </div>
              </div>
              <nav className="flex-1 overflow-y-auto">
                <ul className="space-y-6 p-2">
                  {menuSections.map((section) => (
                    <li key={section.heading}>
                      {!isCollapsed && (
                        <h3 className="mb-2 px-4 text-sm font-normal text-muted-foreground">
                          {section.heading}
                        </h3>
                      )}
                      <ul className="space-y-1">
                        {section.items.map((item) => (
                          <li key={item.label}>
                            {isCollapsed ? (
                              <MenuItemWithTooltip
                                item={item}
                                section={section}
                                isActive={pathname === item.href}
                              />
                            ) : (
                              <MenuItem
                                item={item}
                                section={section}
                                isActive={pathname === item.href}
                              />
                            )}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="p-4">
                {isCollapsed ? (
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-center"
                          size="icon"
                        >
                          <BarChart2 size={20} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={10}>
                        <p>Go to advanced</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    size="default"
                  >
                    <span className="mr-2">Go to advanced</span>
                    <BarChart2 size={20} />
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Sidebar;

// "use client";

// import { useState, forwardRef, useEffect } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// import { ChevronLeft, ChevronRight, DollarSign, Bitcoin, CreditCard, BarChart2 } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// const Sidebar = () => {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [isAnimating, setIsAnimating] = useState(false);
//   const [showContent, setShowContent] = useState(true);
//   const pathname = usePathname();

//   const menuSections = [
//     {
//       heading: 'Explore',
//       items: [
//         { label: 'Prices', icon: <DollarSign size={20} />, href: '/prices' },
//       ],
//     },
//     {
//       heading: 'Buy / Sell',
//       items: [
//         { label: 'Crypto assets', icon: <Bitcoin size={20} />, href: '/crypto-assets' },
//       ],
//     },
//     {
//       heading: 'Deposit',
//       items: [
//         { label: 'AUD', icon: <CreditCard size={20} />, href: '/deposit-aud' },
//       ],
//     },
//   ];

//   const MenuItem = forwardRef(({ item, section, isActive, ...props }, ref) => (
//     <Link href={item.href} passHref>
//       <Button
//         ref={ref}
//         variant="ghost"
//         className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-4'} ${
//           isActive ? 'bg-accent text-accent-foreground relative after:content-[""] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-5 after:bg-green-500 after:rounded-l-full' : ''
//         }`}
//         aria-current={isActive ? 'page' : undefined}
//         {...props}
//       >
//         {item.icon}
//         {!isCollapsed && <span className="ml-2">{item.label}</span>}
//       </Button>
//     </Link>
//   ));
//   MenuItem.displayName = 'MenuItem';

//   const MenuItemWithTooltip = ({ item, section, isActive }) => (
//     <TooltipProvider delayDuration={100}>
//       <Tooltip>
//         <TooltipTrigger asChild>
//           <MenuItem item={item} section={section} isActive={isActive} />
//         </TooltipTrigger>
//         <TooltipContent side="right" sideOffset={10}>
//           <p><span className="font-semibold">{section.heading}:</span> {item.label}</p>
//         </TooltipContent>
//       </Tooltip>
//     </TooltipProvider>
//   );

//   const handleToggle = () => {
//     setIsAnimating(true);
//     setShowContent(false);
//     setTimeout(() => {
//       setIsCollapsed(!isCollapsed);
//       setTimeout(() => {
//         setShowContent(true);
//         setIsAnimating(false);
//       }, 300); // Wait for collapse/expand animation to finish
//     }, 200); // Wait for fade out animation to finish
//   };

//   const ToggleButton = () => (
//     <TooltipProvider delayDuration={100}>
//       <Tooltip>
//         <TooltipTrigger asChild>
//           <Button
//             variant="ghost"
//             size="icon"
//             className="flex-shrink-0"
//             onClick={handleToggle}
//           >
//             {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
//           </Button>
//         </TooltipTrigger>
//         <TooltipContent side="right" sideOffset={10}>
//           <p>{isCollapsed ? 'Expand menu' : 'Collapse menu'}</p>
//         </TooltipContent>
//       </Tooltip>
//     </TooltipProvider>
//   );

//   return (
//     <motion.div
//       className={`bg-background border-r transition-all duration-200 ${isCollapsed ? 'w-16' : 'w-64'} hidden lg:flex flex-col`}
//       animate={{ width: isCollapsed ? 64 : 256 }}
//       transition={{ duration: 0.15 }}
//     >
//       <div className="flex flex-col h-full">
//         <AnimatePresence mode="wait">
//           {showContent && (
//             <motion.div
//               key="content"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.2 }}
//               className="flex flex-col h-full"
//             >
//               <div className={`p-4 ${isCollapsed ? 'pb-2' : 'pb-4'}`}>
//                 <div className={`flex ${isCollapsed ? 'flex-col' : 'items-center justify-between'}`}>
//                   {isCollapsed ? (
//                     <>
//                       <div className="w-[28px] h-[16px] bg-gray-200 mb-2">
//                         {/* Placeholder for small logo */}
//                       </div>
//                       <ToggleButton />
//                     </>
//                   ) : (
//                     <>
//                       <div className="w-[154px] h-[16px] bg-gray-200">
//                         {/* Placeholder for full logo */}
//                       </div>
//                       <ToggleButton />
//                     </>
//                   )}
//                 </div>
//               </div>
//               <nav className="flex-1 overflow-y-auto">
//                 <ul className="space-y-6 p-2">
//                   {menuSections.map((section) => (
//                     <li key={section.heading}>
//                       {!isCollapsed && (
//                         <h3 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">
//                           {section.heading}
//                         </h3>
//                       )}
//                       <ul className="space-y-1">
//                         {section.items.map((item) => (
//                           <li key={item.label}>
//                             {isCollapsed ? (
//                               <MenuItemWithTooltip item={item} section={section} isActive={pathname === item.href} />
//                             ) : (
//                               <MenuItem item={item} section={section} isActive={pathname === item.href} />
//                             )}
//                           </li>
//                         ))}
//                       </ul>
//                     </li>
//                   ))}
//                 </ul>
//               </nav>
//               <div className="p-4">
//                 <TooltipProvider delayDuration={100}>
//                   <Tooltip>
//                     <TooltipTrigger asChild>
//                       <Button
//                         variant="outline"
//                         className={`w-full ${isCollapsed ? 'justify-center' : 'justify-center'}`}
//                         size={isCollapsed ? "icon" : "default"}
//                       >
//                         {!isCollapsed && <span className="mr-2">Go to advanced</span>}
//                         <BarChart2 size={20} />
//                       </Button>
//                     </TooltipTrigger>
//                     <TooltipContent side="right" sideOffset={10}>
//                       <p>Go to advanced</p>
//                     </TooltipContent>
//                   </Tooltip>
//                 </TooltipProvider>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </motion.div>
//   );
// };

// export default Sidebar;
