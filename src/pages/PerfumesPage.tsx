import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Star, Sparkles, Filter } from 'lucide-react';
import type { Product } from '../types/index.ts';
import { ProductCard } from '../components/ProductCard.tsx';

interface PerfumesPageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onPromptLogin: () => void;
}

export const PerfumesPage: React.FC<PerfumesPageProps> = ({
  products,
  onSelectProduct,
  onPromptLogin,
}) => {
  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('featured');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(25000);

  const fragranceFamilies = [
    { id: 'all', label: 'All Fragrances' },
    { id: 'Oriental', label: 'Oriental & Amber' },
    { id: 'Floral', label: 'Floral Bouquet' },
    { id: 'Gourmand', label: 'Gourmand Vanilla' },
    { id: 'Fresh', label: 'Fresh & Aquatic' },
    { id: 'Woody', label: 'Woody & Musky' },
    { id: 'Citrus', label: 'Citrus & Solar' },
  ];

  const perfumeProducts = useMemo(() => {
    return products.filter((p) => p.category === 'perfumes' && !p.isDraft);
  }, [products]);

  const filteredPerfumes = useMemo(() => {
    return perfumeProducts
      .filter((p) => {
        const matchesFamily =
          selectedFamily === 'all' || p.fragranceFamily?.toLowerCase() === selectedFamily.toLowerCase();
        const matchesQuery =
          !searchQuery.trim() ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.fragranceNotes?.top.some((n) => n.toLowerCase().includes(searchQuery.toLowerCase())) ||
          p.fragranceNotes?.heart.some((n) => n.toLowerCase().includes(searchQuery.toLowerCase())) ||
          p.fragranceNotes?.base.some((n) => n.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesPrice = p.price <= maxPrice;

        const matchesSize =
          selectedSize === 'all' ||
          (p.sizeVariants && p.sizeVariants.some((v) => v.size.includes(selectedSize)));

        return matchesFamily && matchesQuery && matchesPrice && matchesSize;
      })
      .sort((a, b) => {
        if (sortOption === 'price-asc') return a.price - b.price;
        if (sortOption === 'price-desc') return b.price - a.price;
        if (sortOption === 'rating') return b.rating - a.rating;
        return 0;
      });
  }, [perfumeProducts, selectedFamily, selectedSize, sortOption, searchQuery, maxPrice]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A15B]">
          Sillage & Distinction
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#59172F]">
          Fine Fragrance Collection
        </h1>
        <p className="text-xs sm:text-sm text-[#5D5560] leading-relaxed">
          Curated Eau de Parfum and Extrait flacons with rich, persistent sillage that lasts all day. Explore our diverse olfactory families, from smoked Cambodian oud to sunlit citrus and velvety roses.
        </p>
      </div>

      {/* Fragrance Family Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto sm:flex-wrap sm:justify-center p-2 bg-[#FFF9F2] border border-[#E8DCDE] rounded-2xl max-w-4xl mx-auto scrollbar-none">
        {fragranceFamilies.map((fam) => {
          const isActive = selectedFamily.toLowerCase() === fam.id.toLowerCase();
          return (
            <button
              key={fam.id}
              onClick={() => setSelectedFamily(fam.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#59172F] text-[#FFF9F2] shadow-xs font-semibold'
                  : 'text-[#29232B] hover:bg-white hover:text-[#59172F]'
              }`}
            >
              {fam.label}
            </button>
          );
        })}
      </div>

      {/* Control Bar: Search, Size, Price & Sort */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DCDE] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#736B76] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes (oud, rose, vanilla)..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#29232B] focus:outline-none focus:border-[#C9A15B]"
          />
        </div>

        {/* Filter items */}
        <div className="flex items-center flex-wrap gap-3 w-full md:w-auto justify-end">
          {/* Size Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#736B76] hidden sm:inline">Size:</span>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#29232B] focus:outline-none"
            >
              <option value="all">All Sizes</option>
              <option value="30ml">30ml Travel</option>
              <option value="50ml">50ml Standard</option>
              <option value="100ml">100ml Luxury</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#736B76] hidden sm:inline">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#29232B] focus:outline-none"
            >
              <option value="featured">Featured Scents</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredPerfumes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E8DCDE] p-8 space-y-3">
          <p className="font-serif text-lg text-[#59172F]">No perfumes match your current filters</p>
          <p className="text-xs text-[#736B76]">Try resetting your search query or selecting &ldquo;All Fragrances&rdquo;.</p>
          <button
            onClick={() => {
              setSelectedFamily('all');
              setSelectedSize('all');
              setSearchQuery('');
            }}
            className="mt-2 px-4 py-2 bg-[#59172F] text-white text-xs font-semibold rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPerfumes.map((perfume) => (
            <ProductCard
              key={perfume.id}
              product={perfume}
              onSelect={onSelectProduct}
              onPromptLogin={onPromptLogin}
            />
          ))}
        </div>
      )}
    </div>
  );
};
