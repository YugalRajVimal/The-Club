// // 'use client';

// // import Link from 'next/link';
// // import { useRouter } from 'next/navigation';
// // import { LogOut, UserRound } from 'lucide-react';
// // import { toast } from 'react-toastify';
// // import { useAuth } from '@/context/AuthContext';
// // import Monogram from '@/components/ui/Monogram';

// // export default function Header() {
// //   const { isAuthenticated, isLoading, logout } = useAuth();
// //   const router = useRouter();

// //   async function handleLogout() {
// //     await logout();
// //     toast.success('You have been logged out.');
// //     router.push('/');
// //   }

// //   return (
// //     <header className="sticky top-0 z-30 bg-ivory/90 backdrop-blur border-b border-gold-light/30">
// //       <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
// //         <Link href="/" className="flex items-center gap-3 group">
// //           <Monogram size={28} animated={false} />
// //           <span className="font-serif text-lg tracking-wide text-ink group-hover:text-gold-dark transition-colors">
// //             The Ashworth Club
// //           </span>
// //         </Link>

// //         <nav className="flex items-center gap-6">
// //           {!isLoading && isAuthenticated && (
// //             <>
// //               <Link
// //                 href="/profile"
// //                 className="hidden sm:inline-flex items-center gap-2 font-sans text-[12px] tracking-widest2 uppercase text-ink/60 hover:text-gold-dark transition-colors"
// //               >
// //                 <UserRound size={15} strokeWidth={1.5} />
// //                 My Profile
// //               </Link>
// //               <button
// //                 type="button"
// //                 onClick={handleLogout}
// //                 className="inline-flex items-center gap-2 font-sans text-[12px] tracking-widest2 uppercase text-ink/60 hover:text-gold-dark transition-colors"
// //               >
// //                 <LogOut size={15} strokeWidth={1.5} />
// //                 Logout
// //               </button>
// //             </>
// //           )}

// //           {!isLoading && !isAuthenticated && (
// //             <Link
// //               href="/login"
// //               className="font-sans text-[12px] tracking-widest2 uppercase text-gold-dark hover:underline"
// //             >
// //               Sign In
// //             </Link>
// //           )}
// //         </nav>
// //       </div>
// //     </header>
// //   );
// // }

// 'use client';

// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import {
//   Facebook,
//   Instagram,
//   Linkedin,
//   Twitter,
//   Youtube,
//   Mail,
//   Phone,
//   Search,
//   ChevronRight,
//   LogOut,
//   UserRound,
// } from 'lucide-react';
// import { toast } from 'react-toastify';
// import { useAuth } from '@/context/AuthContext';
// import Monogram from '@/components/ui/Monogram';

// const SOCIAL_ICONS = [Facebook, Instagram, Linkedin, Twitter, Youtube];



// export default function Header() {
//   const { isAuthenticated, isLoading, logout } = useAuth();
//   const router = useRouter();

//   async function handleLogout() {
//     await logout();
//     toast.success('You have been logged out.');
//     router.push('/');
//   }

//   return (
//     <header className="sticky top-0 z-30 bg-ivory/95 backdrop-blur border-b border-gold-light/30">
//       {/* Top utility bar */}
//       <div className="border-b border-gold-light/20">
//         <div className="max-w-7xl mx-auto px-6 h-11 flex items-center justify-between">
//           {/* Social icons */}
//           <div className="flex items-center gap-2">
//             {SOCIAL_ICONS.map((Icon, i) => (
//               <button
//                 key={i}
//                 type="button"
//                 className="w-7 h-7 flex items-center justify-center rounded-full border border-ink/20 text-ink/70 hover:text-gold-dark hover:border-gold-dark transition-colors"
//               >
//                 <Icon size={13} strokeWidth={1.75} />
//               </button>
//             ))}
//           </div>

