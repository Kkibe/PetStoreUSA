import { Carousel, Space } from 'antd'
import React from 'react'

export default function Home() {
  return (
    <Space direction='vertical' style={{width: '100%'}}>
      <Carousel 
        autoplay
        >
        <Space size={12}>
          <h3 style={contentStyle}>1</h3>
        </Space>
        <div>
          <h3 style={contentStyle}>2</h3>
        </div>
        <div>
          <h3 style={contentStyle}>3</h3>
        </div>
        <div>
          <h3 style={contentStyle}>4</h3>
        </div>
      </Carousel>
    </Space>
  )
}

const contentStyle = {
  height: '220px',
  color: '#fff',
  lineHeight: '160px',
  textAlign: 'center',
  background: '#364d79',
};
