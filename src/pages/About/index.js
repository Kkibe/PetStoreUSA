import { CopyFilled, LikeOutlined } from '@ant-design/icons';
import { Space, Collapse, Typography, Row, Col, Statistic, Card, QRCode, Input, Button, Image } from 'antd'
import React, { useState } from 'react'

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;

const items = [
  {
    key: '1',
    label: 'This is panel header 1',
    children: <p>{text}</p>,
  },
  {
    key: '2',
    label: 'This is panel header 2',
    children: <p>{text}</p>,
  },
  {
    key: '3',
    label: 'This is panel header 3',
    children: <p>{text}</p>,
  },
];
export default function About() {
  const text = 'https://ant.design/';
  const image = 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg';
  
  return (
    <Space direction='vertical' style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      width: '100%',
    }}>
      <Space style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'column'}}>
        <Image
            width={200}
            src={image}
            placeholder={
              <Image
                 preview={false}
                 src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png?x-oss-process=image/blur,r_50,s_50/quality,q_1/resize,m_mfit,h_200,w_200"
                 width={200}
              />
            }
        />
        <Typography.Paragraph style={{ fontSize: 24, overflowY: 'auto', paddingRight: 50,paddingLeft: 50,}} strong>
            Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy
            text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book." 
            "It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
        </Typography.Paragraph>
      </Space>
      <Card>
        <Space direction='horizontal'>
          <Row gutter={100}>
            <Col span={13}>
              <Statistic title="Total Sales" value={936}  />
            </Col>
            <Col span={13}>
              <Statistic title="Happy Users" value={1128} prefix={<LikeOutlined />} />
            </Col>
          </Row>
          <Space direction='vertical' >
            <Typography.Text>Share</Typography.Text>
            <QRCode 
              value={text} 
              icon={image}
              color='green'
              id="myqrcode"
            />
            <Input
              placeholder="-"
              maxLength={60}
              value={text}
              readOnly
              suffix={<CopyFilled />}
            />
          </Space>
        </Space>
      </Card>
      <Typography.Text strong>Frequently Asked Questions(FAQ)</Typography.Text>
      <Collapse items={items} defaultActiveKey={['1']}  style={{
        width: '80%'
      }}/>
    </Space>
  )
}
