import asyncio
import json
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, ToolMessage

server = {
    # "local_calculator": {
    #     "transport": "stdio",
    #     "command": "C:\\Users\\Alee Bushu\\demo_mcp\\.venv\\Scripts\\fastmcp.exe",
    #     "args": [
    #         "run",
    #         "C:\\Users\\Alee Bushu\\demo_mcp\\main.py"
    #     ]
    # },

    "Gas_refill_cycle" : {
        "transport": "stdio",
        "command": "C:\\Users\\Alee Bushu\\Mcp_server_proj\\.venv\\Scripts\\fastmcp.exe",
        "args": [
            "run",
            "C:\\Users\\Alee Bushu\\Mcp_server_proj\\main.py"
        ]
    },
   
}

async def main():
    client = MultiServerMCPClient(server)
    tools = await client.get_tools()

    print(f"✅ Loaded {len(tools)} tools:")
    for tool in tools:
        print(f"  🔧 {tool.name}")

    llm = ChatOpenAI(
        model="deepseek-chat",
        api_key="sk-11d46b4be3de4095a7608ad08557850a",
        base_url="https://api.deepseek.com/v1",
    )

    llm_with_tool = llm.bind_tools(tools)

    # ── Step 1: Human message ────────────────────────────
    human_msg = HumanMessage(content="Who is the enxt to refill the gas.")

    # ── Step 2: First LLM call → picks a tool ────────────
    response = await llm_with_tool.ainvoke([human_msg])

    if response.tool_calls:
        selected_tool = response.tool_calls[0]['name']
        selected_args = response.tool_calls[0]['args']
        selected_id   = response.tool_calls[0]['id']

        print(f"\n🔧 Selected Tool : {selected_tool}")
        print(f"📦 Selected Args : {selected_args}")

        # ── Step 3: Execute the tool ──────────────────────
        tool_map    = {tool.name: tool for tool in tools}
        tool_result = await tool_map[selected_tool].ainvoke(selected_args)

        print(f"\n📊 Tool Result   : {tool_result}")

        # ── Step 4: Build full message history ────────────
        tool_message = ToolMessage(
            content=json.dumps(tool_result),  # ✅ must be a string
            tool_call_id=selected_id
        )

        # ── Step 5: Send full history back to LLM ─────────
        final_response = await llm_with_tool.ainvoke([
            human_msg,       # 1. original question
            response,        # 2. LLM tool call decisionj
            tool_message     # 3. tool result
        ])

        print(f"\n🤖 Final Answer  : {final_response.content}")

    else:
        print("\n⚠️ No tool was called!")
        print("💬 LLM Response :", response.content)

if __name__ == "__main__":
    asyncio.run(main())