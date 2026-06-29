import {
  LogoutOutlined, OrderedListOutlined, UserOutlined, ShoppingOutlined,
  BellOutlined, HeartOutlined, HomeOutlined, ShopOutlined, MenuOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Button, Drawer, Input, Menu, message, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';
import Auth from './Auth';

export default function Header() {
  const navigate = useNavigate();
  const { session, profile, signOut } = useAuth();
  const { cartCount } = useCart();
  const [authOpen, setAuthOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!session?.user) { setUnreadCount(0); return; }
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('read', false)
      .then(({ count }) => setUnreadCount(count || 0));
  }, [session?.user]);

  const navItems = [
    { label: 'Home', key: '', icon: <HomeOutlined /> },
    { label: 'Shop', key: 'store', icon: <ShopOutlined /> },
    { label: 'Dogs', key: 'category/dogs' },
    { label: 'Cats', key: 'category/cats' },
    { label: 'Birds', key: 'category/birds' },
  ];

  const onNav = (key) => {
    navigate(`/${key}`);
    setMobileOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    message.success('Signed out.');
    navigate('/');
  };

  const userMenu = session ? (
    <Menu
      onClick={({ key }) => onNav(key)}
      items={[
        { label: 'My Profile', key: 'profile', icon: <UserOutlined /> },
        { label: 'My Orders', key: 'profile?tab=orders', icon: <OrderedListOutlined /> },
        { label: 'Notifications', key: 'profile?tab=notifications', icon: <BellOutlined /> },
        { type: 'divider' },
        { label: 'Sign Out', key: 'signout', icon: <LogoutOutlined />, danger: true },
      ]}
    />
  ) : null;

  return (
    <>
      <div className={`appHeader ${scrolled ? 'scrolled' : ''}`}>
        <div className="brand" onClick={() => onNav('')}>
          <span className="brandIcon">🐾</span> PetNest
        </div>

        <Menu
          className="appMenu"
          mode="horizontal"
          onClick={({ key }) => onNav(key)}
          selectedKeys={[]}
          items={navItems.map((i) => ({ label: i.label, key: i.key }))}
        />

        <div className="headerActions">
          <Button type="text" icon={<HeartOutlined />} onClick={() => onNav('store')} style={{ color: '#1B4332' }} />
          {session && (
            <Badge count={unreadCount} size="small">
              <Button type="text" icon={<BellOutlined />} onClick={() => onNav('profile?tab=notifications')} style={{ color: '#1B4332' }} />
            </Badge>
          )}
          <Badge count={cartCount} size="small" offset={[-4, 4]}>
            <Button type="text" icon={<ShoppingOutlined />} onClick={() => onNav('cart')} style={{ color: '#1B4332' }} />
          </Badge>
          {session ? (
            <Menu
              mode="horizontal"
              selectable={false}
              style={{ borderBottom: 'none' }}
              items={[{
                key: 'user',
                label: <Avatar style={{ background: '#2D6A4F' }} icon={<UserOutlined />} />,
                children: userMenu?.props?.items,
              }]}
              onClick={({ key }) => { if (key === 'signout') handleSignOut(); else onNav(key); }}
            />
          ) : (
            <Button type="primary" onClick={() => setAuthOpen(true)}>Sign In</Button>
          )}
          <Button type="text" icon={<MenuOutlined />} className="mobileMenuBtn" onClick={() => setMobileOpen(true)} style={{ display: 'none' }} />
        </div>
      </div>

      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        title="PetNest"
        placement="right"
      >
        <Menu
          mode="inline"
          onClick={({ key }) => onNav(key)}
          items={navItems.map((i) => ({ label: i.label, key: i.key }))}
        />
      </Drawer>

      <Auth open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
