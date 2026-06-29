import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import './App.css';
import AppFooter from './components/Footer';
import AppHeader from './components/Header';
import PageContent from './components/PageContent';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { themeConfig } from './theme';

function App() {
  return (
    <ConfigProvider theme={themeConfig}>
      <AuthProvider>
        <CartProvider>
          <div className="App">
            <BrowserRouter>
              <AppHeader />
              <PageContent />
              <AppFooter />
            </BrowserRouter>
          </div>
        </CartProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
