import { SafetyCertificateOutlined, CarryOutOutlined, HeartOutlined, StarFilled, ArrowRightOutlined } from '@ant-design/icons';
import { Button, Col, Row, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import ProductCard from '../components/ProductCard';
import Image from '../assets/p1.png';

export default function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: feat }, { data: cats }] = await Promise.all([
        supabase.from('products').select('*').eq('featured', true).limit(8),
        supabase.from('categories').select('*').order('name'),
      ]);
      setFeatured(feat || []);
      setCategories(cats || []);
      setLoading(false);
    })();
  }, []);

  const testimonials = [
    { name: 'Sarah M.', pet: 'Adopted a Golden Retriever', text: 'The process was seamless and our puppy arrived healthy and happy. PetNest made our family complete.', rating: 5 },
    { name: 'James L.', pet: 'Adopted a Persian Kitten', text: 'Beautiful, well-cared-for pets and excellent customer service. Highly recommend to any pet lover.', rating: 5 },
    { name: 'Priya K.', pet: 'Bought an Aquarium Kit', text: 'The starter kit had everything I needed. My fish are thriving and the support team is wonderful.', rating: 4 },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <div className="heroContent">
          <div className="eyebrow" style={{ color: '#B7E4C7' }}>Find Your Forever Friend</div>
          <h1>Where Every Pet Finds a Home</h1>
          <p>Health-checked, vaccinated, and loved. Browse our curated collection of pets and supplies,
            and welcome a new member to your family today.</p>
          <div className="heroActions">
            <Button type="primary" size="large" onClick={() => navigate('/store')} icon={<ArrowRightOutlined />}>
              Shop Now
            </Button>
            <Button size="large" ghost onClick={() => navigate('/category/dogs')} style={{ borderColor: '#fff', color: '#fff' }}>
              Browse Dogs
            </Button>
          </div>
        </div>
      </div>

      {/* Feature strip */}
      <div className="featureStrip">
        <div className="featureStripInner">
          <div className="featureItem">
            <SafetyCertificateOutlined className="featureIcon" />
            <h4>Health Guaranteed</h4>
            <p>Every pet is vet-checked and vaccinated before adoption.</p>
          </div>
          <div className="featureItem">
            <CarryOutOutlined className="featureIcon" />
            <h4>Safe Home Delivery</h4>
            <p>Comfortable, stress-free transport to your doorstep.</p>
          </div>
          <div className="featureItem">
            <HeartOutlined className="featureIcon" />
            <h4>Loved & Cared For</h4>
            <p>Raised with love by experienced, certified breeders.</p>
          </div>
          <div className="featureItem">
            <StarFilled className="featureIcon" />
            <h4>4.8/5 Rating</h4>
            <p>Trusted by thousands of happy pet parents nationwide.</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="section">
        <div className="eyebrow">Explore</div>
        <h2 className="sectionTitle">Shop by Category</h2>
        <p className="sectionSubtitle">From playful pups to colorful companions — find your match.</p>
        <div className="categoryGrid">
          {categories.map((cat) => (
            <div key={cat.id} className="categoryCard" onClick={() => navigate(`/category/${cat.slug}`)}>
              <img src={cat.image_url} alt={cat.name} />
              <div className="overlay"><h3>{cat.name}</h3></div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured products */}
      <div className="section sectionNarrow" style={{ paddingTop: 0 }}>
        <div className="eyebrow">Handpicked for you</div>
        <h2 className="sectionTitle">Featured Pets & Supplies</h2>
        <p className="sectionSubtitle">Our most loved companions and essentials, chosen by our team.</p>
        <Row gutter={[24, 24]}>
          {(loading ? Array.from({ length: 8 }) : featured).map((p, i) => (
            <Col key={p?.id || i} xs={24} sm={12} md={8} lg={6}>
              {p ? <ProductCard product={p} /> : <div className="productCard" style={{ minHeight: 360 }} />}
            </Col>
          ))}
        </Row>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Button size="large" onClick={() => navigate('/store')} type="primary" ghost>
            View All Products
          </Button>
        </div>
      </div>

      {/* Testimonials */}
      <div className="section" style={{ background: '#F4F7F5' }}>
        <div className="eyebrow">Loved by families</div>
        <h2 className="sectionTitle">Happy Pet Parents</h2>
        <p className="sectionSubtitle">Real stories from real families who found their companion.</p>
        <Row gutter={[24, 24]}>
          {testimonials.map((t, i) => (
            <Col key={i} xs={24} md={8}>
              <div className="testimonialCard">
                <div style={{ marginBottom: 12 }}>
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <StarFilled key={j} style={{ color: '#D4A373' }} />
                  ))}
                </div>
                <p className="quote">"{t.text}"</p>
                <div className="author">
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#2D6A4F', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <Typography.Text strong>{t.name}</Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: 13 }}>{t.pet}</Typography.Text>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
