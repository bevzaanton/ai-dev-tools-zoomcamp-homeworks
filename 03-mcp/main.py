# server.py
from fastmcp import FastMCP
import requests

mcp = FastMCP("Demo 🚀")

@mcp.tool
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

@mcp.tool
def scrape(url: str) -> str:
    """Scrape a website and return the content in markdown"""
    response = requests.get(f"https://r.jina.ai/{url}")
    return response.text

if __name__ == "__main__":
    mcp.run()