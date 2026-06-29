import { Select, Typography, Col, Row, Input, Empty, Spin, Tag } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const { categoryId } = useParams();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('featured');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(categoryId || 'all');

  useEffect(() => {
    (async () => {
      const [{ data: prods }, { data: cats }] = await Promise.all([
        supabase.from('products').select('*, categories(slug,name)').order('created_at'),
        supabase.from('categories').select('*').order('name'),
      ]);
      setItems(prods || []);
      setCategories(cats || []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (categoryId) setActiveCategory(categoryId);
  }, [categoryId]);

  const filtered = useMemo(() => {
    let result = [...items];
    if (activeCategory && activeCategory !== 'all') {
      result = result.filter((p) => p.categories?.slug === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)
      );
    }
    switch (sortOrder) {
      case 'az': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'za': result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'lowHigh': result.sort((a, b) => a.price - b.price); break;
      case 'highLow': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'featured': result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
      default: break;
    }
    return result;
  }, [items, activeCategory, search, sortOrder]);

  const currentCat = categories.find((c) => c.slug === activeCategory);

  return (
    <div className="section" style={{ paddingTop: 40 }}>
      <div className="eyebrow">{currentCat ? currentCat.name : 'Our Collection'}</div>
      <h2 className="sectionTitle">{currentCat ? currentCat.name : 'All Pets & Supplies'}</h2>
      <p className="sectionSubtitle">
        {currentCat?.description || 'Browse our full collection of healthy, happy companions and quality supplies.'}
      </p>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32, justifyContent: 'center' }}>
        <Input.Search
          placeholder="Search pets or supplies..."
          allowClear
          style={{ maxWidth: 320 }}
          size="large"
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          size="large"
          value={activeCategory}
          onChange={setActiveCategory}
          style={{ minWidth: 160 }}
          options={[{ label: 'All Categories', value: 'all' }, ...categories.map((c) => ({ label: c.name, value: c.slug }))]}
        />
        <Select
          size="large"
          value={sortOrder}
          onChange={setSortOrder}
          style={{ minWidth: 180 }}
          options={[
            { label: 'Featured', value: 'featured' },
            { label: 'Alphabetically A-Z', value: 'az' },
            { label: 'Alphabetically Z-A', value: 'za' },
            { label: 'Price: Low to High', value: 'lowHigh' },
            { label: 'Price: High to Low', value: 'highLow' },
            { label: 'Top Rated', value: 'rating' },
          ]}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
      ) : filtered.length === 0 ? (
        <Empty description="No products found." style={{ padding: 80 }} />
      ) : (
        <Row gutter={[24, 24]}>
          {filtered.map((p) => (
            <Col key={p.id} xs={24} sm={12} md={8} lg={6}>
              <ProductCard product={p} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
