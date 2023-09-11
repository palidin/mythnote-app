import {myAgent} from "./agentType";
import {delayRun} from "../utils/utils";
import {sharedVariables} from "../store/globalData";
import {showErrorMessage} from "$source/utils/MessageUtils";

class TokenManger {
  getToken() {
    return localStorage.getItem('token')
  }

  refreshToken() {
    if (sharedVariables.tokenRefreshing) {
      return Promise.resolve();
    }
    sharedVariables.tokenRefreshing = true;
    return myAgent.login('palidin', '123456')
      .then(res => {
        localStorage.setItem('token', res.access_token);
      })
      .catch(e => showErrorMessage('登录失败'))
      .finally(() => {
        sharedVariables.tokenRefreshing = false;
      })
  }

  tokenTaskLoop() {
    if (!sharedVariables.tokenRefreshing) {
      return Promise.resolve();
    }

    return delayRun().then(() => this.tokenTaskLoop());
  }
}

export const tokenManger = new TokenManger();
