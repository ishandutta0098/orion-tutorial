import streamlit as st
from chat import get_client, stream_response
from config import PAGE_ICON, PAGE_TITLE, AVAILABLE_MODELS
from datetime import datetime

st.set_page_config(page_title=PAGE_TITLE, page_icon=PAGE_ICON)
st.title(f"{PAGE_ICON} {PAGE_TITLE}")

api_key = st.sidebar.text_input("OpenRouter API Key", type="password")

if "messages" not in st.session_state:
    st.session_state.messages = []

message_count = len(st.session_state.messages)
st.sidebar.metric("Messages", message_count)

if st.sidebar.button("Clear Chat"):
    st.session_state.messages = []
    st.rerun()

selected_model = st.sidebar.selectbox(
    "Select Model",
    options=list(AVAILABLE_MODELS.keys()),
    format_func=lambda x: AVAILABLE_MODELS[x]
)

if st.sidebar.button("Export Conversation"):
    if "messages" in st.session_state and st.session_state.messages:
        export_text = ""
        for msg in st.session_state.messages:
            role = msg["role"].capitalize()
            content = msg["content"]
            export_text += f"{role}: {content}\n\n"
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"chat_export_{timestamp}.txt"
        
        st.sidebar.download_button(
            label="Download Chat History",
            data=export_text,
            file_name=filename,
            mime="text/plain"
        )
    else:
        st.sidebar.info("No conversation to export")

if not api_key:
    st.warning("Enter your OpenRouter API key to start.")
    st.stop()

client = get_client(api_key)

for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

if prompt := st.chat_input("Ask me anything..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)
    
    with st.chat_message("assistant"):
        response = st.write_stream(stream_response(client, st.session_state.messages, selected_model))
    
    st.session_state.messages.append({"role": "assistant", "content": response})