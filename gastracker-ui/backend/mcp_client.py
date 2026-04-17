import os
import json
from dotenv import load_dotenv
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, ToolMessage

load_dotenv()

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
MCP_SERVER_PATH = os.getenv("MCP_SERVER_PATH")
FASTMCP_EXE_PATH = os.getenv("FASTMCP_EXE_PATH")

server_config = {
    "gas_tracker": {
        "transport": "stdio",
        "command": FASTMCP_EXE_PATH,
        "args": ["run", MCP_SERVER_PATH]
    }
}

async def ask(message: str) -> dict:
    """
    Takes a natural language message.
    Connects to gas-tracker MCP server via stdio.
    Uses DeepSeek to pick and call the right tool.
    Returns answer + tool metadata.
    """
    try:
        client = MultiServerMCPClient(server_config)
        tools = await client.get_tools()

        llm = ChatOpenAI(
            model="deepseek-chat",
            api_key=DEEPSEEK_API_KEY,
            base_url="https://api.deepseek.com/v1",
        )
        llm_with_tools = llm.bind_tools(tools)

        # 1. LLM call to pick tool
        human_msg = HumanMessage(content=message)
        response = await llm_with_tools.ainvoke([human_msg])

        if response.tool_calls:
            tool_call = response.tool_calls[0]
            selected_tool = tool_call['name']
            selected_args = tool_call['args']
            selected_id = tool_call['id']

            # 2. Execute tool
            tool_map = {tool.name: tool for tool in tools}
            raw_result = await tool_map[selected_tool].ainvoke(selected_args)

            # Extract result text (spec says it's a list with a dict)
            tool_result_text = ""
            if isinstance(raw_result, list) and len(raw_result) > 0 and 'text' in raw_result[0]:
                tool_result_text = raw_result[0]['text']
            else:
                tool_result_text = str(raw_result)

            # 3. Final LLM call for conversational answer
            tool_message = ToolMessage(
                content=json.dumps(raw_result),
                tool_call_id=selected_id
            )
            
            final_response = await llm_with_tools.ainvoke([
                human_msg,
                response,
                tool_message
            ])

            return {
                "answer": final_response.content,
                "tool_used": selected_tool,
                "tool_args": selected_args,
                "tool_result": tool_result_text
            }
        
        else:
            return {
                "answer": response.content,
                "tool_used": None,
                "tool_args": {},
                "tool_result": ""
            }

    except Exception as e:
        return {"error": str(e), "answer": None}
