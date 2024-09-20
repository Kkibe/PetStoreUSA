import {LikeOutlined } from "@ant-design/icons";
import {Typography } from "antd";

function Footer() {
  return (
    <div className="appFooter">
      <Typography.Text>
        © {new Date().getFullYear()}
      </Typography.Text>
      <Typography.Text>
        Total Sales: 2923
      </Typography.Text>
      <Typography.Text>
        Happy Users: <LikeOutlined />2526
      </Typography.Text>
    </div>
  );
}
export default Footer;