import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import MenuHeader from '../components/MenuHeader';
import MenuContent from '../components/MenuContent';
import products from '../data/products.json';

function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('default');

  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category))];
  }, []);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');

    if (categoryParam) {
      const matchedCategory = categories.find(cat =>
        cat.toLowerCase().replace(/\s+/g, '-').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g') === categoryParam
      );
      if (matchedCategory)
        setActiveCategory(matchedCategory);
    } else {
      setActiveCategory('all');
    }

    setSearchQuery(searchParam || '');
  }, [searchParams, categories]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);

    if (category === 'all') {
      searchParams.delete('category');
    } else {
      const categoryId = category.toLowerCase().replace(/\s+/g, '-').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g');
      searchParams.set('category', categoryId);
    }
    setSearchParams(searchParams);
  };

  const handleReset = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setSortOrder('default');
    setSearchParams({});
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory !== 'all') {
      result = result.filter(p => p.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    if (sortOrder === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [activeCategory, searchQuery, sortOrder]);

  return (
    <>
      {/* PAGE HEADER */}
      <MenuHeader
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        onReset={handleReset}
        resultCount={filteredProducts.length}
      />

      {/* PRODUCT LIST */}
      <MenuContent
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        sortOrder={sortOrder}
      />
    </>
  );
}

export default Menu;
