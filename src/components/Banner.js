import React from 'react';
import { Button, Typography } from 'antd';
import Image from './p1.png';

const Banner = () => {
  return (
    <div style={{
      background: `url(${Image}) no-repeat center center`,
      backgroundSize: 'cover',
      padding: '100px 0',
      textAlign: 'center',
      color: '#fff',
      width: '100vw'
    }}>
      <Typography.Title style={{ fontSize: '48px', marginBottom: '20px', color: '#fc46aa' }}>Welcome to PetStoreUSA</Typography.Title>
      <p style={{ fontSize: '24px', marginBottom: '40px', color: '#9e4244' }}>Find your perfect pet today!</p>
      <Typography.Link href='/store'><Button type="primary" size="large">Shop Now</Button></Typography.Link>
    </div>
  );
};

export default Banner;
