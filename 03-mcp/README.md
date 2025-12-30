# AI Dev Tools Zoomcamp - MCP Homework

This project demonstrates a Model Context Protocol (MCP) server implemented using `fastmcp`. It exposes tools for basic operations, web scraping, and documentation search.

## Features

The MCP server (`main.py`) provides the following tools:

-   **`add`**: Adds two numbers together.
-   **`scrape`**: Scrapes the content of a given URL and returns it as Markdown (uses Jina Reader).
-   **`search_docs`**: Searches the FastMCP documentation for relevant information using a local MinSearch index.

## Prerequisites

-   Python 3.12+
-   [uv](https://github.com/astral-sh/uv) (for dependency management)

## Setup

1.  **Clone the repository:**
    (If you haven't already)

2.  **Install dependencies:**
    ```bash
    uv sync
    ```
    Or simply let `uv run` handle it.

## Usage

### Running the Server

To start the MCP server:

```bash
uv run python main.py
```

### Running the Client

To test the server using the provided client script:

```bash
uv run python client.py
```

The client script connects to the server and demonstrates the usage of available tools.

## Search Functionality

The `search_docs` tool automatically downloads the FastMCP documentation (if not present), indexes it, and allows semantic search queries. This logic is integrated into `main.py`.
