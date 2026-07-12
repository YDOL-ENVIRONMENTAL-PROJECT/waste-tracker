export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white/50 text-center py-3 text-gray-400 text-xs flex items-center justify-center gap-1">
      <span>© {new Date().getFullYear()}</span>
      <span className="text-green-600 font-semibold">Waste Tracker</span>
      <span>— Tous droits réservés</span>
    </footer>
  );
}