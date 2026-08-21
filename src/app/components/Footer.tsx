import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#030508] mt-20 py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          <div className="space-y-3 sm:col-span-2">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img src="/logo.png" alt="MTGCheap Logo" className="h-10 w-auto object-contain" />
            </Link>
            <p className="text-xs text-[#8b949e] leading-relaxed max-w-sm">
              The ultimate budget MTG &amp; Commander discovery platform. Find vector-matched functional replacements, build budget mana bases, and explore top cheap staples.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-white font-mono uppercase tracking-wider">Commander Hubs</h4>
            <ul className="space-y-1.5 text-[#8b949e]">
              <li><Link href="/budget-commander" className="hover:text-amber-400 transition-colors font-semibold text-white">Strategy Overview</Link></li>
              <li><Link href="/budget-commander/staples" className="hover:text-amber-400 transition-colors">Staples by Color</Link></li>
              <li><Link href="/budget-commander/mana-base" className="hover:text-amber-400 transition-colors">Mana Base Calculator</Link></li>
              <li><Link href="/budget-commander/deck-building" className="hover:text-amber-400 transition-colors">Deckbuilding Guide</Link></li>
              <li><Link href="/budget-commander/cards-under-1-dollar" className="hover:text-amber-400 transition-colors">Cards Under $1.00</Link></li>
            </ul>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-white font-mono uppercase tracking-wider">Functional Roles</h4>
            <ul className="space-y-1.5 text-[#8b949e]">
              <li><Link href="/budget-commander/card-draw" className="hover:text-amber-400 transition-colors">Budget Card Draw</Link></li>
              <li><Link href="/budget-commander/ramp" className="hover:text-amber-400 transition-colors">Budget Ramp &amp; Rocks</Link></li>
              <li><Link href="/budget-commander/removal" className="hover:text-amber-400 transition-colors">Budget Removal</Link></li>
              <li><Link href="/budget-commander/board-wipes" className="hover:text-amber-400 transition-colors">Budget Board Wipes</Link></li>
              <li><Link href="/budget-commander/protection" className="hover:text-amber-400 transition-colors">Budget Protection</Link></li>
              <li><Link href="/budget-commander/dual-lands" className="hover:text-amber-400 transition-colors">Cheap Dual Lands</Link></li>
            </ul>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-white font-mono uppercase tracking-wider">Tools &amp; Articles</h4>
            <ul className="space-y-1.5 text-[#8b949e]">
              <li><Link href="/" className="hover:text-amber-400 transition-colors">Swap Engine</Link></li>
              <li><Link href="/deck-budgetizer" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5">Deck Budgetizer <span className="px-1.5 py-0.5 text-[9px] font-extrabold font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md">BETA</span></Link></li>
              <li><Link href="/articles" className="hover:text-amber-400 transition-colors">1,500+ Card Guides</Link></li>
              <li><Link href="/budget-commander/alternatives" className="hover:text-amber-400 transition-colors">Card Alternatives Guide</Link></li>
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
