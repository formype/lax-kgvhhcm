import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Timeline from '../components/Timeline';
import Gallery from '../components/Gallery';
import References from '../components/References';
import Footer from '../components/Footer';

function Home() {
  return (
    <div className="app">
      {/* Global Fixed Background */}
      <div className="global-graphics">
        <div className="symbol symbol-party">☭</div>
        <div className="symbol symbol-nation">★</div>
        <div className="global-overlay"></div>
      </div>

      <Navbar />
      <main>
        <Hero />
        <Timeline />
        <Gallery />
        <References />
      </main>
      <Footer />
    </div>
  );
}

export default Home;
