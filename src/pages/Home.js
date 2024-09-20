import { CaretRightOutlined, CopyFilled, LikeOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Carousel, Col, Collapse, Divider, Image, Input, List, QRCode, Rate, Row, Space, Statistic, Steps, Typography, Watermark, message, theme } from 'antd'
import React, { useEffect, useState } from 'react'
import { addToCart, getAllProducts } from '../API';
import { faqs } from '../data';
import Banner from '../components/Banner';


export default function Home() {
  const { token } = theme.useToken();
  const panelStyle = {
    width: '100%',
    marginBottom: 12,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: 'none',
  };
  
  return (
    <Space direction='vertical' style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}>
      <Banner />

      <Space direction='vertical' style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      width: '100%',
    }}>
      <Typography.Title>How It Works</Typography.Title>
      <Steps
        current={'5'}
        //onChange={onChange}
        direction="horizontal"
        items={[
          {
            title: 'Step 1',
            description: 'Select your pet and click "Add to Cart" button.',
          },
          {
            title: 'Step 2',
            description: "Checkout your cart and pay using the available options.",
          },
          {
            title: 'Step 3',
            description: "We will confirm your order and contact you to ask for delivery address.",
          },
          {
            title: 'Step 4',
            description: 'Welcoming your new companion into your family!'
          }
        ]}
      />
      <Typography.Text strong>Frequently Asked Questions(FAQ)</Typography.Text>
      <Collapse 
        size="large"
        expandIconPosition={"end"}
        items={faqs(panelStyle)} 
        defaultActiveKey={['1']}  
        style={{
          width: '80vw',
          background: token.colorBgContainer
        }}
        bordered={false}
        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
      />
    </Space>
    </Space>
  )
}