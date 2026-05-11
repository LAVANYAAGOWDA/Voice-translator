import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { TranslatorApp } from './components/TranslatorApp';
import { AboutSection } from './components/AboutSection';
import { motion } from 'framer-motion';

function App() {
  return (
    <div className="min-h-screen font-sans selection:bg-blue-200 dark:selection:bg-blue-900/50">
      {/* Background decoration */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-blue-900/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 dark:bg-indigo-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-purple-400/20 dark:bg-purple-900/20 blur-[120px]" />
      </div>

      <Header />

      <main className="px-4 py-8 md:py-12">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight"
          >
            Translate Any Language <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Instantly & Accurately
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-400"
          >
            Break down language barriers with our next-generation AI translation engine. Supports text, voice, and 20+ languages.
          </motion.p>
        </div>

        <TranslatorApp />
        
        <AboutSection />
      </main>

      <footer className="w-full border-t border-gray-200 dark:border-gray-800 py-8 text-center text-gray-500 dark:text-gray-400 mt-12">
        <p>© {new Date().getFullYear()} LingoAI. All rights reserved.</p>
        <p className="text-sm mt-2">Built with React, Vite, and Tailwind CSS.</p>
      </footer>

      <Toaster 
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
        }} 
      />
    </div>
  );
}

export default App;
