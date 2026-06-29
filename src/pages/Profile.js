import { UserOutlined, ShoppingOutlined, BellOutlined, CreditCardOutlined, SettingOutlined, EnvironmentOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Empty, Form, Input, List, Menu, Modal, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const TABS = [
  { key: 'orders', label: 'My Orders', icon: <ShoppingOutlined /> },
  { key: 'notifications', label: 'Notifications', icon: <BellOutlined /> },
  { key: 'billing', label: 'Billing & Addresses', icon: <CreditCardOutlined /> },
  { key: 'settings', label: 'Settings', icon: <SettingOutlined /> },
];

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, profile, updateProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders');
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [addrForm] = Form.useForm();

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
                  <Card key={o.id} size="small" style={{ marginBottom: 16, borderRadius: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <Typography.Text strong>Order #{o.id.slice(0, 8)}</Typography.Text>
                        <br />
                        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                          {new Date(o.created_at).toLocaleDateString()}
                        </Typography.Text>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Tag color={
                          o.status === 'paid' ? 'green' :
                          o.status === 'delivered' ? 'green' :
                          o.status === 'awaiting_payment' ? 'orange' :
                          o.status === 'payment_failed' ? 'red' :
                          o.status === 'pending' ? 'orange' : 'blue'
                        }>
                          {o.status.replace(/_/g, ' ')}
                        </Tag>
                        <br />
                        <Typography.Text strong style={{ color: '#1B4332' }}>${Number(o.total).toFixed(2)}</Typography.Text>
                      </div>
                    </div>
                    <List
                      size="small"
                      dataSource={o.order_items || []}
                      renderItem={(item) => (
                        <List.Item>
                          <Typography.Text>{item.product_name} × {item.quantity}</Typography.Text>
                          <Typography.Text>${Number(item.line_total).toFixed(2)}</Typography.Text>
                        </List.Item>
                      )}
                    />
                  </Card>
                ))
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
