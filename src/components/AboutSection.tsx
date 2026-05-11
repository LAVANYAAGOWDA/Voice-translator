import { ShieldCheck, Zap, Globe, Languages } from 'lucide-react';

export const AboutSection = () => {
  const features = [
    {
      icon: <Globe className="text-blue-500" size={24} />,
      title: "Global Reach",
      desc: "Translate between 20+ major languages including English, Kannada, Hindi, Tamil, Telugu, Malayalam, Marathi, Bengali, and more."
    },
    {
      icon: <Zap className="text-yellow-500" size={24} />,
      title: "Lightning Fast",
      desc: "Experience near-instant translations powered by high-performance APIs without compromising quality."
    },
    {
      icon: <Languages className="text-indigo-500" size={24} />,
      title: "Text & Voice",
      desc: "Integrated Text-to-Speech and Speech-to-Text capabilities for seamless communication."
    },
    {
      icon: <ShieldCheck className="text-green-500" size={24} />,
      title: "Private & Secure",
      desc: "Your translation history is saved locally on your device, ensuring maximum privacy."
    }
  ];

  return (
    <section className="w-full max-w-5xl mx-auto mt-24 mb-16 px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose LingoAI?</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Built for the modern web, our translation platform breaks down language barriers with cutting-edge technology and an intuitive, beautiful interface.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <div key={i} className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-4">
              {f.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{f.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
