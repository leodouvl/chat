import React from 'react';
import SubForm from '../subscribe/subForm';
import LogForm from '../log/login';
import { useState, useEffect } from 'react';
import { Radio, Layout } from 'antd';
import { useAuth } from '../context/AuthContext';




function AcceuilPage() {
  const [selectedOption, setSelectedOption] = useState('sub');
  const { isRegistered, setIsRegistered } = useAuth();
  const { Header, Content } = Layout;

  useEffect(() => {
    if (isRegistered) {
      setSelectedOption('log');
      setIsRegistered(false); 
    }
  }, [isRegistered, setIsRegistered]);

    

  const handleLogClick = () => {
    setSelectedOption('log');
  };

  const handleSubClick = () => {
    setSelectedOption('sub');
  };

  const handleRadioChange = (e) => {
    setSelectedOption(e.target.value);
    if (e.target.value === 'log') {
      handleLogClick();
    } else if (e.target.value === 'sub') {
      handleSubClick();
    }
  };

  const options = [
    { label: 'Inscription', value: 'sub' },
    { label: 'Connexion', value: 'log' },
  ];

  const choice = (
    <Radio.Group
      block
      options={options}
      value={selectedOption}
      optionType="button"
      buttonStyle="solid"
      onChange={handleRadioChange}
    />
  );

  const headerStyle = {

  };
  const contentStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    maxHeight: '40vh',
    marginTop: '50px',
  };

  const layoutStyle = {
    minHeight: '100vh',
    

  };

  return (
    <Layout style={layoutStyle}>
      <Header style={headerStyle} >
      
      </Header>
      <Content style={contentStyle}>
      {choice}
      {selectedOption === 'sub' && <SubForm />}
      {selectedOption === 'log' && <LogForm />}
      </Content>
    
    </Layout>
    
      
  );

}


export default AcceuilPage;