import {LogoutOutlined, OrderedListOutlined,UserOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Menu,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart } from "../API";
import Auth from "./Auth";
import Cart from "./Cart";

function Header() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [user, setUser] = useState(false);
  
  const onMenuClick = (item) => {
    navigate(`/${item.key}`);
  };
  return (
    <div className="appHeader">
      <Menu
        className="appMenu"
        onClick={onMenuClick}
        mode="horizontal"
        items={[
          {
            label: "Home",
            key: "",
          },
          {
            label: "Store",
            key: "store",
          },
        ]}
      />
      <Cart />
      <Menu>
        {user ? (
        <Menu.SubMenu
          title={
            <Avatar
              shape="circle"
              alt="avator"
              icon={<UserOutlined />}
            />
          }
        >
            <Menu.Item key="orders">
              <OrderedListOutlined /> Orders
            </Menu.Item>
            <Menu.Item key="log-out">
              <LogoutOutlined /> Logout
            </Menu.Item>
          </Menu.SubMenu>
        ) : <Button type="primary" onClick={() => setModalOpen(!modalOpen)}>Get Started</Button>
      } 
      </Menu>
      <Auth setModalOpen={setModalOpen} modalOpen={modalOpen}/>
    </div>
  );
}

export default Header;