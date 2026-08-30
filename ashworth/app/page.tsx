import Hero from '@/components/Hero';
import ClubCards from '@/components/ClubCards';
import AboutClub from '@/components/AboutClub';
import PathToMembership from '@/components/PathToMembership';
import Collaborations from '@/components/Collaborations';
import EventsEntertainment from '@/components/EventsEntertainment';
import Marketplace from '@/components/Marketplace';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Hero />
      <ClubCards />
      {/* <AboutClub /> */}
      {/* <PathToMembership /> */}
      <Collaborations />
      <EventsEntertainment />
      <Marketplace />
      <Footer />
    </main>
  );
}