//           {/* Contact info */}
//           <div className="hidden md:flex items-center gap-4 font-sans text-[12px] text-ink/70">
//             <span className="inline-flex items-center gap-1.5">
//               <Mail size={13} strokeWidth={1.75} className="text-red-400" />
//               business@ibasearch.com
//             </span>
//             <span className="inline-flex items-center gap-1.5">
//               <Phone size={13} strokeWidth={1.75} className="text-emerald-500" />
//               +91-88027 56666
//             </span>
//             <span className="text-ink/30">|</span>
//             <span>+91-88027 06666</span>
//           </div>
//         </div>
//       </div>

//       {/* Middle bar: logo, login buttons, search */}
//       <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
//         <Link href="/" className="flex items-center gap-3 group shrink-0">
//           <Monogram size={30} animated={false} />
//           <span className="font-serif text-lg tracking-wide text-ink group-hover:text-gold-dark transition-colors">
//             The Ashworth Club
//           </span>
//         </Link>

//         <div className="flex items-center gap-3">
//           {!isLoading && isAuthenticated ? (
//             <>
//               <Link
//                 href="/profile"
//                 className="hidden sm:inline-flex items-center gap-2 font-sans text-[12px] tracking-widest2 uppercase text-ink/60 hover:text-gold-dark transition-colors"
//               >
//                 <UserRound size={15} strokeWidth={1.5} />
//                 My Profile
//               </Link>
//               <button
//                 type="button"
//                 onClick={handleLogout}
//                 className="inline-flex items-center gap-2 font-sans text-[12px] tracking-widest2 uppercase text-ink/60 hover:text-gold-dark transition-colors"
//               >
//                 <LogOut size={15} strokeWidth={1.5} />
//                 Logout
//               </button>
//             </>
//           ) : (
//             <>
//               <button
//                 type="button"
//                 className="px-5 h-10 bg-gold-dark text-ivory font-sans text-[12px] tracking-widest2 uppercase hover:bg-ink transition-colors"
//               >
//                 Job Seekers Login
//               </button>
//               <button
//                 type="button"
//                 className="hidden lg:inline-flex px-5 h-10 bg-gold-dark text-ivory font-sans text-[12px] tracking-widest2 uppercase hover:bg-ink transition-colors"
//               >
//                 Employers Login
//               </button>
//               <button
//                 type="button"
//                 className="hidden lg:inline-flex px-5 h-10 bg-gold-dark text-ivory font-sans text-[12px] tracking-widest2 uppercase hover:bg-ink transition-colors"
//               >
//                 Partners Login
//               </button>
//             </>
//           )}

//           {/* Search box */}
//           <div className="hidden md:flex items-center border border-ink/20">
//             <input
//               type="text"
//               placeholder="Search"
//               className="h-10 w-40 px-3 font-sans text-[13px] text-ink placeholder:text-ink/40 bg-transparent focus:outline-none"
//             />
//             <button
//               type="button"
//               className="h-10 w-10 flex items-center justify-center bg-gold-dark text-ivory hover:bg-ink transition-colors"
//             >
//               <ChevronRight size={16} strokeWidth={2} />
//             </button>
//           </div>
//         </div>
//       </div>


//     </header>
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
  Search,
  ChevronRight,
  LogOut,
  UserRound,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import Monogram from '@/components/ui/Monogram';

const SOCIAL_ICONS = [Facebook, Instagram, Linkedin, Twitter, MessageCircle, Youtube];

export default function Header() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    toast.success('You have been logged out.');
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-30 bg-ivory/95 backdrop-blur border-b border-gold-light/30">
       {/* Row 1: social icons + contact info */}
       <div className="max-w-7xl  mx-auto px-6 py-3 flex items-center justify-between gap-3 flex-wrap w-full">
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
      <div className="max-w-7xl mx-auto px-6 pb-3 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <Monogram size={34} animated={false} />
          <span className="font-serif text-xl tracking-wide text-ink group-hover:text-gold-dark transition-colors">
            The Ashworth Club
          </span>
        </Link>

        

        {/* Right: stacked block — socials/contact on top, buttons/search below */}
        <div className="flex flex-col items-start lg:items-end gap-2.5 w-full lg:w-auto">
         

          {/* Row 2: login buttons + search */}
          <div className="flex flex-col items-center gap-3 flex-wrap w-full lg:w-auto">
            <div className='flex gap-3'>
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
    </header>
  );
}