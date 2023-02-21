import {myAgent} from "./agentType";
import {store} from "../store/store";
import {delayRun} from "../utils/utils";

class TokenManger {
  getToken() {
    return localStorage.getItem('token')
  }

  refreshToken() {
    if (store.tokenRefreshing) {
      return Promise.resolve();
    }
    store.tokenRefreshing = true;
    return myAgent.login('palidin', '123456')
      .then(res => {
        localStorage.setItem('token', res.access_token);
      })
      .catch(e => alert('登录失败'))
      .finally(() => {
        store.tokenRefreshing = false;
      })
  }


  tokenTaskLoop() {
    if (!store.tokenRefreshing) {
      return Promise.resolve();
    }

    return delayRun().then(() => this.tokenTaskLoop());
  }
}

export const tokenManger = new TokenManger();
