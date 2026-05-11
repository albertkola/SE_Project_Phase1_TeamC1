import { Link } from 'react-router-dom';
import { Search, CalendarCheck, Car } from 'lucide-react';
import Navbar from '../components/common/Navbar';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Navbar />

      <section className="min-h-screen flex flex-col items-center justify-center px-grid-3 pt-16">
        <div className="max-w-3xl w-full text-center">
          <h1 className="text-white font-extrabold tracking-tight text-[40px] md:text-[56px] leading-[1.1] mb-grid-2">
            Your ride across Albania
          </h1>
          <p className="text-text-secondary text-body md:text-h3 mb-grid-5">
            Find affordable intercity trips in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-grid-2 justify-center">
            <Link
              to="/register"
              className="bg-white text-black font-bold h-12 px-grid-4 inline-flex items-center justify-center rounded-[2px] hover:bg-[#EAEAEA] transition-colors"
            >
              Find a Ride
            </Link>
            <Link
              to="/register"
              className="bg-transparent text-white font-bold h-12 px-grid-4 inline-flex items-center justify-center rounded-[2px] border border-white hover:bg-[#1C1C1C] transition-colors"
            >
              Offer a Ride
            </Link>
          </div>
        </div>
      </section>

      <section className="px-grid-3 py-grid-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-h2 text-center mb-grid-5">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-grid-3">
            {[
              { Icon: Search, title: 'Search', desc: 'Pick your route and travel date.' },
              { Icon: CalendarCheck, title: 'Book', desc: 'Reserve your seat instantly.' },
              { Icon: Car, title: 'Ride', desc: 'Meet at the pickup point and go.' },
            ].map(({ Icon, title, desc }, i) => (
              <div
                key={title}
                className="bg-surface border border-border p-grid-4 rounded-[2px] flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 border border-border flex items-center justify-center mb-grid-2 rounded-[2px]">
                  <Icon size={24} color="#FFFFFF" strokeWidth={1.5} />
                </div>
                <div className="text-text-secondary text-small mb-1">Step {i + 1}</div>
                <div className="text-h3 mb-1">{title}</div>
                <div className="text-text-secondary text-body">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-grid-3 px-grid-3 text-center text-small text-text-secondary">
        © {new Date().getFullYear()} Hop In · Software Engineering · Team C1
      </footer>
    </div>
  );
}
