import { useState } from 'react';
import About from './components/About';
import Features from './components/FeaturesSection';
import FeaturesShowcase from './components/FeaturesShowcase';
import Footer from './components/Footer';
import { Header } from './components/Header';
import Hero from './components/Hero';
import VeritasStart from './components/VeritasStart';

function App() {
  const [activeDemo, setActiveDemo] = useState(false);
  const openDemo = (mode = 'Multi-Modal Scan') => {
    setActiveDemo(true);
    setTimeout(() => {
      document.getElementById('diagnostics-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="bg-zinc-950 text-gray-100 min-h-screen selection:bg-red-500/30">
      <Header onGetStarted={openDemo} />
      <main>
        <Hero onGetStarted={openDemo} />
        {activeDemo && (
          <VeritasStart onBack={() => {
            setActiveDemo(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} />
        )}
        <FeaturesShowcase />
        <Features />
        <About />
      </main>
      <Footer onGetStarted={openDemo} />
    </div>
  );
}
export default App;
