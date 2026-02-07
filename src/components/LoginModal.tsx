import React, {useState} from 'react';
import {myAgent} from "$source/agent/agentType";
import {useTokenStore} from "$source/store/store";
import {showErrorMessage, showSuccessMessage} from "$source/utils/MessageUtils";


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
          useTokenStore.getState().updateState({...res});
        }, 500)
      })
      .catch(e => {
        showErrorMessage(e)
      })
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-strong">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">MythNote</h1>
        <p className="text-slate-600">欢迎回来，请登录您的账户</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="uname" className="block text-sm font-medium text-slate-700 mb-2">
            用户名
          </label>
          <input
            type="text"
            id="uname"
            placeholder="输入用户名"
            name="uname"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor="psw" className="block text-sm font-medium text-slate-700 mb-2">
            密码
          </label>
          <input
            type="password"
            id="psw"
            placeholder="输入密码"
            name="psw"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-soft hover:shadow-medium"
        >
          登录
        </button>
      </form>
    </div>
  );
}



