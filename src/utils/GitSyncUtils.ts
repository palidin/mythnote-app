import {useGitConfigStore} from '../store/store';
import {toast} from 'react-toastify';
import {myAgent} from '../agent/agentType';

// 同步Git仓库
export async function syncGitRepo() {
  const {repoUrl, authToken, setIsSyncing, setLastSyncTime} = useGitConfigStore.getState();

  if (!repoUrl || !authToken) {
    return;
  }

  setIsSyncing(true);
  try {
    // 调用服务器API进行Git同步
    console.log('开始同步Git仓库:', repoUrl);
    await myAgent.syncGitRepo();

    // 获取同步后的状态，更新最后同步时间
    const now = Date.now();
    setLastSyncTime(now);
    console.log('Git仓库同步成功，最后同步时间:', now);

    // 显示成功消息
    toast.success('Git仓库同步成功');


    location.reload();
  } catch (error) {
    console.error('Git仓库同步失败:', error);

    // 显示错误消息
    toast.error('Git仓库同步失败，请检查配置信息');
  } finally {
    setIsSyncing(false);
  }
}

