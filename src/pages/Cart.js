import { DeleteOutlined, ShoppingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Col, Empty, InputNumber, Row, Spin, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, loading, cartTotal, updateQuantity, removeFromCart, clearCart, fetchCart } = useCart();
  const { session } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    supabase.from('addresses').select('*').eq('user_id', session.user.id).order('is_default', { ascending: false })
      .then(({ data }) => {
        setAddresses(data || []);
        setSelectedAddress(data?.find((a) => a.is_default)?.id || data?.[0]?.id || null);
      });
  }, [session?.user]);

  const handleCheckout = async () => {
    if (!session) { message.info('Please sign in to checkout.'); return; }
    if (cartItems.length === 0) { message.warning('Your cart is empty.'); return; }
    if (!selectedAddress) { message.warning('Please add a shipping address in your profile first.'); return; }
    setPlacing(true);
    try {
      const addr = addresses.find((a) => a.id === selectedAddress);
      const { data: order, error: orderErr } = await supabase.from('orders').insert({
        total: cartTotal,
        status: 'pending',
        address_snapshot: addr,
      }).select().maybeSingle();
      if (orderErr) throw orderErr;
      const lineItems = cartItems.map((c) => ({
        order_id: order.id,
        product_id: c.product_id,
        product_name: c.product.name,
        unit_price: c.product.price,
        quantity: c.quantity,
        line_total: c.product.price * c.quantity,
      }));
      const { error: itemsErr } = await supabase.from('order_items').insert(lineItems);
      if (itemsErr) throw itemsErr;
      await supabase.from('notifications').insert({
        title: 'Order Placed Successfully',
        body: `Your order of ${cartItems.length} item(s) totaling $${cartTotal.toFixed(2)} has been received. We will contact you shortly.`,
        type: 'order',
      });
      await clearCart();
      message.success('Order placed successfully!');
      navigate('/profile?tab=orders');
    } catch (err) {
      message.error(err.message || 'Checkout failed.');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 120 }}><Spin /></div>;
  if (!session) {
    return <div className="section" style={{ textAlign: 'center', paddingTop: 60 }}>
      <Typography.Title level={3}>Please sign in to view your cart</Typography.Title>
      <Button type="primary" size="large" onClick={() => navigate('/')} style={{ marginTop: 16 }}>Go Home</Button>
    </div>;
  }
  if (cartItems.length === 0) {
    return <div className="section" style={{ textAlign: 'center', paddingTop: 60 }}>
      <Empty description="Your cart is empty" />
      <Button type="primary" size="large" icon={<ShoppingOutlined />} onClick={() => navigate('/store')} style={{ marginTop: 24 }}>
        Start Shopping
      </Button>
    </div>;
  }

  return (
    <div className="section" style={{ paddingTop: 40 }}>
      <div className="eyebrow">Your Selection</div>
      <h2 className="sectionTitle">Shopping Cart</h2>
      <p className="sectionSubtitle">{cartItems.length} item(s) ready for checkout</p>

      <Row gutter={[32, 24]}>
        <Col xs={24} md={16}>
          {cartItems.map((item) => (
            <div key={item.id} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid #E8EDE9' }}>
              <img src={item.product?.image_url} alt={item.product?.name} style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10 }} />
              <div style={{ flex: 1 }}>
                <Typography.Text strong style={{ fontSize: 16 }}>{item.product?.name}</Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 8 }}>
                  ${Number(item.product?.price || 0).toFixed(2)} each
                </Typography.Paragraph>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <InputNumber min={1} max={item.product?.stock || 99} value={item.quantity}
                    onChange={(v) => updateQuantity(item.id, v)} size="small" />
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeFromCart(item.id)} size="small" />
                </div>
              </div>
              <Typography.Text strong style={{ fontSize: 16, color: '#1B4332' }}>
                ${(Number(item.product?.price || 0) * item.quantity).toFixed(2)}
              </Typography.Text>
            </div>
          ))}
          <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/store')} style={{ marginTop: 16, paddingLeft: 0 }}>
            Continue Shopping
          </Button>
        </Col>
        <Col xs={24} md={8}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, border: '1px solid #E8EDE9' }}>
            <Typography.Title level={4} style={{ marginBottom: 20 }}>Order Summary</Typography.Title>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <Typography.Text type="secondary">Subtotal</Typography.Text>
              <Typography.Text>${cartTotal.toFixed(2)}</Typography.Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <Typography.Text type="secondary">Delivery</Typography.Text>
              <Typography.Text style={{ color: '#2D6A4F' }}>Free</Typography.Text>
            </div>
            <div style={{ borderTop: '1px solid #E8EDE9', margin: '12px 0', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
              <Typography.Text strong style={{ fontSize: 18 }}>Total</Typography.Text>
              <Typography.Text strong style={{ fontSize: 18, color: '#1B4332' }}>${cartTotal.toFixed(2)}</Typography.Text>
            </div>
            {addresses.length > 0 ? (
              <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 16 }}>
                Shipping to: {addresses.find((a) => a.id === selectedAddress)?.line1}, {addresses.find((a) => a.id === selectedAddress)?.city}
              </Typography.Paragraph>
            ) : (
              <Typography.Paragraph type="warning" style={{ fontSize: 13, marginBottom: 16 }}>
                No shipping address found. Add one in your profile.
              </Typography.Paragraph>
            )}
            <Button type="primary" size="large" block loading={placing} onClick={handleCheckout} disabled={addresses.length === 0}>
              Place Order
            </Button>
            <Typography.Paragraph type="secondary" style={{ fontSize: 12, textAlign: 'center', marginTop: 12 }}>
              Cash on Delivery available
            </Typography.Paragraph>
          </div>
        </Col>
      </Row>
    </div>
  );
}
