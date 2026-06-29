import { UserOutlined, ShoppingOutlined, BellOutlined, CreditCardOutlined, SettingOutlined, EnvironmentOutlined, PlusOutlined, DeleteOutlined, HeartOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Col, Empty, Form, Input, List, Menu, Modal, Row, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { supabase } from '../lib/supabaseClient';
import { usePayment, generateTxRef } from '../lib/payment';
import ProductCard from '../components/ProductCard';

const TABS = [
  { key: 'orders', label: 'My Orders', icon: <ShoppingOutlined /> },
  { key: 'saved', label: 'Saved Pets', icon: <HeartOutlined /> },
  { key: 'notifications', label: 'Notifications', icon: <BellOutlined /> },
  { key: 'billing', label: 'Billing & Addresses', icon: <CreditCardOutlined /> },
  { key: 'settings', label: 'Settings', icon: <SettingOutlined /> },
];

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, profile, updateProfile, signOut } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders');
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [addrForm] = Form.useForm();

  const refreshOrders = async () => {
    if (!session?.user) return;
    const { data } = await supabase.from('orders').select('*, order_items(*)').eq('user_id', session.user.id).order('created_at', { ascending: false });
    setOrders(data || []);
  };

  useEffect(() => {
    if (!session?.user) { navigate('/'); return; }
    (async () => {
      setLoading(true);
      const [ord, notif, addr] = await Promise.all([
        supabase.from('orders').select('*, order_items(*)').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('addresses').select('*').eq('user_id', session.user.id).order('is_default', { ascending: false }),
      ]);
      setOrders(ord.data || []);
      setNotifications(notif.data || []);
      setAddresses(addr.data || []);
      setLoading(false);
    })();
  }, [session?.user]);

  const markNotificationRead = async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const deleteNotification = async (id) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const addAddress = async (values) => {
    try {
      const { data, error } = await supabase.from('addresses').insert(values).select().maybeSingle();
      if (error) throw error;
      setAddresses((prev) => [...prev, data]);
      addrForm.resetFields();
      setAddrModalOpen(false);
      message.success('Address added.');
    } catch (err) {
      message.error(err.message);
    }
  };

  const deleteAddress = async (id) => {
    await supabase.from('addresses').delete().eq('id', id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    message.success('Address removed.');
  };

  const setDefaultAddress = async (id) => {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', session.user.id);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })));
    message.success('Default address updated.');
  };

  if (!session) return null;

  return (
    <div className="profileLayout">
      <div className="profileSider">
        <div className="profileAvatar">
          <Avatar size={80} icon={<UserOutlined />} style={{ background: '#2D6A4F' }} />
          <Typography.Title level={5} style={{ marginTop: 12, marginBottom: 0 }}>
            {profile?.full_name || session.user.email}
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>{session.user.email}</Typography.Text>
        </div>
        <Menu
          className="profileMenu"
          mode="inline"
          selectedKeys={[activeTab]}
          onClick={({ key }) => { setActiveTab(key); navigate(`/profile?tab=${key}`); }}
          items={TABS}
        />
        <Button block danger type="text" icon={<UserOutlined />} onClick={async () => { await signOut(); navigate('/'); }} style={{ marginTop: 16 }}>
          Sign Out
        </Button>
      </div>

      <div className="profileContent">
        {activeTab === 'orders' && (
          <div>
            <Typography.Title level={4}>My Orders</Typography.Title>
            <Typography.Text type="secondary">Track and manage your placed orders.</Typography.Text>
            <div style={{ marginTop: 24 }}>
              {loading ? <Typography.Text>Loading...</Typography.Text> : orders.length === 0 ? (
                <Empty description="No orders yet" />
              ) : (
                orders.map((o) => (
                  <OrderCard key={o.id} order={o} onUpdate={refreshOrders} />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div>
            <Typography.Title level={4}>Saved Pets</Typography.Title>
            <Typography.Text type="secondary">Your bookmarked pets and products.</Typography.Text>
            <div style={{ marginTop: 24 }}>
              {favorites.length === 0 ? (
                <Empty description="No saved pets yet" />
              ) : (
                <Row gutter={[16, 16]}>
                  {favorites.map((f) => (
                    f.product && (
                      <Col key={f.id} xs={24} sm={12} md={8} lg={6}>
                        <ProductCard product={f.product} />
                      </Col>
                    )
                  ))}
                </Row>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <Typography.Title level={4}>Notifications</Typography.Title>
            <Typography.Text type="secondary">Stay updated on your orders and account.</Typography.Text>
            <div style={{ marginTop: 24 }}>
              {loading ? <Typography.Text>Loading...</Typography.Text> : notifications.length === 0 ? (
                <Empty description="No notifications" />
              ) : (
                notifications.map((n) => (
                  <div key={n.id} style={{ display: 'flex', gap: 12, padding: 16, borderBottom: '1px solid #E8EDE9', background: n.read ? 'transparent' : 'rgba(45,106,79,0.04)' }}>
                    <BellOutlined style={{ color: n.read ? '#9AA8A1' : '#2D6A4F', fontSize: 18, marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                      <Typography.Text strong>{n.title}</Typography.Text>
                      {!n.read && <Tag color="green" style={{ marginLeft: 8, fontSize: 11 }}>New</Tag>}
                      <Typography.Paragraph style={{ fontSize: 14, color: '#5A6B62', marginBottom: 4, marginTop: 4 }}>{n.body}</Typography.Paragraph>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>{new Date(n.created_at).toLocaleString()}</Typography.Text>
                    </div>
                    <div>
                      {!n.read && <Button type="link" size="small" onClick={() => markNotificationRead(n.id)}>Mark read</Button>}
                      <Button type="link" danger size="small" icon={<DeleteOutlined />} onClick={() => deleteNotification(n.id)} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Typography.Title level={4} style={{ margin: 0 }}>Billing & Addresses</Typography.Title>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddrModalOpen(true)}>Add Address</Button>
            </div>
            <Typography.Text type="secondary">Manage your shipping addresses and payment info.</Typography.Text>
            <div style={{ marginTop: 24 }}>
              {loading ? <Typography.Text>Loading...</Typography.Text> : addresses.length === 0 ? (
                <Empty description="No addresses yet" />
              ) : (
                addresses.map((a) => (
                  <Card key={a.id} size="small" style={{ marginBottom: 16, borderRadius: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <Typography.Text strong><EnvironmentOutlined /> {a.full_name}</Typography.Text>
                        {a.is_default && <Tag color="green" style={{ marginLeft: 8 }}>Default</Tag>}
                        <Typography.Paragraph style={{ fontSize: 14, color: '#5A6B62', marginTop: 8, marginBottom: 0 }}>
                          {a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />
                          {a.city}, {a.state} {a.postal_code}<br />
                          {a.country}
                        </Typography.Paragraph>
                      </div>
                      <div>
                        {!a.is_default && <Button type="link" size="small" onClick={() => setDefaultAddress(a.id)}>Set default</Button>}
                        <Button type="link" danger size="small" icon={<DeleteOutlined />} onClick={() => deleteAddress(a.id)} />
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
            <Card size="small" style={{ marginTop: 16, borderRadius: 10, background: '#F4F7F5' }}>
              <Typography.Text type="secondary">Payment Method: </Typography.Text>
              <Tag color="default">Cash on Delivery</Tag>
              <Typography.Text type="secondary" style={{ fontSize: 13 }}> — More payment options coming soon.</Typography.Text>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <SettingsTab profile={profile} updateProfile={updateProfile} />
        )}
      </div>

      <Modal
        open={addrModalOpen}
        onCancel={() => setAddrModalOpen(false)}
        title="Add Shipping Address"
        footer={null}
        width={480}
      >
        <Form form={addrForm} layout="vertical" onFinish={addAddress} requiredMark={false}>
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
          <Button type="primary" htmlType="submit" block size="large">Save Address</Button>
        </Form>
      </Modal>
    </div>
  );
}

function SettingsTab({ profile, updateProfile }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) form.setFieldsValue({ full_name: profile.full_name, phone: profile.phone, avatar_url: profile.avatar_url });
  }, [profile]);

  const onSave = async (values) => {
    setSaving(true);
    try {
      await updateProfile(values);
      message.success('Profile updated.');
    } catch (err) {
      message.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Typography.Title level={4}>Account Settings</Typography.Title>
      <Typography.Text type="secondary">Update your personal information.</Typography.Text>
      <Form form={form} layout="vertical" onFinish={onSave} style={{ maxWidth: 480, marginTop: 24 }} requiredMark={false}>
        <Form.Item label="Full Name" name="full_name"><Input placeholder="Jane Doe" /></Form.Item>
        <Form.Item label="Phone" name="phone"><Input placeholder="(555) 123-4567" /></Form.Item>
        <Form.Item label="Avatar URL" name="avatar_url"><Input placeholder="https://..." /></Form.Item>
        <Button type="primary" htmlType="submit" loading={saving} size="large">Save Changes</Button>
      </Form>
    </div>
  );
}

const PROGRESS_STEPS = [
  { key: 'awaiting_payment', label: 'Awaiting Payment' },
  { key: 'partially_paid', label: 'Partially Paid' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

function OrderCard({ order, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { pay } = usePayment();

  const progress = order.progress || 'awaiting_payment';
  const isCancelled = progress === 'cancelled';
  const canCancel = ['awaiting_payment', 'partially_paid', 'processing', 'shipped'].includes(progress);
  const needsPayment = ['awaiting_payment', 'partially_paid'].includes(progress);
  const paymentType = order.payment_type;
  const amountPaid = order.payment?.amount_due || 0;
  const balance = paymentType === 'deposit_50' ? Number(order.total) - Number(amountPaid) : 0;

  const handleCompletePayment = () => {
    setActionLoading(true);
    const due = paymentType === 'deposit_50' ? balance : Number(order.total);
    pay({
      amount: due,
      customer: {
        email: order.address_snapshot?.full_name || '',
        name: order.address_snapshot?.full_name || '',
        phone_number: order.address_snapshot?.postal_code || '',
      },
      txRef: generateTxRef(),
      onVerified: async (result) => {
        const paid = result.status === 'verified';
        if (paid) {
          await supabase.from('orders').update({
            status: 'paid',
            progress: 'processing',
            payment: { ...result, payment_type: 'full', amount_due: due, order_total: order.total },
            payment_type: 'full',
          }).eq('id', order.id);
          await supabase.from('notifications').insert({
            title: 'Payment Completed',
            body: `Your balance payment of ${due.toFixed(2)} for order #${order.id.slice(0, 8)} was verified.`,
            type: 'order',
          });
          message.success('Balance payment verified!');
        } else {
          message.error('Payment could not be verified.');
        }
        setActionLoading(false);
        onUpdate();
      },
      onClose: () => { setActionLoading(false); },
    });
  };

  const handleCancel = async () => {
    Modal.confirm({
      title: 'Cancel this order?',
      content: 'This action cannot be undone.',
      okText: 'Yes, cancel',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        setActionLoading(true);
        await supabase.from('orders').update({
          progress: 'cancelled',
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        }).eq('id', order.id);
        await supabase.from('notifications').insert({
          title: 'Order Cancelled',
          body: `Your order #${order.id.slice(0, 8)} has been cancelled.`,
          type: 'alert',
        });
        message.success('Order cancelled.');
        setActionLoading(false);
        onUpdate();
      },
    });
  };

  const currentStepIndex = PROGRESS_STEPS.findIndex((s) => s.key === progress);

  return (
    <Card size="small" style={{ marginBottom: 16, borderRadius: 10, cursor: 'pointer' }} onClick={() => setExpanded((e) => !e)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <Typography.Text strong>Order #{order.id.slice(0, 8)}</Typography.Text>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            {new Date(order.created_at).toLocaleDateString()}
          </Typography.Text>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Tag color={
            isCancelled ? 'red' :
            progress === 'delivered' ? 'green' :
            progress === 'shipped' ? 'blue' :
            progress === 'processing' ? 'cyan' :
            progress === 'partially_paid' ? 'gold' :
            progress === 'awaiting_payment' ? 'orange' : 'blue'
          }>
            {progress.replace(/_/g, ' ')}
          </Tag>
          <br />
          <Typography.Text strong style={{ color: '#1B4332' }}>${Number(order.total).toFixed(2)}</Typography.Text>
          {paymentType === 'deposit_50' && progress === 'partially_paid' && (
            <Typography.Text type="warning" style={{ fontSize: 12, display: 'block' }}>
              Balance: ${balance.toFixed(2)}
            </Typography.Text>
          )}
        </div>
      </div>

      {expanded && (
        <div>
          {/* Progress tracker */}
          {!isCancelled ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, padding: '0 4px' }}>
              {PROGRESS_STEPS.map((step, i) => (
                <div key={step.key} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', margin: '0 auto',
                    background: i <= currentStepIndex ? '#2D6A4F' : '#E8EDE9',
                    color: i <= currentStepIndex ? '#fff' : '#9AA8A1',
                    fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 600,
                  }}>{i + 1}</div>
                  <Typography.Text style={{ fontSize: 11, color: i <= currentStepIndex ? '#1B4332' : '#9AA8A1' }}>
                    {step.label}
                  </Typography.Text>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 12, background: '#FFF1F0', borderRadius: 8, marginBottom: 12 }}>
              <Typography.Text type="danger">This order was cancelled.</Typography.Text>
            </div>
          )}

          <List
            size="small"
            dataSource={order.order_items || []}
            renderItem={(item) => (
              <List.Item>
                <Typography.Text>{item.product_name} × {item.quantity}</Typography.Text>
                <Typography.Text>${Number(item.line_total).toFixed(2)}</Typography.Text>
              </List.Item>
            )}
          />

          {order.address_snapshot && (
            <div style={{ marginTop: 12, padding: 12, background: '#F4F7F5', borderRadius: 8 }}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>Shipping to: </Typography.Text>
              <Typography.Text style={{ fontSize: 13 }}>
                {order.address_snapshot.full_name}, {order.address_snapshot.line1}, {order.address_snapshot.city}, {order.address_snapshot.state}
              </Typography.Text>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            {needsPayment && (
              <Button type="primary" loading={actionLoading} onClick={(e) => { e.stopPropagation(); handleCompletePayment(); }}>
                {paymentType === 'deposit_50' ? `Pay Balance ${balance.toFixed(2)}` : `Pay ${Number(order.total).toFixed(2)}`}
              </Button>
            )}
            {canCancel && (
              <Button danger loading={actionLoading} onClick={(e) => { e.stopPropagation(); handleCancel(); }}>
                Cancel Order
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
