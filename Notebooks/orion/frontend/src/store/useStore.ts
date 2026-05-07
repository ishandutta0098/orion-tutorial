import { create } from 'zustand'
import { FileNode, OpenFile, ChatMessage, AgentTask, PendingReview, Checkpoint, ModelInfo } from '../types'

interface AppState {
  apiKey: string
  setApiKey: (key: string) => void
  selectedModel: string
  setSelectedModel: (model: string) => void
  availableModels: ModelInfo[]
  setAvailableModels: (models: ModelInfo[]) => void

  sidebarView: 'files' | 'agent' | 'rules' | 'timetravel'
  setSidebarView: (view: 'files' | 'agent' | 'rules' | 'timetravel') => void
  sidebarOpen: boolean
  toggleSidebar: () => void

  files: FileNode[]
  setFiles: (files: FileNode[]) => void
  openFiles: OpenFile[]
  activeFileIndex: number
  openFile: (path: string, name: string, content: string) => void
  closeFile: (index: number) => void
  setActiveFile: (index: number) => void
  updateFileContent: (index: number, content: string) => void

  chatMessages: ChatMessage[]
  addChatMessage: (msg: Partial<ChatMessage> & { role: string; content: string }) => void
  appendToLastMessage: (content: string) => void
  clearChat: () => void
  chatLoading: boolean
  setChatLoading: (loading: boolean) => void

  terminalHistory: string[]
  addTerminalOutput: (output: string) => void
  clearTerminal: () => void
  terminalVisible: boolean
  toggleTerminal: () => void

  agentStatus: 'idle' | 'planning' | 'coding' | 'reviewing' | 'waiting_approval' | 'applying' | 'testing' | 'done' | 'error'
  setAgentStatus: (status: AppState['agentStatus']) => void
  agentPlan: string | null
  setAgentPlan: (plan: string | null) => void
  agentTasks: AgentTask[]
  setAgentTasks: (tasks: AgentTask[] | ((prev: AgentTask[]) => AgentTask[])) => void
  pendingReview: PendingReview | null
  setPendingReview: (review: PendingReview | null) => void
  threadId: string
  setThreadId: (id: string) => void

  checkpoints: Checkpoint[]
  setCheckpoints: (checkpoints: Checkpoint[]) => void

  rules: string
  setRules: (rules: string) => void

  chatPanelOpen: boolean
  toggleChatPanel: () => void
}

function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    py: 'python', js: 'javascript', ts: 'typescript', tsx: 'typescriptreact',
    jsx: 'javascriptreact', json: 'json', md: 'markdown', css: 'css',
    html: 'html', yml: 'yaml', yaml: 'yaml', sh: 'shell', txt: 'plaintext'
  }
  return map[ext || ''] || 'plaintext'
}

const useStore = create<AppState>((set, get) => ({
  apiKey: '',
  setApiKey: (key) => set({ apiKey: key }),
  selectedModel: 'openai/gpt-4o-mini',
  setSelectedModel: (model) => set({ selectedModel: model }),
  availableModels: [],
  setAvailableModels: (models) => set({ availableModels: models }),

  sidebarView: 'files',
  setSidebarView: (view) => set({ sidebarView: view }),
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  files: [],
  setFiles: (files) => set({ files }),
  openFiles: [],
  activeFileIndex: -1,
  openFile: (path, name, content) => {
    const state = get()
    const existingIndex = state.openFiles.findIndex(f => f.path === path)
    if (existingIndex >= 0) {
      set({ activeFileIndex: existingIndex })
      return
    }
    const newFile: OpenFile = { path, name, content, language: getLanguageFromPath(path), modified: false }
    set({ openFiles: [...state.openFiles, newFile], activeFileIndex: state.openFiles.length })
  },
  closeFile: (index) => {
    const state = get()
    const newFiles = state.openFiles.filter((_, i) => i !== index)
    let newActive = state.activeFileIndex
    if (index <= state.activeFileIndex) {
      newActive = Math.max(0, state.activeFileIndex - 1)
    }
    if (newFiles.length === 0) newActive = -1
    set({ openFiles: newFiles, activeFileIndex: newActive })
  },
  setActiveFile: (index) => set({ activeFileIndex: index }),
  updateFileContent: (index, content) => set((s) => ({
    openFiles: s.openFiles.map((f, i) => i === index ? { ...f, content, modified: true } : f)
  })),

  chatMessages: [],
  addChatMessage: (msg) => set((s) => ({
    chatMessages: [...s.chatMessages, {
      id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp || Date.now(),
      isStreaming: msg.isStreaming,
      toolCalls: msg.toolCalls,
    } as ChatMessage]
  })),
  appendToLastMessage: (content) => set((s) => {
    const msgs = [...s.chatMessages]
    if (msgs.length > 0) {
      const last = { ...msgs[msgs.length - 1] }
      last.content += content
      msgs[msgs.length - 1] = last
    }
    return { chatMessages: msgs }
  }),
  clearChat: () => set({ chatMessages: [] }),
  chatLoading: false,
  setChatLoading: (loading) => set({ chatLoading: loading }),

  terminalHistory: ['Welcome to Orion Terminal\n$ '],
  addTerminalOutput: (output) => set((s) => ({ terminalHistory: [...s.terminalHistory, output] })),
  clearTerminal: () => set({ terminalHistory: ['$ '] }),
  terminalVisible: true,
  toggleTerminal: () => set((s) => ({ terminalVisible: !s.terminalVisible })),

  agentStatus: 'idle',
  setAgentStatus: (status) => set({ agentStatus: status }),
  agentPlan: '',
  setAgentPlan: (plan) => set({ agentPlan: plan }),
  agentTasks: [],
  setAgentTasks: (tasks) => {
    if (typeof tasks === 'function') {
      set((s) => ({ agentTasks: tasks(s.agentTasks) }))
    } else {
      set({ agentTasks: tasks })
    }
  },
  pendingReview: null,
  setPendingReview: (review) => set({ pendingReview: review }),
  threadId: `thread-${Date.now()}`,
  setThreadId: (id) => set({ threadId: id }),

  checkpoints: [],
  setCheckpoints: (checkpoints) => set({ checkpoints }),

  rules: '',
  setRules: (rules) => set({ rules }),

  chatPanelOpen: true,
  toggleChatPanel: () => set((s) => ({ chatPanelOpen: !s.chatPanelOpen })),
}))

export default useStore
