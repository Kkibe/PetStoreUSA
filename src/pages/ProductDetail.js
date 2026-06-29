import { ShoppingCartOutlined, SafetyCertificateOutlined, CarryOutOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { Button, Col, InputNumber, Rate, Row, Spin, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { session } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('products').select('*, categories(*)').eq('slug', slug).maybeSingle();
      setProduct(data);
      if (data?.category_id) {
        const { data: rel } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', data.category_id)
          .neq('id', data.id)
          .limit(4);
        setRelated(rel || []);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div style={{ textAlign: 'center', padding: 120 }}><Spin size="large" /></div>;
  if (!product) return <div style={{ textAlign: 'center', padding: 120 }}><Typography.Title level={3}>Product not found</Typography.Title></div>;

  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const gallery = (product.gallery && product.gallery.length > 0) ? product.gallery : [product.image_url];

  const handleAdd = async () => {
    if (!session) { message.info('Please sign in to add items to your cart.'); return; }
    setAdding(true);
    try {
      await addToCart(product.id, qty);
      message.success(`${product.name} added to cart!`);
    } catch (err) {
      message.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="section" style={{ paddingTop: 40 }}>
      <Row gutter={[48, 32]}>
        <Col xs={24} md={10}>
          <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #E8EDE9', background: '#F4F7F5' }}>
            <img src={gallery[activeImage]} alt={product.name} style={{ width: '100%', height: 420, objectFit: 'cover' }} />
          </div>
          {gallery.length > 1 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              {gallery.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${product.name} ${i}`}
                  onClick={() => setActiveImage(i)}
                  style={{
                    width: 70, height: 70, objectFit: 'cover', borderRadius: 8, cursor: 'pointer',
                    border: activeImage === i ? '2px solid #2D6A4F' : '1px solid #E8EDE9',
                  }}
                />
              ))}
            </div>
          )}
        </Col>
        <Col xs={24} md={14}>
          {product.featured && <Tag color="#D4A373" style={{ marginBottom: 12 }}>Featured</Tag>}
          }
          {product.categories && <Tag style={{ marginBottom: 12 }}>{product.categories.name}</Tag>}
          }
          <Typography.Title level={2} style={{ fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>
            {product.name}
          </Typography.Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Rate disabled allowHalf value={product.rating} />
            <Typography.Text type="secondary">({product.reviews_count} reviews)</Typography.Text>
          </div>
          <Typography.Paragraph style={{ fontSize: 16, lineHeight: 1.7, color: '#5A6B62', marginBottom: 24 }}>
            {product.description}
          </Typography.Paragraph>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
            <Typography.Title level={2} style={{ color: '#1B4332', margin: 0 }}>
              ${Number(product.price).toFixed(2)}
            </Typography.Title>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <Typography.Text delete type="secondary" style={{ fontSize: 18 }}>
                ${Number(product.compare_at_price).toFixed(2)}
              </Typography.Text>
            )}
            {discount > 0 && <Tag color="error">{discount}% OFF</Tag>}
            }
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <Typography.Text>Quantity:</Typography.Text>
            <InputNumber min={1} max={product.stock} value={qty} onChange={setQty} size="large" />
            <Typography.Text type={product.stock > 0 ? 'success' : 'danger'}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </Typography.Text>
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
            <Button type="primary" size="large" icon={<ShoppingCartOutlined />} loading={adding} onClick={handleAdd}>
              Add to Cart
            </Button>
            <Button size="large" onClick={() => { handleAdd(); navigate('/cart'); }}>Buy Now</Button>
            <Button
              size="large"
              icon={isFavorite(product.id) ? <HeartFilled style={{ color: '#E63946' }} /> : <HeartOutlined />}
              onClick={async () => {
                if (!session) { message.info('Please sign in to save pets.'); return; }
                try { await toggleFavorite(product.id); } catch (e) { message.error(e.message); }
              }}
            >
              {isFavorite(product.id) ? 'Saved' : 'Save'}
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            <Col span={8}><div style={{ textAlign: 'center' }}><SafetyCertificateOutlined style={{ fontSize: 24, color: '#2D6A4F' }} /><p style={{ fontSize: 13, marginTop: 6, color: '#5A6B62' }}>Health Guaranteed</p></div></Col>
            <Col span={8}><div style={{ textAlign: 'center' }}><CarryOutOutlined style={{ fontSize: 24, color: '#2D6A4F' }} /><p style={{ fontSize: 13, marginTop: 6, color: '#5A6B62' }}>Safe Delivery</p></div></Col>
            <Col span={8}><div style={{ textAlign: 'center' }}><HeartOutlined style={{ fontSize: 24, color: '#2D6A4F' }} /><p style={{ fontSize: 13, marginTop: 6, color: '#5A6B62' }}>Loved & Cared</p></div></Col>
          </Row>
        </Col>
      </Row>

      {related.length > 0 && (
        <div style={{ marginTop: 64 }}>
          <h2 className="sectionTitle" style={{ fontSize: 28 }}>You May Also Like</h2>
          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            {related.map((p) => (
              <Col key={p.id} xs={24} sm={12} md={6}><ProductCard product={p} /></Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
}
