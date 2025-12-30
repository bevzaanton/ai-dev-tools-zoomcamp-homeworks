import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def run():
    # Define server parameters to run the MCP server directly
    server_params = StdioServerParameters(
        command="uv",
        args=["run", "python", "main.py"],
        env=None
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # Initialize the connection
            await session.initialize()

            # List available tools to verify connection and tool existence
            tools = await session.list_tools()
            print(f"Connected to server. Available tools: {[tool.name for tool in tools.tools]}")

            # Call the search tool
            query = "how to create a tool"
            print(f"Searching for: '{query}'...")
            result = await session.call_tool("search_docs", arguments={"query": query})
            
            # The result content is usually a list of TextContent
            content = result.content[0].text
            print("Search Results:")
            print(content)

if __name__ == "__main__":
    asyncio.run(run())
