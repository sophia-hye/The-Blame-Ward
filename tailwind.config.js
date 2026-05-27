/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'text-red-300', 'bg-red-950/50', 'border-red-600', 'bg-red-700',
    'text-blue-300', 'bg-blue-950/50', 'border-blue-500', 'bg-blue-600',
    'text-gray-300', 'bg-gray-800/60', 'border-gray-500', 'bg-gray-600',
    'text-emerald-300', 'bg-emerald-950/50', 'border-emerald-600', 'bg-emerald-700',
    'text-orange-300', 'bg-orange-950/50', 'border-orange-600', 'bg-orange-700',
    'text-purple-300', 'bg-purple-950/50', 'border-purple-600', 'bg-purple-700',
    'text-pink-300', 'bg-pink-950/50', 'border-pink-600', 'bg-pink-700',
    'text-cyan-300', 'bg-cyan-950/50', 'border-cyan-600', 'bg-cyan-700',
    'text-yellow-200', 'bg-yellow-950/40', 'border-yellow-500', 'bg-yellow-600',
    'text-yellow-300', 'bg-yellow-950/50', 'border-yellow-600', 'bg-yellow-700',
    'text-stone-400', 'bg-stone-900/70', 'border-stone-600', 'bg-stone-700',
  ],
};
