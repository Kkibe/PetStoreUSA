import { ShoppingCartOutlined, StarFilled } from '@ant-design/icons';
import { Button, Rate, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { message } from 'antd';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);

  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (!session) { message.info('Please sign in to add items to your cart.'); return; }
    setLoading(true);
    try {
      await addToCart(product.id, 1);
      message.success(`${product.name} added to cart!`);
    } catch (err) {
      message.error(err.message || 'Could not add to cart.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="productCard" onClick={() => navigate(`/product/${product.slug}`)}>
      <div style={{ position: 'relative' }}>
        {discount > 0 && <div className="discountBadge">{discount}% Off</div>}
        }
        {product.featured && <div className="featuredBadge">Featured</div>}
        }
        <img className="productCardImage" src={product.image_url} alt={product.name} />
      </div>
      <div className="productCardBody">
        <div className="productCardTitle">{product.name}</div>
        <div className="productCardDesc">{product.description}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Rate disabled allowHalf value={product.rating} style={{ fontSize: 13 }} />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>({product.reviews_count})</Typography.Text>
        </div>
        <div className="productCardPrice">
          <span className="price">${Number(product.price).toFixed(2)}</span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="comparePrice">${Number(product.compare_at_price).toFixed(2)}</span>
          )}
        </div>
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          loading={loading}
          onClick={handleAdd}
          block
          style={{ marginTop: 8 }}
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
