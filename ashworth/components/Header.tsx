// 'use client';

// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import {
//   Facebook,
//   Instagram,
//   Linkedin,
//   Twitter,
//   Youtube,
//   MessageCircle,
//   Mail,
//   Phone,
//   ChevronRight,
//   LogOut,
//   UserRound,
//   ChevronDown,
//   ChevronRight as ChevronRightIcon,
// } from 'lucide-react';
// import { toast } from 'react-toastify';
// import { useAuth } from '@/context/AuthContext';
// import Monogram from '@/components/ui/Monogram';
// import { useState } from 'react';

// // NAVIGATION DATA (updated for 4-level subnav under Events > Events > Branding)
// const navigation = [
//   {
//     label: 'CLUBS',
//     href: '/club',
//     children: [
//       { label: 'CLUB One', href: '/clubs/club-one' },
//       { label: 'CLUB Two' , href: '/clubs/club-two'},
//       { label: 'CLUB Three' , href: '/clubs/club-three'},
//       { label: 'CLUB Four' , href: '/clubs/club-four'},
//     ],
//   },
//   {
//     label: 'PARTNERSHIPS OPPORTUNITIES',
//     href: '/partnerships',
//     children: [
//       { 
//         label: 'INVESTORS CONNNECT',
//         href: '/partnerships/technology',
//         children: [
//           { label: 'Startup Management', href: '/partnerships/investors/startup-management' },
//           { label: 'Fundraising', href: '/partnerships/investors/fund-raising' },
//           { label: 'Merger Aquisition', href: '/partnerships/investors/merger-aquisition' },
//         ]
//       },
//       {
//         label: 'PARTNERS CONNNECT',
//         href: '/partnerships/partners',
//         children: [
//           { label: 'TECHNOLOGY PARTNERS', href: '/partnerships/technology' },
//           { label: 'STRATEGIC PARTNERS', href: '/partnerships/strategic' },
//           { label: 'BUSINESS PARTNERS', href: '/partnerships/business' },
//           { label: 'DELIVERY PARTNERS', href: '/partnerships/delivery' },
//         ]
//       },
//       { label: 'FRANCHISE CONNECT', href: '/partnerships/franchise' },
//     ],
//   },
//   {
//     label: 'EVENTS & ENTERTAINMENT',
//     href: '/events',
//     children: [
//       { label: 'Investors Meets', href: '/events/investors-meets' },
//       { label: 'Partners Meets', href: '/events/partners-meets' },
//       { label: 'Franchisee Meets', href: '/events/franchisee-meets' },
//       { label: 'Music Concerts', href: '/events/music-concerts' },
//       { 
//         label: 'Events',
//         href: '/events/branding-launches',
//         children: [
//           {
//             label: 'Branding · Media · PR',
//             href: '/events/branding',
//             children: [
//               {
//                 label: 'Brand Strategy',
//                 href: '/events/branding/brand-strategy',
           
//               },
//               {
//                 label: 'Launches And Promotions',
//                 href: '/events/branding/launches-promotions',
               
//               },
//               {
//                 label: 'Campaigns And Surveys',
//                 href: '/events/branding/campaigns-surveys',
           
//               },
//               {
//                 label: 'Digital Marketing',
//                 href: '/events/branding/digital-marketing',
            
//               },
//               {
//                 label: 'Website Development',
//                 href: '/events/branding/website-development',
             
//               },
//               {
//                 label: 'Videos, Reels And Display',
//                 href: '/events/branding/videos-reels-display',
             
