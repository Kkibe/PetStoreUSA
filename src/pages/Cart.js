import { DeleteOutlined, ShoppingOutlined, ArrowLeftOutlined, CreditCardOutlined, PlusOutlined, EnvironmentOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Empty, Form, Input, InputNumber, Modal, Radio, Row, Spin, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { usePayment, generateTxRef } from '../lib/payment';

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, loading, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { session } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [placing, setPlacing] = useState(false);
  const { pay } = usePayment();
  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);
  const [addrForm] = Form.useForm();
  const [paymentType, setPaymentType] = useState('full');

  const fetchAddresses = async () => {
    if (!session?.user) return;
    const { data } = await supabase.from('addresses').select('*').eq('user_id', session.user.id).order('is_default', { ascending: false });
    setAddresses(data || []);
    setSelectedAddress(data?.find((a) => a.is_default)?.id || data?.[0]?.id || null);
  };

  useEffect(() => { fetchAddresses(); }, [session?.user]);

  const amountDue = paymentType === 'deposit_50' ? cartTotal * 0.5 : cartTotal;

  const openAddAddr = () => {
    setEditingAddr(null);
    addrForm.resetFields();
    setAddrModalOpen(true);
  };

  const openEditAddr = (addr) => {
    setEditingAddr(addr);
    addrForm.setFieldsValue(addr);
    setAddrModalOpen(true);
  };

  const saveAddr = async (values) => {
    try {
      if (editingAddr) {
        const { error } = await supabase.from('addresses').update(values).eq('id', editingAddr.id);
        if (error) throw error;
        message.success('Address updated.');
      } else {
        const { data, error } = await supabase.from('addresses').insert(values).select().maybeSingle();
        if (error) throw error;
        if (values.is_default && data) {
          await supabase.from('addresses').update({ is_default: false }).eq('user_id', session.user.id).neq('id', data.id);
        }
        message.success('Address added.');
      }
      setAddrModalOpen(false);
      await fetchAddresses();
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleCheckout = async () => {
    if (!session) { message.info('Please sign in to checkout.'); return; }
    if (cartItems.length === 0) { message.warning('Your cart is empty.'); return; }
    if (!selectedAddress) { message.warning('Please add a billing/shipping address.'); return; }
    setPlacing(true);
    try {
      const addr = addresses.find((a) => a.id === selectedAddress);
      const txRef = generateTxRef();
      const { data: order, error: orderErr } = await supabase.from('orders').insert({
        total: cartTotal,
        status: 'awaiting_payment',
        progress: 'awaiting_payment',
        payment_type: paymentType,
        address_snapshot: addr,
        payment: { tx_ref: txRef, status: 'initiated', amount_due: amountDue },
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

      pay({
        amount: amountDue,
        customer: {
          email: session.user.email,
          name: addr.full_name,
          phone_number: addr.postal_code,
        },
        txRef,
        onVerified: async (result) => {
          const paid = result.status === 'verified';
          const newProgress = paid
            ? (paymentType === 'deposit_50' ? 'partially_paid' : 'processing')
            : 'awaiting_payment';
          await supabase.from('orders').update({
            status: paid ? 'paid' : 'payment_failed',
            progress: newProgress,
            payment: { ...result, payment_type: paymentType, amount_due: amountDue, order_total: cartTotal },
          }).eq('id', order.id);
          await supabase.from('notifications').insert({
            title: paid ? 'Payment Successful' : 'Payment Issue',
            body: paid
              ? `Your order #${order.id.slice(0, 8)} payment of $${amountDue.toFixed(2)} (${paymentType === 'deposit_50' ? '50% deposit' : 'full'}) was verified (ref: ${result.tx_ref}).`
              : `Payment for order #${order.id.slice(0, 8)} could not be verified. Please try again.`,
            type: paid ? 'order' : 'alert',
          });
          if (paid) {
            await clearCart();
            message.success('Payment verified! Order placed successfully.');
            navigate('/profile?tab=orders');
          } else {
            message.error('Payment could not be verified. You can retry from your orders.');
            navigate('/profile?tab=orders');
          }
          setPlacing(false);
        },
        onClose: () => {
          setPlacing(false);
          message.info('Payment cancelled. Order saved — you can complete payment from your orders.');
          navigate('/profile?tab=orders');
        },
      });
    } catch (err) {
      message.error(err.message || 'Checkout failed.');
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

            {/* Payment option */}
            <Divider style={{ margin: '16px 0' }} />
            <Typography.Text strong>Payment Option</Typography.Text>
            <Radio.Group value={paymentType} onChange={(e) => setPaymentType(e.target.value)} style={{ display: 'flex', flexDirection: 'column', marginTop: 10, gap: 8 }}>
              <Radio value="full">
                <Typography.Text>Full amount: </Typography.Text>
                <Typography.Text strong style={{ color: '#1B4332' }}>${cartTotal.toFixed(2)}</Typography.Text>
              </Radio>
              <Radio value="deposit_50">
                <Typography.Text>50% deposit now: </Typography.Text>
                <Typography.Text strong style={{ color: '#1B4332' }}>${(cartTotal * 0.5).toFixed(2)}</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}> (balance on delivery)</Typography.Text>
              </Radio>
            </Radio.Group>
            <div style={{ background: '#F4F7F5', borderRadius: 8, padding: '8px 12px', marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
              <Typography.Text>Amount due now</Typography.Text>
              <Typography.Text strong style={{ color: '#2D6A4F', fontSize: 16 }}>${amountDue.toFixed(2)}</Typography.Text>
            </div>

            {/* Billing address */}
            <Divider style={{ margin: '16px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Typography.Text strong><EnvironmentOutlined /> Billing Address</Typography.Text>
              <Button type="link" size="small" icon={<PlusOutlined />} onClick={openAddAddr}>Add</Button>
            </div>
            {addresses.length === 0 ? (
              <Typography.Paragraph type="warning" style={{ fontSize: 13 }}>
                No address yet. Add one to continue.
              </Typography.Paragraph>
            ) : (
              <Radio.Group value={selectedAddress} onChange={(e) => setSelectedAddress(e.target.value)} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {addresses.map((a) => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <Radio value={a.id} style={{ flex: 1, marginTop: 2 }}>
                      <div style={{ fontSize: 13 }}>
                        <Typography.Text strong>{a.full_name}</Typography.Text>
                        {a.is_default && <Typography.Text type="success" style={{ fontSize: 11, marginLeft: 6 }}>Default</Typography.Text>}
                        }
                        <br />
                        <Typography.Text type="secondary">{a.line1}, {a.city}, {a.state} {a.postal_code}</Typography.Text>
                      </div>
                    </Radio>
                    <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEditAddr(a)} />
                  </div>
                ))}
              </Radio.Group>
            )}

            <Button type="primary" size="large" block loading={placing} onClick={handleCheckout} disabled={addresses.length === 0} icon={<CreditCardOutlined />} style={{ marginTop: 20 }}>
              Pay ${amountDue.toFixed(2)} with Flutterwave
            </Button>
            <Typography.Paragraph type="secondary" style={{ fontSize: 12, textAlign: 'center', marginTop: 12 }}>
              Secure payment via Flutterwave · Card, Bank Transfer, USSD
            </Typography.Paragraph>
          </div>
        </Col>
      </Row>

      <Modal
        open={addrModalOpen}
        onCancel={() => setAddrModalOpen(false)}
        title={editingAddr ? 'Edit Address' : 'Add Billing Address'}
        footer={null}
        width={480}
      >
        <Form form={addrForm} layout="vertical" onFinish={saveAddr} requiredMark={false}>
          <Form.Item label="Full Name" name="full_name" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="Jane Doe" />
          </Form.Item>
          <Form.Item label="Address Line 1" name="line1" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="123 Main St" />
          </Form.Item>
          <Form.Item label="Address Line 2" name="line2">
            <Input placeholder="Apt, suite (optional)" />
          </Form.Item>
          <Form.Item label="City" name="city" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="Austin" />
          </Form.Item>
          <Form.Item label="State" name="state" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="TX" />
          </Form.Item>
          <Form.Item label="Postal Code" name="postal_code" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="78701" />
          </Form.Item>
          <Form.Item label="Country" name="country" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="United States" />
          </Form.Item>
          <Form.Item name="is_default" valuePropName="checked">
            <Radio.Group>
              <Radio value={true}>Set as default</Radio>
              <Radio value={false}>Not default</Radio>
            </Radio.Group>
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large">Save Address</Button>
        </Form>
      </Modal>
    </div>
  );
}
