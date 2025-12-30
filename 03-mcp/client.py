import asyncio
import sys
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

            # Call the scrape tool
            url = "https://datatalks.club/"
            print(f"Scraping {url}...")
            result = await session.call_tool("scrape", arguments={"url": url})
            
            # The result content is usually a list of TextContent or ImageContent
            # We assume it returns text.
            content = result.content[0].text
            
            # Count "data"
            count = content.lower().count("data")
            print(f"Content length: {len(content)}")
            print(f"The word 'data' appears {count} times.")

if __name__ == "__main__":
    asyncio.run(run())