//               }
//             ]
//           },
//           { label: 'Launches', href: '/events/launches' },
//           { label: 'Promotions', href: '/events/promotions' },
//           { label: 'Campaigns & Surveys', href: '/events/campaigns-surveys' },
//         ],
//       },
//       { label: 'Conferences and Forums', href: '/events/conferences-forums' },
//     ],
//   },
//   {
//     label: 'MARKETPLACE',
//     href: '/marketplace',
//     children: [
//       { label: 'Real Estate', href: '/marketplace/real-estate' },
//       { label: 'Luxury Holidays', href: '/marketplace/luxury-holidays' },
//       { label: 'Luxury Business Travel', href: '/marketplace/luxury-business-travel' },
//       { label: 'Luxury Cars', href: '/marketplace/luxury-cars' },
//       { label: 'Luxury Aviation', href: '/marketplace/luxury-aviation' },
//       { label: 'Luxury Yachts', href: '/marketplace/luxury-yachts' },
//     ],
//   },
//   {
//     label: 'GLOBAL MANAGEMENT SERVICES',
//     href: '/global-management-services',
//     children:[
//       {
//         label: 'RETAINED SEARCH',
//         href: '/retained-search',
//         children: [
//           { label: 'RETAINED CXO SEARCH', href: '/retained-search/cxo' },
//           { label: 'SENIOR EXECUTIVE SEARCH', href: '/retained-search/senior-executive' },
//           { label: 'CAREER WITH IBA', href: '/retained-search/career' },
//         ],
//       },
//       {
//         label: 'MANAGEMENT SERVICES',
//         href: '/advisory-consulting',
//         children: [
//           { label: 'BOARD ADVISORY', href: '/advisory-consulting/board' },
//           { label: 'CORPORATE GOVERNANCE ADVISORY', href: '/advisory-consulting/corporate-governance' },
//           { label: 'BUSINESS ADVISORY & CONSULTING', href: '/advisory-consulting/business' },
//           { label: 'HR TRANSFORMATIONAL CONSULTING', href: '/advisory-consulting/hr-transformational' },
//           { label: 'LEGAL ADVISORY & CONSULTING', href: '/advisory-consulting/legal' },
//           { label: 'BRANDING, PR & IMAGE CONSULTING', href: '/advisory-consulting/branding-pr' },
//           { label: 'MEDIA ADVERTISING & PRODUCTION', href: '/advisory-consulting/media-advertising' },
//           { label: 'FINANCIAL ADVISORY & CONSULTING', href: '/advisory-consulting/financial' },
//           { label: 'PAY ROLLS', href: '/advisory-consulting/pay-rolls' },
//         ],
//       },
//       {
//         label: 'COACHING & MENTORING',
//         href: '/coaching-mentoring',
//         children: [
//           { label: 'TRANSFORMATIONAL COACHING', href: '/coaching-mentoring/transformational' },
//           { label: 'ENTREPRENEURIAL COACHING', href: '/coaching-mentoring/entrepreneurial' },
//           { label: 'MENTORING THE YOUNG LEADERS', href: '/coaching-mentoring/young-leaders' },
//           { label: 'LEADERSHIP COACHING', href: '/coaching-mentoring/leadership' },
//           { label: 'IMPACT SALES PROGRAMS', href: '/coaching-mentoring/impact-sales' },
//           { label: 'SOFT SKILLS PROGRAMS', href: '/coaching-mentoring/soft-skills' },
//           { label: 'INTERNSHIP PROGRAMS', href: '/coaching-mentoring/internship' },
//         ],
//       },
//     ]
//   },
//   {
//     label: 'NEWS ROOM',
//     href: '/news',
//   },
//   {
//     label: 'CONTACT US',
//     href: '/contact',
//   },
// ];

// const SOCIAL_ICONS = [Facebook, Instagram, Linkedin, Twitter, MessageCircle, Youtube];

// // Recursive menu rendering for deep subnavs
// function RenderMenu({ items, level = 0, parentKey = '' }: { items: any[]; level?: number; parentKey?: string }) {
//   const [openIdx, setOpenIdx] = useState<number | null>(null);

//   return (
//     <ul>
//       {items.map((item, idx) => {
//         const hasChildren = Array.isArray(item.children) && item.children.length > 0;
//         const key = `${parentKey}${item.label}-${idx}`;
//         if (hasChildren) {
//           return (
//             <li
//               key={key}
//               className="relative group"
//               onMouseEnter={() => setOpenIdx(idx)}
//               onMouseLeave={() => setOpenIdx(null)}
//             >
//               <button
//                 type="button"
//                 className={`w-full flex items-center justify-between px-4 py-2 text-[13px] ${level === 0 ? 'bg-ivory hover:bg-beige' : 'bg-ivory hover:bg-beige'} hover:text-gold-dark transition-colors whitespace-nowrap uppercase font-semibold`}
//               >
//                 <span>{item.label}</span>
//                 <ChevronRightIcon size={14} className="text-gold-dark ml-2" />
//               </button>
//               {openIdx === idx && (
//                 <div
//                   className={`absolute ${level === 0 ? 'left-full -top-1' : 'left-full top-0'} w-max bg-ivory border border-gold-light/60 shadow-xl rounded z-30 py-1 animate-fadeIn min-w-[220px]`}
//                   role="menu"
//                 >
//                   <RenderMenu items={item.children} level={level + 1} parentKey={key + '-'} />
//                 </div>
//               )}
//             </li>
//           );
//         }
//         return (
//           <li key={key}>
//             <Link
//               href={item.href}
//               className="block px-4 py-2 text-[13px] bg-ivory hover:bg-beige hover:text-gold-dark transition-colors whitespace-nowrap uppercase"
//             >
//               {item.label}
//             </Link>
//           </li>
//         );
//       })}
//     </ul>
//   );
// }

