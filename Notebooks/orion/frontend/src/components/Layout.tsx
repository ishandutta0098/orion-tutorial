import { useEffect } from 'react'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import useStore from '../store/useStore'
import { fetchFiles, fetchModels } from '../api/client'
import ActivityBar from './ActivityBar'
import FileExplorer from './FileExplorer'
import AgentPanel from './AgentPanel'
import RulesEditor from './RulesEditor'
import TimeTravel from './TimeTravel'
import EditorTabs from './EditorTabs'
import CodeEditor from './CodeEditor'
import ChatPanel from './ChatPanel'
import Terminal from './Terminal'
import ReviewDialog from './ReviewDialog'

function SidebarContent() {
  const { sidebarView } = useStore()
  switch (sidebarView) {
    case 'files': return <FileExplorer />
    case 'agent': return <AgentPanel />
    case 'rules': return <RulesEditor />
    case 'timetravel': return <TimeTravel />
  }
}

export default function Layout() {
  const { sidebarOpen, terminalVisible, chatPanelOpen } = useStore()

  useEffect(() => {
    fetchFiles()
      .then((data) => {
        const files = Array.isArray(data) ? data : data.files || []
        useStore.getState().setFiles(files)
      })
      .catch(() => {})

    fetchModels()
      .then((data) => {
        const models = Array.isArray(data) ? data : data.models || []
        useStore.getState().setAvailableModels(models)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-orion-bg-primary">
      <ActivityBar />

      {sidebarOpen && (
        <div className="w-[260px] bg-orion-bg-secondary border-r border-orion-border flex-shrink-0 overflow-hidden">
          <SidebarContent />
        </div>
      )}

      <PanelGroup direction="horizontal" className="flex-1">
        <Panel defaultSize={chatPanelOpen ? 70 : 100} minSize={30}>
          <div className="h-full flex flex-col">
            <PanelGroup direction="vertical">
              <Panel defaultSize={terminalVisible ? 70 : 100} minSize={20}>
                <div className="h-full flex flex-col">
                  <EditorTabs />
                  <CodeEditor />
                </div>
              </Panel>

              {terminalVisible && (
                <>
                  <PanelResizeHandle className="h-[2px] bg-orion-border hover:bg-orion-accent-blue transition-colors cursor-row-resize" />
                  <Panel defaultSize={30} minSize={10} maxSize={50}>
                    <Terminal />
                  </Panel>
                </>
              )}
            </PanelGroup>
          </div>
        </Panel>

        {chatPanelOpen && (
          <>
            <PanelResizeHandle className="w-[2px] bg-orion-border hover:bg-orion-accent-blue transition-colors cursor-col-resize" />
            <Panel defaultSize={30} minSize={15} maxSize={50}>
              <ChatPanel />
            </Panel>
          </>
        )}
      </PanelGroup>

      <ReviewDialog />
    </div>
  )
}
