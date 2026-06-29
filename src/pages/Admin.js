import { DeleteOutlined, EditOutlined, PlusOutlined, ShopOutlined, ShoppingOutlined, DashboardOutlined } from '@ant-design/icons';
import {
  Avatar, Button, Card, Col, Empty, Form, Image, Input, InputNumber, Layout, Menu, Modal,
  Popconfirm, Row, Select, Spin, Statistic, Table, Tag, Typography, message,
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const { Sider, Content } = Layout;

const PROGRESS_OPTIONS = [
  { value: 'awaiting_payment', label: 'Awaiting Payment' },
  { value: 'partially_paid', label: 'Partially Paid' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function Admin() {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!session) { navigate('/'); return; }
      if (profile?.is_admin) { setIsAdmin(true); setChecking(false); }
      else { setChecking(false); }
    }
  }, [loading, session, profile, navigate]);

  if (loading || checking) return <div style={{ textAlign: 'center', padding: 120 }}><Spin size="large" /></div>;
  if (!isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: 120 }}>
        <Typography.Title level={3}>Admin access required</Typography.Title>
        <Typography.Text type="secondary">Your account does not have admin privileges.</Typography.Text>
        <br />
        <Button type="primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: 'calc(100vh - 72px - 200px)', background: '#FAFBF9' }}>
      <Sider width={220} style={{ background: '#fff', borderRight: '1px solid #E8EDE9' }}>
        <div style={{ padding: '24px 20px 8px' }}>
          <Typography.Title level={4} style={{ margin: 0, fontFamily: "'Playfair Display', serif" }}>Admin Panel</Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>PetNest Management</Typography.Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[tab]}
          onClick={({ key }) => setTab(key)}
          style={{ border: 'none' }}
          items={[
            { key: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
            { key: 'products', label: 'Products', icon: <ShopOutlined /> },
            { key: 'orders', label: 'Orders', icon: <ShoppingOutlined /> },
          ]}
        />
      </Sider>
      <Content style={{ padding: 32 }}>
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'products' && <ProductsAdmin />}
        {tab === 'orders' && <OrdersAdmin />}
      </Content>
    </Layout>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, users: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [p, o, u] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('total,progress,created_at'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);
      const orders = o.data || [];
      const revenue = orders
        .filter((x) => x.progress !== 'cancelled')
        .reduce((s, x) => s + Number(x.total), 0);
      setStats({
        products: p.count || 0,
        orders: orders.length,
        revenue,
        users: u.count || 0,
      });
      setRecentOrders(orders.slice(0, 5));
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spin />;
  return (
    <div>
      <Typography.Title level={3}>Dashboard Overview</Typography.Title>
      <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
        <Col xs={12} md={6}>
          <Card><Statistic title="Products" value={stats.products} prefix={<ShopOutlined />} valueStyle={{ color: '#2D6A4F' }} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card><Statistic title="Orders" value={stats.orders} prefix={<ShoppingOutlined />} valueStyle={{ color: '#2D6A4F' }} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card><Statistic title="Revenue" value={stats.revenue} prefix="$" valueStyle={{ color: '#1B4332' }} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card><Statistic title="Users" value={stats.users} valueStyle={{ color: '#2D6A4F' }} /></Card>
        </Col>
      </Row>
      <Typography.Title level={4} style={{ marginTop: 32 }}>Recent Orders</Typography.Title>
      {recentOrders.length === 0 ? <Empty /> : (
        <Table
          size="small"
          pagination={false}
          dataSource={recentOrders.map((o, i) => ({ ...o, key: i }))}
          columns={[
            { title: 'Date', dataIndex: 'created_at', render: (v) => new Date(v).toLocaleDateString() },
            { title: 'Total', dataIndex: 'total', render: (v) => `$${Number(v).toFixed(2)}` },
            { title: 'Progress', dataIndex: 'progress', render: (v) => <Tag>{v.replace(/_/g, ' ')}</Tag> },
          ]}
        />
      )}
    </div>
  );
}

