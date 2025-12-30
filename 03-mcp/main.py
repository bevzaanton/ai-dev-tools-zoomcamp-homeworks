# server.py
from fastmcp import FastMCP
import requests
import os
import zipfile
import minsearch

mcp = FastMCP("Demo 🚀")

# Search Initialization Logic
def download_file(url, filename):
    if os.path.exists(filename):
        return
    response = requests.get(url)
    response.raise_for_status()
    with open(filename, 'wb') as f:
        f.write(response.content)

def load_documents(zip_filename):
    documents = []
    with zipfile.ZipFile(zip_filename, 'r') as z:
        for file_info in z.infolist():
            if file_info.filename.endswith('.md') or file_info.filename.endswith('.mdx'):
                with z.open(file_info) as f:
                    content = f.read().decode('utf-8')
                parts = file_info.filename.split('/', 1)
                clean_filename = parts[1] if len(parts) > 1 else file_info.filename
                documents.append({
                    "filename": clean_filename,
                    "content": content
                })
    return documents

def create_index():
    zip_url = "https://github.com/jlowin/fastmcp/archive/refs/heads/main.zip"
    zip_file = "fastmcp-main.zip"
    
    download_file(zip_url, zip_file)
    documents = load_documents(zip_file)
    
    index = minsearch.Index(
        text_fields=["content"],
        keyword_fields=["filename"]
    )
    index.fit(documents)
    return index

# Initialize index globally
search_index = create_index()

@mcp.tool
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

@mcp.tool
def scrape(url: str) -> str:
    """Scrape a website and return the content in markdown"""
    response = requests.get(f"https://r.jina.ai/{url}")
    return response.text

@mcp.tool
def search_docs(query: str) -> str:
    """Search FastMCP documentation. Returns the top 5 relevant file names and snippets."""
    results = search_index.search(
        query=query,
        filter_dict={},
        boost_dict={"filename": 1.5},
        num_results=5
    )
    
    output = []
    for res in results:
        # Create a snippet (first 200 chars or reasonable snippet)
        snippet = res['content'][:500].replace('\n', ' ') + "..."
        output.append(f"File: {res['filename']}\nSnippet: {snippet}\n")
    
    return "\n---\n".join(output)

if __name__ == "__main__":
    mcp.run()