import { Button, Card, Form, Input, Modal } from 'antd'
import React, { useState } from 'react'


const register = () => {
  return (
    <Form>
      <Form.Item label='Username' required>
        <Input placeholder='Username' type='text'/>
      </Form.Item>
      <Form.Item label='Email' required>
        <Input placeholder='Email' type='email'/>
      </Form.Item>
      <Form.Item label='Password' required>
        <Input placeholder='Password' type='password' />
      </Form.Item>
      <Form.Item>
        <Button block type='primary' htmlType='submit'>REGISTER</Button>
      </Form.Item>
    </Form>
  )
}
const login = () => {
  return (
    <Form>
      <Form.Item label='Username or Email' required>
        <Input placeholder='Username' type='email'/>
      </Form.Item>
      <Form.Item label='Password' required>
        <Input placeholder='Password' type='password' />
      </Form.Item>
      <Form.Item>
        <Button block type='primary' htmlType='submit'>LOGIN</Button>
      </Form.Item>
    </Form>
  )
}
const tabList = [
    {
      key: 'login',
      tab: 'Login',
    },
    {
      key: 'register',
      tab: 'register',
    },
  ];
  
  const contentList = {
    login: login(),
    register: register(),
  };
export default function Auth({modalOpen, setModalOpen}) {
    const [activeTabKey1, setActiveTabKey1] = useState('login');
    const onTab1Change = (key) => {
      setActiveTabKey1(key);
    };
  return (
    <Modal
        centered
        open={modalOpen}
        afterClose={() => setModalOpen(false)}
        onOk={() => setModalOpen(false)}
        onCancel={() => setModalOpen(false)}
        width={400}
    >
      <Card
        style={{ width: '100%' }}
        tabList={tabList}
        activeTabKey={activeTabKey1}
        onTabChange={onTab1Change}
      >
        {contentList[activeTabKey1]}
      </Card>
    </Modal>
  )
}