function ProductsAdmin() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await fetchProducts();
      const { data: cats } = await supabase.from('categories').select('*').order('name');
      setCategories(cats || []);
    })();
  }, []);

  const openAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (p) => { setEditing(p); form.setFieldsValue({ ...p, category_id: p.category_id }); setModalOpen(true); };

  const save = async (values) => {
    const payload = {
      ...values,
      price: Number(values.price),
      compare_at_price: values.compare_at_price ? Number(values.compare_at_price) : null,
      stock: Number(values.stock),
      rating: Number(values.rating) || 0,
      reviews_count: Number(values.reviews_count) || 0,
      featured: values.featured || false,
      gallery: values.gallery ? values.gallery.split(',').map((s) => s.trim()).filter(Boolean) : [],
      tags: values.tags ? values.tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
    };
    if (editing) {
      const { error } = await supabase.from('products').update(payload).eq('id', editing.id);
      if (error) { message.error(error.message); return; }
      message.success('Product updated.');
    } else {
      const slug = values.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const { error } = await supabase.from('products').insert({ ...payload, slug });
      if (error) { message.error(error.message); return; }
      message.success('Product added.');
    }
    setModalOpen(false);
    fetchProducts();
  };

  const del = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { message.error(error.message); return; }
    message.success('Product deleted.');
    fetchProducts();
  };

  const columns = [
    {
      title: 'Product', dataIndex: 'name', render: (v, r) => (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Image src={r.image_url} width={40} height={40} style={{ objectFit: 'cover', borderRadius: 6 }} />
          <div>
            <Typography.Text strong>{v}</Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>{r.categories?.name}</Typography.Text>
          </div>
        </div>
      ),
    },
    { title: 'Price', dataIndex: 'price', render: (v) => `$${Number(v).toFixed(2)}` },
    { title: 'Stock', dataIndex: 'stock' },
    { title: 'Featured', dataIndex: 'featured', render: (v) => v ? <Tag color="gold">Yes</Tag> : <Tag>No</Tag> },
    {
      title: 'Actions', render: (_, r) => (
        <div>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Popconfirm title="Delete this product?" onConfirm={() => del(r.id)} okText="Yes" cancelText="No">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Products</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Add Product</Button>
      </div>
      {loading ? <Spin /> : (
        <Table dataSource={items} columns={columns} rowKey="id" pagination={{ pageSize: 8 }} />
      )}

      <Modal open={modalOpen} onCancel={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'} footer={null} width={600}>
        <Form form={form} layout="vertical" onFinish={save} requiredMark={false}>
          <Form.Item label="Name" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Category" name="category_id" rules={[{ required: true }]}>
            <Select options={categories.map((c) => ({ value: c.id, label: c.name }))} />
          </Form.Item>
          <Form.Item label="Description" name="description"><Input.TextArea rows={3} /></Form.Item>
          <Row gutter={16}>
            <Col span={8}><Form.Item label="Price" name="price" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item label="Compare Price" name="compare_at_price"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item label="Stock" name="stock" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item label="Rating" name="rating"><InputNumber min={0} max={5} step={0.1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item label="Reviews" name="reviews_count"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item label="Featured" name="featured" valuePropName="checked"><Select options={[{ value: true, label: 'Yes' }, { value: false, label: 'No' }]} /></Form.Item></Col>
          </Row>
          <Form.Item label="Image URL" name="image_url"><Input /></Form.Item>
          <Form.Item label="Gallery (comma-separated URLs)" name="gallery"><Input /></Form.Item>
          <Form.Item label="Tags (comma-separated)" name="tags"><Input /></Form.Item>
          <Button type="primary" htmlType="submit" block size="large">Save</Button>
        </Form>
      </Modal>
    </div>
  );
}

function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*, order_items(*), address_snapshot').order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateProgress = async (id, progress) => {
    const { error } = await supabase.from('orders').update({ progress, status: progress }).eq('id', id);
    if (error) { message.error(error.message); return; }
    message.success('Order progress updated.');
    fetchOrders();
  };

  const columns = [
    { title: 'Order', dataIndex: 'id', render: (v) => `#${v.slice(0, 8)}` },
    { title: 'Date', dataIndex: 'created_at', render: (v) => new Date(v).toLocaleDateString() },
    { title: 'Total', dataIndex: 'total', render: (v) => `$${Number(v).toFixed(2)}` },
    { title: 'Payment', dataIndex: 'payment_type', render: (v) => v ? <Tag>{v === 'deposit_50' ? '50% Deposit' : 'Full'}</Tag> : '-' },
    {
      title: 'Progress', dataIndex: 'progress', render: (v, r) => (
        <Select
          size="small"
          value={v}
          style={{ width: 160 }}
          onChange={(val) => updateProgress(r.id, val)}
          options={PROGRESS_OPTIONS}
        />
      ),
    },
    {
      title: 'Customer', render: (_, r) => r.address_snapshot ? (
        <Typography.Text style={{ fontSize: 13 }}>{r.address_snapshot.full_name}</Typography.Text>
      ) : '-',
    },
  ];

  return (
    <div>
      <Typography.Title level={3}>Orders</Typography.Title>
      <Typography.Text type="secondary">Update order progress to let customers track their orders.</Typography.Text>
      <div style={{ marginTop: 16 }}>
        {loading ? <Spin /> : (
          <Table
            dataSource={orders}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            expandable={{
              expandedRowRender: (r) => (
                <div>
                  <Typography.Text strong>Items:</Typography.Text>
                  <Table
                    size="small"
                    pagination={false}
                    dataSource={r.order_items || []}
                    rowKey="id"
                    columns={[
                      { title: 'Product', dataIndex: 'product_name' },
                      { title: 'Qty', dataIndex: 'quantity' },
                      { title: 'Unit Price', dataIndex: 'unit_price', render: (v) => `$${Number(v).toFixed(2)}` },
                      { title: 'Line Total', dataIndex: 'line_total', render: (v) => `$${Number(v).toFixed(2)}` },
                    ]}
                  />
                </div>
              ),
            }}
          />
        )}
      </div>
    </div>
  );
}
