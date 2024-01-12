import React, {useState} from 'react';
import {myAgent} from "$source/agent/agentType";
import {useTokenStore} from "$source/store/store";
import {showErrorMessage, showSuccessMessage} from "$source/utils/MessageUtils";

import './LoginModal.scss';

export function LoginModal() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // 这里添加登录逻辑，例如调用API进行身份验证

    myAgent.login(username, password)
      .then(res => {
        showSuccessMessage('登录成功')

        setTimeout(() => {
          useTokenStore.getState().setToken(res.access_token);
        }, 500)
      })
      .catch(e => {
        showErrorMessage(e)
      })
  };

  return (

    <div className="container">
      <label htmlFor="uname"><b>用户名</b></label>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="输入用户名" name="uname" onChange={e => setUsername(e.target.value)} required/>

        <label htmlFor="psw"><b>密码</b></label>
        <input type="password" placeholder="输入密码" name="psw" onChange={e => setPassword(e.target.value)} required/>

        <button type="submit">登录</button>
      </form>

    </div>

  );
}



