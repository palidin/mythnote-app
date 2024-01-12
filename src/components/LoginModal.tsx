import React, {useState} from 'react';
import {myAgent} from "$source/agent/agentType";
import {useTokenStore} from "$source/store/store";
import {showErrorMessage} from "$source/utils/MessageUtils";

import './LoginModal.scss';

export function LoginModal() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // 这里添加登录逻辑，例如调用API进行身份验证

    myAgent.login(username, password)
      .then(res => {
        useTokenStore.getState().setToken(res.access_token);
      })
      .catch(e => {
        showErrorMessage(e)
      })
  };

  return (

      <div>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">用户名:</label>
            <input
              type="username"
              id="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password">密码:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button type="submit">登录</button>
          </div>
        </form>
      </div>

  );
}



