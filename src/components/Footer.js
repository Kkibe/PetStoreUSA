import { InstagramOutlined, FacebookOutlined, TwitterOutlined, MailOutlined, EnvironmentOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const go = (path) => navigate(`/${path}`);

  return (
    <div className="appFooter">
      <div className="footerGrid">
        <div>
          <div className="footerBrand">🐾 PetNest</div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.7, maxWidth: 320 }}>
            Your trusted partner in finding the perfect companion. Every pet is health-checked,
            vaccinated, and ready to join a loving home.
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
            <InstagramOutlined style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }} />
            <FacebookOutlined style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }} />
            <TwitterOutlined style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }} />
          </div>
        </div>
        <div className="footerCol">
          <h4>Shop</h4>
          <a onClick={() => go('store')}>All Pets</a>
          <a onClick={() => go('category/dogs')}>Dogs</a>
          <a onClick={() => go('category/cats')}>Cats</a>
          <a onClick={() => go('category/birds')}>Birds</a>
          <a onClick={() => go('category/supplies')}>Supplies</a>
        </div>
        <div className="footerCol">
          <h4>Account</h4>
          <a onClick={() => go('profile')}>My Profile</a>
          <a onClick={() => go('profile?tab=orders')}>Orders</a>
          <a onClick={() => go('cart')}>Cart</a>
          <a onClick={() => go('profile?tab=billing')}>Billing</a>
        </div>
        <div className="footerCol">
          <h4>Contact</h4>
          <p><EnvironmentOutlined /> 123 Pet Lane, Austin, TX</p>
          <p><PhoneOutlined /> (555) 123-4567</p>
          <p><MailOutlined /> hello@petnest.com</p>
        </div>
      </div>
      <div className="footerBottom">
        <span>© {year} PetNest. All rights reserved.</span>
        <span>Made with care for pets and their people.</span>
      </div>
    </div>
  );
}