// // Custom Hook for multi-level dropdowns for top-level and one sub-level
// function useDropdowns() {
//   // For first-level: main nav index, for second-level: (mainIdx, subIdx)
//   const [openIdx, setOpenIdx] = useState<number | null>(null);
//   const [openSubIdx, setOpenSubIdx] = useState<number | null>(null);
//   const open = (idx: number) => {
//     setOpenIdx(idx);
//     setOpenSubIdx(null);
//   };
//   const close = () => {
//     setOpenIdx(null);
//     setOpenSubIdx(null);
//   };
//   const openSub = (subIdx: number) => setOpenSubIdx(subIdx);
//   const closeSub = () => setOpenSubIdx(null);
//   return { openIdx, open, close, openSubIdx, openSub, closeSub };
// }

// export default function Header() {
//   const { isAuthenticated, isLoading, logout } = useAuth();
//   const router = useRouter();
//   const dropdown = useDropdowns();

//   async function handleLogout() {
//     await logout();
//     toast.success('You have been logged out.');
//     router.push('/');
//   }

//   return (
//     <>
//       <header className="sticky top-0 z-30 bg-beige backdrop-blur border-b border-gold-light/30">
//         {/* Row 1: social icons + contact info */}
//         <div className=" mx-auto px-6 py-3 flex items-center justify-between gap-3 flex-wrap w-full">
//           <div className="flex items-center gap-2">
//             {SOCIAL_ICONS.map((Icon, i) => (
//               <button
//                 key={i}
//                 type="button"
//                 className="w-8 h-8 flex items-center justify-center rounded-md border border-ink/25 text-ink/70 hover:text-gold-dark hover:border-gold-dark transition-colors"
//               >
//                 <Icon size={14} strokeWidth={1.75} />
//               </button>
//             ))}
//           </div>
//           <div className="hidden md:flex items-center gap-4 font-sans text-[12px] text-ink/70">
//             <span className="inline-flex items-center gap-1.5">
//               <Mail size={13} strokeWidth={1.75} className="text-red-400" />
//               business@ibasearch.com
//             </span>
//             <span className="inline-flex items-center gap-1.5">
//               <Phone size={13} strokeWidth={1.75} className="text-emerald-500" />
//               +91-88027 56666 | +91-88027 06666
//             </span>
//           </div>
//         </div>
//         <div className=" mx-auto mx-16 px-6 pb-3 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
//           {/* Left: logo */}
//           <Link href="/" className="flex flex-col justify-center items-center gap-1 group shrink-0">
//             <Monogram size={60} animated={false} />
//             <span className="font-serif text-3xl tracking-wide text-ink group-hover:text-gold-dark transition-colors">
//               VRK Group
//             </span>
//           </Link>
//           {/* Right: login buttons + search */}
//           <div className="flex flex-col items-start lg:items-end gap-2.5 w-full lg:w-auto">
//             <div className="flex flex-col items-center gap-3 flex-wrap w-full lg:w-auto">
//               <div className='flex gap-3'>
//                 {!isLoading && isAuthenticated ? (
//                   <>
//                     <Link
//                       href="/profile"
//                       className="inline-flex items-center gap-2 font-sans text-[12px] tracking-widest2 uppercase text-ink/60 hover:text-gold-dark transition-colors"
//                     >
//                       <UserRound size={15} strokeWidth={1.5} />
//                       My Profile
//                     </Link>
//                     <button
//                       type="button"
//                       onClick={handleLogout}
//                       className="inline-flex items-center gap-2 font-sans text-[12px] tracking-widest2 uppercase text-ink/60 hover:text-gold-dark transition-colors"
//                     >
//                       <LogOut size={15} strokeWidth={1.5} />
//                       Logout
//                     </button>
//                   </>
//                 ) : (
//                   <>
//                     <button
//                       type="button"
//                       className="px-5 h-10 bg-gold-dark text-ivory font-sans text-[12px] tracking-widest2 uppercase hover:bg-ink transition-colors"
//                     >
//                       Job Seekers Login
//                     </button>
//                     <button
//                       type="button"
//                       className="px-5 h-10 bg-gold-dark text-ivory font-sans text-[12px] tracking-widest2 uppercase hover:bg-ink transition-colors"
//                     >
//                       Employers Login
//                     </button>
//                     <button
//                       type="button"
//                       className="px-5 h-10 bg-gold-dark text-ivory font-sans text-[12px] tracking-widest2 uppercase hover:bg-ink transition-colors"
//                     >
//                       Partners Login
//                     </button>
//                   </>
//                 )}
//               </div>
//               {/* Search box */}
//               <div className="flex w-full items-center border border-ink/30 flex-1 lg:flex-initial">
//                 <input
//                   type="text"
//                   placeholder="Search"
//                   className="h-10 w-full lg:w-64 px-3 font-sans text-[13px] text-ink placeholder:text-ink/40 bg-transparent focus:outline-none"
//                 />
//                 <button
//                   type="button"
//                   className="h-10 w-10 flex items-center justify-center bg-gold-dark text-ivory hover:bg-ink transition-colors shrink-0 self-end ml-auto"
//                 >
//                   <ChevronRight size={16} strokeWidth={2} />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//         <nav className="w-full z-40 bg-ivory border-t border-gold-light/25 shadow-lg whitespace-nowrap">
//           <div className="mx-auto px-2">
//             <ul className="flex flex-wrap md:flex-nowrap items-stretch md:justify-center gap-1 divide-x divide-gold-light/30 select-none font-sans text-[13px]">
//               {navigation.map((item, idx) => (
//                 <li
//                   key={item.label}
//                   className="relative group"
//                   onMouseEnter={() => dropdown.open(idx)}
//                   onMouseLeave={dropdown.close}
//                 >
//                   {/* Button for toggling (both for a11y on mobile and for hover on desktop) */}
//                   {item.children ? (
//                     <button
//                       type="button"
//                       className="flex items-center gap-1 px-4 py-3 bg-transparent hover:bg-beige transition-colors uppercase font-semibold text-ink/80 tracking-wide focus:outline-none"
//                       aria-haspopup="menu"
//                       aria-expanded={dropdown.openIdx === idx}
//                       onClick={() => (dropdown.openIdx === idx ? dropdown.close() : dropdown.open(idx))}
//                     >
//                       <span>{item.label}</span>
//                       <ChevronDown
//                         size={14}
//                         className="text-gold-dark group-hover:rotate-180 transition-transform"
//                       />
//                     </button>
//                   ) : (
//                     <Link
//                       href={item.href}
//                       className="flex items-center gap-1 px-4 py-3 bg-transparent hover:bg-beige transition-colors uppercase font-semibold text-ink/80 tracking-wide"
//                     >
//                       {item.label}
//                     </Link>
//                   )}
//                   {/* Dropdown: use RenderMenu for deep navs if present, otherwise original subnav */}
//                   {item.children && dropdown.openIdx === idx && (
//                     <div
//                       className="absolute top-full left-0 w-max border border-gold-light/60 shadow-xl rounded-b z-20 py-1 animate-fadeIn bg-ivory"
//                       role="menu"
//                     >
//                       {/* Special recursive menu for deep Events > Events > Branding nav */}
//                       {item.label === 'EVENTS & ENTERTAINMENT' ? (
//                         <RenderMenu items={item.children} />
//                       ) : (
//                         <ul>
//                           {item.children.map((child, subIdx) => {
//                             if (child.children) {
//                               return (
//                                 <li
//                                   key={child.label}
//                                   className="relative group"
//                                   onMouseEnter={() => dropdown.openSub(subIdx)}
//                                   onMouseLeave={dropdown.closeSub}
//                                 >
//                                   {/* Parent (subnav) item */}
//                                   <button
//                                     type="button"
//                                     className="w-full flex items-center justify-between px-4 py-2 text-[13px] bg-ivory hover:bg-beige hover:text-gold-dark transition-colors whitespace-nowrap uppercase font-semibold"
//                                   >
//                                     <span>{child.label}</span>
//                                     <ChevronRightIcon size={14} className="text-gold-dark ml-2" />
//                                   </button>
//                                   {/* Sub-subnav, only show if hovered */}
//                                   {dropdown.openSubIdx === subIdx && (
//                                     <div
//                                       className="absolute left-full -top-1 w-max bg-ivory border border-gold-light/60 shadow-xl rounded z-30 py-1 animate-fadeIn min-w-[220px]"
//                                       role="menu"
//                                     >
//                                       <ul>
//                                         {child.children.map((subChild) => (
//                                           <li key={subChild.label}>
//                                             <Link
//                                               href={subChild.href}
//                                               className="block px-4 py-2 text-[13px] bg-ivory hover:bg-beige hover:text-gold-dark transition-colors whitespace-nowrap uppercase"
//                                             >
//                                               {subChild.label}
//                                             </Link>
//                                           </li>
//                                         ))}
//                                       </ul>
//                                     </div>
//                                   )}
//                                 </li>
//                               );
//                             }
//                             // Other standard level 2 entries
//                             return (
//                               <li key={child.label}>
//                                 <Link
//                                   href={child.href}
//                                   className="block px-4 py-2 text-[13px] bg-ivory hover:bg-beige hover:text-gold-dark transition-colors whitespace-nowrap uppercase"
//                                 >
//                                   {child.label}
//                                 </Link>
//                               </li>
//                             );
//                           })}
//                         </ul>
//                       )}
//                     </div>
//                   )}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </nav>
//       </header>

