import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#030508] mt-20 py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img src="/logo.png" alt="MTGCheap Logo" className="h-10 w-auto object-contain" />
            </Link>
            <p className="text-xs text-[#8b949e] leading-relaxed max-w-sm">
              Find budget alternatives for Magic: The Gathering &amp; Commander decks.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-white font-mono uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-1.5 text-[#8b949e]">
              <li><Link href="/" className="hover:text-amber-400 transition-colors">Swap Engine</Link></li>
              <li><Link href="/deck-budgetizer" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5">Deck Budgetizer <span className="px-1.5 py-0.5 text-[9px] font-extrabold font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md">BETA</span></Link></li>
              <li><Link href="/articles" className="hover:text-amber-400 transition-colors">Articles &amp; Strategy</Link></li>
            </ul>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-white font-mono uppercase tracking-wider">Popular Guides</h4>
            <ul className="space-y-1.5 text-[#8b949e]">
              <li><Link href="/articles/budget-options-for-rhystic-study" className="hover:text-amber-400 transition-colors">Rhystic Study Budget Alternatives</Link></li>
              <li><Link href="/articles/budget-options-for-the-one-ring" className="hover:text-amber-400 transition-colors">The One Ring Budget Alternatives</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 text-[11px] text-[#8b949e] space-y-2 leading-relaxed">
          <p>
            MTGCheap is unofficial Fan Content permitted under the Wizards of the Coast Fan Content Policy. Portions of the materials used are property of Wizards of the Coast. © Wizards of the Coast LLC. Magic: The Gathering is a registered trademark of Wizards of the Coast. Card imagery provided by Scryfall.
          </p>
          <p className="text-[#6e7681]">
            © 2026 MTGCheap. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
