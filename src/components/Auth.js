import { Button, Form, Input, Modal, Tabs, Typography, message } from 'antd';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Auth({ open, onClose }) {
  const { signIn, signUp } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const onLogin = async (values) => {
    setLoading(true);
    try {
      await signIn(values.email, values.password);
      message.success('Welcome back!');
      loginForm.resetFields();
      onClose();
    } catch (err) {
      message.error(err.message || 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (values) => {
    setLoading(true);
    try {
      await signUp(values.email, values.password, values.fullName);
      message.success('Account created! You are now signed in.');
      registerForm.resetFields();
      onClose();
    } catch (err) {
      message.error(err.message || 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={440}
      className="authModal"
      destroyOnClose
    >
      <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>
        {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
      </Typography.Title>
      <Typography.Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
        {activeTab === 'login' ? 'Sign in to continue to PetNest' : 'Join PetNest and find your perfect companion'}
      </Typography.Text>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        centered
        items={[
          {
            key: 'login',
            label: 'Sign In',
            children: (
              <Form form={loginForm} layout="vertical" onFinish={onLogin} requiredMark={false}>
                <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}>
                  <Input size="large" placeholder="you@example.com" />
                </Form.Item>
                <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Enter your password' }]}>
                  <Input.Password size="large" placeholder="••••••••" />
                </Form.Item>
                <Button type="primary" htmlType="submit" block size="large" loading={loading}>Sign In</Button>
              </Form>
            ),
          },
          {
            key: 'register',
            label: 'Sign Up',
            children: (
              <Form form={registerForm} layout="vertical" onFinish={onRegister} requiredMark={false}>
                <Form.Item label="Full Name" name="fullName" rules={[{ required: true, message: 'Enter your full name' }]}>
                  <Input size="large" placeholder="Jane Doe" />
                </Form.Item>
                <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}>
                  <Input size="large" placeholder="you@example.com" />
                </Form.Item>
                <Form.Item label="Password" name="password" rules={[{ required: true, min: 6, message: 'Min 6 characters' }]}>
                  <Input.Password size="large" placeholder="••••••••" />
                </Form.Item>
                <Button type="primary" htmlType="submit" block size="large" loading={loading}>Create Account</Button>
              </Form>
            ),
          },
        ]}
      />
    </Modal>
  );
}