//       <style jsx global>{`
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(-7px);
//           }
//           to {
//             opacity: 1;
//             transform: none;
//           }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.19s cubic-bezier(0.39, 0.41, 1, 1) both;
//         }
//       `}</style>
//     </>
//   );
// }
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  MessageCircle,
  Mail,
  Phone,
  ChevronRight,
  LogOut,
  UserRound,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import Monogram from '@/components/ui/Monogram';
import { useState } from 'react';

// NAVIGATION DATA (updated for 4-level subnav under Events > Events > Branding)
const navigation = [
  {
    label: 'CLUBS',
    href: '/club',
    children: [
      { label: 'CLUB One', href: '/clubs/club-one' },
      { label: 'CLUB Two', href: '/clubs/club-two' },
      { label: 'CLUB Three', href: '/clubs/club-three' },
      { label: 'CLUB Four', href: '/clubs/club-four' },
    ],
  },
  {
    label: 'PARTNERSHIPS OPPORTUNITIES',
    href: '/partnerships',
    children: [
      {
        label: 'INVESTORS CONNNECT',
        href: '/partnerships/technology',
        children: [
          { label: 'Startup Management', href: '/partnerships/investors/startup-management' },
          { label: 'Fundraising', href: '/partnerships/investors/fund-raising' },
          { label: 'Merger Aquisition', href: '/partnerships/investors/merger-aquisition' },
        ],
      },
      {
        label: 'PARTNERS CONNNECT',
        href: '/partnerships/partners',
        children: [
          { label: 'TECHNOLOGY PARTNERS', href: '/partnerships/technology' },
          { label: 'STRATEGIC PARTNERS', href: '/partnerships/strategic' },
          { label: 'BUSINESS PARTNERS', href: '/partnerships/business' },
          { label: 'DELIVERY PARTNERS', href: '/partnerships/delivery' },
        ],
      },
      { label: 'FRANCHISE CONNECT', href: '/partnerships/franchise' },
    ],
  },
  {
    label: 'EVENTS & ENTERTAINMENT',
    href: '/events',
    children: [
      { label: 'Investors Meets', href: '/events/investors-meets' },
      { label: 'Partners Meets', href: '/events/partners-meets' },
      { label: 'Franchisee Meets', href: '/events/franchisee-meets' },
      { label: 'Music Concerts', href: '/events/music-concerts' },
      {
        label: 'Events',
        href: '/events/branding-launches',
        children: [
          {
            label: 'Branding · Media · PR',
            href: '/events/branding',
            children: [
              { label: 'Brand Strategy', href: '/events/branding/brand-strategy' },
              { label: 'Launches And Promotions', href: '/events/branding/launches-promotions' },
              { label: 'Campaigns And Surveys', href: '/events/branding/campaigns-surveys' },
              { label: 'Digital Marketing', href: '/events/branding/digital-marketing' },
              { label: 'Website Development', href: '/events/branding/website-development' },
              { label: 'Videos, Reels And Display', href: '/events/branding/videos-reels-display' },
            ],
          },
          { label: 'Launches', href: '/events/launches' },
          { label: 'Promotions', href: '/events/promotions' },
          { label: 'Campaigns & Surveys', href: '/events/campaigns-surveys' },
        ],
      },
      { label: 'Conferences and Forums', href: '/events/conferences-forums' },
    ],
  },
  {
    label: 'MARKETPLACE',
    href: '/marketplace',
    children: [
      { label: 'Real Estate', href: '/marketplace/real-estate' },
      { label: 'Luxury Holidays', href: '/marketplace/luxury-holidays' },
      { label: 'Luxury Business Travel', href: '/marketplace/luxury-business-travel' },
      { label: 'Luxury Cars', href: '/marketplace/luxury-cars' },
      { label: 'Luxury Aviation', href: '/marketplace/luxury-aviation' },
      { label: 'Luxury Yachts', href: '/marketplace/luxury-yachts' },
    ],
  },
  {
    label: 'GLOBAL MANAGEMENT SERVICES',
    href: '/global-management-services',
    children: [
      {
        label: 'RETAINED SEARCH',
        href: '/retained-search',
        children: [
          { label: 'RETAINED CXO SEARCH', href: '/retained-search/cxo' },
          { label: 'SENIOR EXECUTIVE SEARCH', href: '/retained-search/senior-executive' },
          { label: 'CAREER WITH IBA', href: '/retained-search/career' },
        ],
      },
      {
        label: 'MANAGEMENT SERVICES',
        href: '/advisory-consulting',
        children: [
          { label: 'BOARD ADVISORY', href: '/advisory-consulting/board' },
          { label: 'CORPORATE GOVERNANCE ADVISORY', href: '/advisory-consulting/corporate-governance' },
          { label: 'BUSINESS ADVISORY & CONSULTING', href: '/advisory-consulting/business' },
          { label: 'HR TRANSFORMATIONAL CONSULTING', href: '/advisory-consulting/hr-transformational' },
          { label: 'LEGAL ADVISORY & CONSULTING', href: '/advisory-consulting/legal' },
          { label: 'BRANDING, PR & IMAGE CONSULTING', href: '/advisory-consulting/branding-pr' },
          { label: 'MEDIA ADVERTISING & PRODUCTION', href: '/advisory-consulting/media-advertising' },
          { label: 'FINANCIAL ADVISORY & CONSULTING', href: '/advisory-consulting/financial' },
          { label: 'PAY ROLLS', href: '/advisory-consulting/pay-rolls' },
        ],
      },
      {
        label: 'COACHING & MENTORING',
        href: '/coaching-mentoring',
        children: [
          { label: 'TRANSFORMATIONAL COACHING', href: '/coaching-mentoring/transformational' },
          { label: 'ENTREPRENEURIAL COACHING', href: '/coaching-mentoring/entrepreneurial' },
          { label: 'MENTORING THE YOUNG LEADERS', href: '/coaching-mentoring/young-leaders' },
          { label: 'LEADERSHIP COACHING', href: '/coaching-mentoring/leadership' },
          { label: 'IMPACT SALES PROGRAMS', href: '/coaching-mentoring/impact-sales' },
          { label: 'SOFT SKILLS PROGRAMS', href: '/coaching-mentoring/soft-skills' },
          { label: 'INTERNSHIP PROGRAMS', href: '/coaching-mentoring/internship' },
        ],
      },
    ],
  },
  {
    label: 'NEWS ROOM',
    href: '/news',
  },
  {
    label: 'CONTACT US',
    href: '/contact',
  },
];

