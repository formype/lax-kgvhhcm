import React from 'react';
import Ambient3DBackground from '../components/Ambient3DBackground';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Timeline from '../components/Timeline';
import Gallery from '../components/Gallery';
import References from '../components/References';
import Footer from '../components/Footer';

function Home() {
  return (
    <div className="app">
      {/* Nền không gian 3D chiều sâu + ánh sáng Bảo tàng */}
      <div className="global-graphics" aria-hidden="true">
        <div className="global-spotlight-top"></div>
        <div className="global-vignette"></div>
      </div>
      <Ambient3DBackground />

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
