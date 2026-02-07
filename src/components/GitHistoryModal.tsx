import React, {useEffect, useState, useCallback} from 'react';
import {myAgent} from '../agent/agentType';
import {showErrorMessage} from '../utils/MessageUtils';


/* ======================= 类型定义 ======================= */

export interface GitCommitInfo {
  id: string;
  message: string;
  author: string;
  authorEmail: string;
  date: string;
  shortId: string;
}

export interface GitCommitDetail extends GitCommitInfo {
  content: string;
  diff: string;
  parentIds: string[];
}

interface GitHistoryModalProps {
  path: string;
  onClose: () => void;
}

const LIMIT = 15;
const badgeClass =
  'text-[10px] font-mono uppercase tracking-wide text-slate-400';

/* ======================= 主组件 ======================= */

export function GitHistoryModal({path, onClose}: GitHistoryModalProps) {
  const [listState, setListState] = useState({
    items: [] as GitCommitInfo[],
    loading: true,
    loadingMore: false,
    page: 1,
    total: 0,
    isAtBottom: false,
  });

  const [detailState, setDetailState] = useState({
    selectedId: null as string | null,
    data: null as GitCommitDetail | null,
    loading: false,
    showFullContent: false,
  });

  /* ----------------------- 数据加载 ----------------------- */

  const loadCommits = useCallback(async (pageNum: number, append = false) => {
    try {
      setListState(prev => ({
        ...prev,
        [append ? 'loadingMore' : 'loading']: true,
      }));

      const data = await myAgent.getGitCommitList(path, pageNum, LIMIT);

      setListState(prev => ({
        ...prev,
        items: append ? [...prev.items, ...data.items] : data.items,
        page: data.page,
        total: data.total,
        isAtBottom: data.page * LIMIT >= data.total,
        loading: false,
        loadingMore: false,
      }));
    } catch (e) {
      showErrorMessage(e);
      setListState(prev => ({...prev, loading: false, loadingMore: false}));
    }
  }, [path]);

  const loadCommitDetail = useCallback(async (commitId: string) => {
    if (detailState.selectedId === commitId) return;

    setDetailState(prev => ({
      ...prev,
      selectedId: commitId,
      loading: true,
      showFullContent: false,
    }));

    try {
      const data = await myAgent.getGitCommitDetail(path, commitId);
      setDetailState(prev => ({...prev, data, loading: false}));
    } catch (e) {
      showErrorMessage(e);
      setDetailState(prev => ({...prev, loading: false}));
    }
  }, [path, detailState.selectedId]);

  useEffect(() => {
    loadCommits(1);
  }, [loadCommits]);

  /* ======================= UI ======================= */

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6">
      <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex">

        {/* 左侧列表 */}
        <aside className="w-80 shrink-0 bg-slate-50 border-r border-slate-200 flex flex-col">
          <header className="p-5 bg-white border-b border-slate-100">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-800">
              <span className="w-1.5 h-5 bg-primary-600 rounded-full"/>
              版本历史
            </h2>
            <code className="block mt-3 text-[10px] p-2 rounded-lg bg-slate-100 text-slate-500 truncate border border-slate-200">
              {path}
            </code>
          </header>

          <div className="flex-1 overflow-y-auto py-2">
            {listState.loading ? (
              <LoadingSkeleton/>
            ) : (
              listState.items.map(commit => (
                <CommitRow
                  key={commit.id}
                  commit={commit}
                  isActive={detailState.selectedId === commit.id}
                  onSelect={() => loadCommitDetail(commit.id)}
                />
              ))
            )}

            {!listState.isAtBottom && (
              <button
                disabled={listState.loadingMore}
                onClick={() => loadCommits(listState.page + 1, true)}
                className="w-full py-3 text-xs font-semibold text-primary-600 hover:bg-primary-50 disabled:opacity-50"
              >
                {listState.loadingMore ? '正在载入…' : '加载更早的提交'}
              </button>
            )}
          </div>
        </aside>

        {/* 右侧详情 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {detailState.loading ? (
            <DetailLoadingSpinner/>
          ) : detailState.data ? (
            <div className="flex flex-col h-full animate-in slide-in-from-right-2 duration-300">

              {/* Header */}
              <header className="px-8 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-1 rounded-md bg-slate-900 text-white text-[10px] font-mono">
                    {detailState.data.shortId}
                  </span>
                  <h1 className="text-lg font-bold text-slate-800">
                    {detailState.data.message}
                  </h1>
                </div>
                <div className="flex gap-6 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{detailState.data.author}</span>
                  <span>{new Date(detailState.data.date).toLocaleString('zh-CN')}</span>
                </div>
              </header>

              {/* 内容 */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30">

                {/* Diff */}
                <section>
                  <SectionHeader title="变更详情"/>
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm ring-1 ring-slate-950/5">
                    <DiffViewer diff={detailState.data.diff}/>
                  </div>
                </section>

                {/* 完整代码 */}
                <section>
                  <div
                    onClick={() =>
                      setDetailState(p => ({...p, showFullContent: !p.showFullContent}))
                    }
                    className="cursor-pointer flex justify-between items-center p-3 bg-white border border-slate-200 rounded-xl hover:border-primary-400 transition"
                  >
                    <span className="text-sm font-semibold text-slate-700">
                      查看变更之前完整版本
                    </span>
                    <span className={badgeClass}>
                      {detailState.showFullContent ? '收起' : '展开'}
                    </span>
                  </div>

                  {detailState.showFullContent && (
                    <div className="mt-4 bg-slate-50 border border-slate-200/70 rounded-xl overflow-hidden animate-in fade-in zoom-in-95">
                      <div className="px-4 py-2 bg-white border-b border-slate-200 flex justify-between">
                        <span className={badgeClass}>READONLY</span>
                        <span className={badgeClass}>
                          {detailState.data.content.split('\n').length} lines
                        </span>
                      </div>
                      <div className="max-h-[500px] overflow-auto">
                        <CodeBlock content={detailState.data.content}/>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </div>
          ) : (
            <EmptyState/>
          )}
        </main>

        {/* 关闭 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-500 shadow-sm transition-all duration-200 hover:bg-white hover:text-primary-600 hover:shadow-md active:scale-95 group"
          aria-label="Close"
        >
          <div className="relative w-4 h-4">
            <span className="absolute inset-0 m-auto w-full h-0.5 bg-current rounded-full rotate-45 transition-transform group-hover:rotate-[135deg]"></span>
            <span className="absolute inset-0 m-auto w-full h-0.5 bg-current rounded-full -rotate-45 transition-transform group-hover:rotate-[45deg]"></span>
          </div>
        </button>
      </div>
    </div>
  );
}

/* ======================= 子组件 ======================= */

function CommitRow({commit, isActive, onSelect}: any) {
  return (
    <div
      onClick={onSelect}
      className={`relative mx-3 my-0.5 p-3 rounded-xl cursor-pointer transition ${
        isActive
          ? 'bg-primary-600 text-white shadow-md'
          : 'hover:bg-white hover:shadow-sm text-slate-700'
      }`}
    >
      {isActive && (
        <span className="absolute left-0 top-2 bottom-2 w-1 bg-white/80 rounded-r-full"/>
      )}
      <div className="text-[13px] font-semibold truncate">
        {commit.message}
      </div>
      <div className="mt-1 text-[10px] opacity-70 flex justify-between">
        <span>{commit.author}</span>
        <span>{new Date(commit.date).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

/* 修改后的 DiffViewer 组件 */
function DiffViewer({diff}: { diff: string }) {
  if (!diff) {
    return <div className="p-6 text-center text-slate-400 italic bg-slate-50">无变更内容</div>;
  }

  return (
    <div className="font-mono text-[12px] leading-6 py-2 bg-white">
      {diff.split('\n').map((line, i) => {
        const added = line.startsWith('+');
        const removed = line.startsWith('-');
        const meta = line.startsWith('@@');

        return (
          <div
            key={i}
            className={`flex transition-colors ${
              added
                ? 'bg-emerald-50 text-emerald-700'
                : removed
                  ? 'bg-rose-50 text-rose-700'
                  : meta
                    ? 'bg-primary-50 text-primary-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {/* 行号栏 */}
            <span className={`w-12 pr-3 text-right text-[10px]  border-r opacity-60 ${
              added ? 'border-emerald-200' : removed ? 'border-rose-200' : 'border-slate-100'
            }`}>
              {i + 1}
            </span>
            {/* 内容 */}
            <pre className="pl-4 whitespace-pre-wrap break-all select-text">{line}</pre>
          </div>
        );
      })}
    </div>
  );
}

function CodeBlock({content}: { content: string }) {
  return (
    <div className="font-mono text-[12px] text-slate-600 py-3">
      {content.split('\n').map((line, i) => (
        <div key={i} className="flex hover:bg-slate-100">
          <span className="w-12 pr-3 text-right text-slate-300 border-r border-slate-200">
            {i + 1}
          </span>
          <pre className="pl-4 whitespace-pre-wrap select-text">{line || ' '}</pre>
        </div>
      ))}
    </div>
  );
}

function SectionHeader({title}: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {title}
      </h3>
      <div className="flex-1 h-px bg-slate-200"/>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
      请选择一个提交查看详情
    </div>
  );
}

function DetailLoadingSpinner() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin"/>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-5 space-y-3">
      {Array.from({length: 6}).map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-slate-200/60 animate-pulse"/>
      ))}
    </div>
  );
}