const SOCIAL_ICONS = [Facebook, Instagram, Linkedin, Twitter, MessageCircle, Youtube];

// Shared container classes so all three header rows align left/right identically.
// Adjust the max-w value here in one place if you want the header narrower/wider.
const CONTAINER = 'max-w-[1440px] mx-auto px-6 w-full';

// Recursive menu rendering for deep subnavs
function RenderMenu({ items, level = 0, parentKey = '' }: { items: any[]; level?: number; parentKey?: string }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <ul>
      {items.map((item, idx) => {
        const hasChildren = Array.isArray(item.children) && item.children.length > 0;
        const key = `${parentKey}${item.label}-${idx}`;
        if (hasChildren) {
          return (
            <li
              key={key}
              className="relative group"
              onMouseEnter={() => setOpenIdx(idx)}
              onMouseLeave={() => setOpenIdx(null)}
            >
              <button
                type="button"
                className={`w-full flex items-center justify-between px-4 py-2 text-[13px] ${
                  level === 0 ? 'bg-ivory hover:bg-beige' : 'bg-ivory hover:bg-beige'
                } hover:text-gold-dark transition-colors whitespace-nowrap uppercase font-semibold`}
              >
                <span>{item.label}</span>
                <ChevronRightIcon size={14} className="text-gold-dark ml-2" />
              </button>
              {openIdx === idx && (
                <div
                  className={`absolute ${
                    level === 0 ? 'left-full -top-1' : 'left-full top-0'
                  } w-max bg-ivory border border-gold-light/60 shadow-xl rounded z-30 py-1 animate-fadeIn min-w-[220px]`}
                  role="menu"
                >
                  <RenderMenu items={item.children} level={level + 1} parentKey={key + '-'} />
                </div>
              )}
            </li>
          );
        }
        return (
          <li key={key}>
            <Link
              href={item.href}
              className="block px-4 py-2 text-[13px] bg-ivory hover:bg-beige hover:text-gold-dark transition-colors whitespace-nowrap uppercase"
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// Custom Hook for multi-level dropdowns for top-level and one sub-level
function useDropdowns() {
  // For first-level: main nav index, for second-level: (mainIdx, subIdx)
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [openSubIdx, setOpenSubIdx] = useState<number | null>(null);
  const open = (idx: number) => {
    setOpenIdx(idx);
    setOpenSubIdx(null);
  };
  const close = () => {
    setOpenIdx(null);
    setOpenSubIdx(null);
  };
  const openSub = (subIdx: number) => setOpenSubIdx(subIdx);
  const closeSub = () => setOpenSubIdx(null);
  return { openIdx, open, close, openSubIdx, openSub, closeSub };
}

export default function Header() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const dropdown = useDropdowns();

  async function handleLogout() {
    await logout();
    toast.success('You have been logged out.');
    router.push('/');
  }

  return (
    <>
      <header className="sticky top-0 z-30 bg-beige backdrop-blur border-b border-gold-light/30">
        {/* Row 1: social icons + contact info */}
        <div className={`${CONTAINER} py-3 flex items-center justify-between gap-3 flex-wrap`}>
          <div className="flex items-center gap-2">
            {SOCIAL_ICONS.map((Icon, i) => (
              <button
                key={i}
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-md border border-ink/25 text-ink/70 hover:text-gold-dark hover:border-gold-dark transition-colors"
              >
                <Icon size={14} strokeWidth={1.75} />
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-4 font-sans text-[12px] text-ink/70">
            <span className="inline-flex items-center gap-1.5">
              <Mail size={13} strokeWidth={1.75} className="text-red-400" />
              business@ibasearch.com
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Phone size={13} strokeWidth={1.75} className="text-emerald-500" />
              +91-88027 56666 | +91-88027 06666
            </span>
          </div>
        </div>

        {/* Row 2: logo + login/search */}
        <div className={`${CONTAINER} pb-3 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4`}>
          {/* Left: logo */}
          <Link href="/" className="flex flex-col justify-center items-center gap-1 group shrink-0">
            <Monogram size={60} animated={false} />
            <span className="font-serif text-3xl tracking-wide text-ink group-hover:text-gold-dark transition-colors">
              VRK Group
            </span>
          </Link>
          {/* Right: login buttons + search */}
          <div className="flex flex-col items-start lg:items-end gap-2.5 w-full lg:w-auto">
            <div className="flex flex-col items-center gap-3 flex-wrap w-full lg:w-auto">
              <div className="flex gap-3">
                {!isLoading && isAuthenticated ? (
                  <>
                    <Link
                      href="/profile"
                      className="inline-flex items-center gap-2 font-sans text-[12px] tracking-widest2 uppercase text-ink/60 hover:text-gold-dark transition-colors"
                    >
                      <UserRound size={15} strokeWidth={1.5} />
                      My Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex items-center gap-2 font-sans text-[12px] tracking-widest2 uppercase text-ink/60 hover:text-gold-dark transition-colors"
                    >
                      <LogOut size={15} strokeWidth={1.5} />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="px-5 h-10 bg-gold-dark text-ivory font-sans text-[12px] tracking-widest2 uppercase hover:bg-ink transition-colors"
                    >
                      Job Seekers Login
                    </button>
                    <button
                      type="button"
                      className="px-5 h-10 bg-gold-dark text-ivory font-sans text-[12px] tracking-widest2 uppercase hover:bg-ink transition-colors"
                    >
                      Employers Login
                    </button>
                    <button
                      type="button"
                      className="px-5 h-10 bg-gold-dark text-ivory font-sans text-[12px] tracking-widest2 uppercase hover:bg-ink transition-colors"
                    >
                      Partners Login
                    </button>
                  </>
                )}
              </div>
              {/* Search box */}
              <div className="flex w-full items-center border border-ink/30 flex-1 lg:flex-initial">
                <input
                  type="text"
                  placeholder="Search"
                  className="h-10 w-full lg:w-64 px-3 font-sans text-[13px] text-ink placeholder:text-ink/40 bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  className="h-10 w-10 flex items-center justify-center bg-gold-dark text-ivory hover:bg-ink transition-colors shrink-0 self-end ml-auto"
                >
                  <ChevronRight size={16} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: main nav */}
        <nav className="w-full z-40 bg-ivory border-t border-gold-light/25 shadow-lg whitespace-nowrap">
          <div className={CONTAINER}>
            <ul className="flex w-full flex-wrap md:flex-nowrap items-stretch md:justify-evenly gap-1  select-none font-sans text-[13px]">
              {navigation.map((item, idx) => (
                <li
                  key={item.label}
                  className="relative group"
                  onMouseEnter={() => dropdown.open(idx)}
                  onMouseLeave={dropdown.close}
                >
                  {/* Button for toggling (both for a11y on mobile and for hover on desktop) */}
                  {item.children ? (
                    <button
                      type="button"
                      className="flex items-center gap-1 px-4 py-3 bg-transparent hover:bg-beige transition-colors uppercase font-semibold text-ink/80 tracking-wide focus:outline-none"
                      aria-haspopup="menu"
                      aria-expanded={dropdown.openIdx === idx}
                      onClick={() => (dropdown.openIdx === idx ? dropdown.close() : dropdown.open(idx))}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        size={14}
                        className="text-gold-dark group-hover:rotate-180 transition-transform"
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className="flex items-center gap-1 px-4 py-3 bg-transparent hover:bg-beige transition-colors uppercase font-semibold text-ink/80 tracking-wide"
                    >
                      {item.label}
                    </Link>
                  )}
                  {/* Dropdown: use RenderMenu for deep navs if present, otherwise original subnav */}
                  {item.children && dropdown.openIdx === idx && (
                    <div
                      className="absolute top-full left-0 w-max border border-gold-light/60 shadow-xl rounded-b z-20 py-1 animate-fadeIn bg-ivory"
                      role="menu"
                    >
                      {/* Special recursive menu for deep Events > Events > Branding nav */}
                      {item.label === 'EVENTS & ENTERTAINMENT' ? (
                        <RenderMenu items={item.children} />
                      ) : (
                        <ul>
                          {item.children.map((child, subIdx) => {
                            if (child.children) {
                              return (
                                <li
                                  key={child.label}
                                  className="relative group"
                                  onMouseEnter={() => dropdown.openSub(subIdx)}
                                  onMouseLeave={dropdown.closeSub}
                                >
                                  {/* Parent (subnav) item */}
                                  <button
                                    type="button"
                                    className="w-full flex items-center justify-between px-4 py-2 text-[13px] bg-ivory hover:bg-beige hover:text-gold-dark transition-colors whitespace-nowrap uppercase font-semibold"
                                  >
                                    <span>{child.label}</span>
                                    <ChevronRightIcon size={14} className="text-gold-dark ml-2" />
                                  </button>
                                  {/* Sub-subnav, only show if hovered */}
                                  {dropdown.openSubIdx === subIdx && (
                                    <div
                                      className="absolute left-full -top-1 w-max bg-ivory border border-gold-light/60 shadow-xl rounded z-30 py-1 animate-fadeIn min-w-[220px]"
                                      role="menu"
                                    >
                                      <ul>
                                        {child.children.map((subChild) => (
                                          <li key={subChild.label}>
                                            <Link
                                              href={subChild.href}
                                              className="block px-4 py-2 text-[13px] bg-ivory hover:bg-beige hover:text-gold-dark transition-colors whitespace-nowrap uppercase"
                                            >
                                              {subChild.label}
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </li>
                              );
                            }
                            // Other standard level 2 entries
                            return (
                              <li key={child.label}>
                                <Link
                                  href={child.href}
                                  className="block px-4 py-2 text-[13px] bg-ivory hover:bg-beige hover:text-gold-dark transition-colors whitespace-nowrap uppercase"
                                >
                                  {child.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-7px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.19s cubic-bezier(0.39, 0.41, 1, 1) both;
        }
      `}</style>
    </>
  );
}