import os
import requests
import zipfile
import io
import minsearch

def download_file(url, filename):
    if os.path.exists(filename):
        print(f"{filename} already exists, skipping download.")
        return
    
    print(f"Downloading {url}...")
    response = requests.get(url)
    response.raise_for_status()
    with open(filename, 'wb') as f:
        f.write(response.content)
    print("Download complete.")

def load_documents(zip_filename):
    documents = []
    with zipfile.ZipFile(zip_filename, 'r') as z:
        for file_info in z.infolist():
            if file_info.filename.endswith('.md') or file_info.filename.endswith('.mdx'):
                # reading
                with z.open(file_info) as f:
                    content = f.read().decode('utf-8')
                
                # remove first part of path
                # e.g. "fastmcp-main/docs/welcome.mdx" -> "docs/welcome.mdx"
                parts = file_info.filename.split('/', 1)
                if len(parts) > 1:
                    clean_filename = parts[1]
                else:
                    clean_filename = file_info.filename
                
                documents.append({
                    "filename": clean_filename,
                    "content": content
                })
    return documents

def create_index(documents):
    index = minsearch.Index(
        text_fields=["content"],
        keyword_fields=["filename"]
    )
    index.fit(documents)
    return index

def search(index, query):
    results = index.search(
        query=query,
        filter_dict={},
        boost_dict={"filename": 1.5},
        num_results=5
    )
    return results

def main():
    zip_url = "https://github.com/jlowin/fastmcp/archive/refs/heads/main.zip"
    zip_file = "fastmcp-main.zip"
    
    download_file(zip_url, zip_file)
    
    print("Indexing documents...")
    documents = load_documents(zip_file)
    index = create_index(documents)
    print(f"Indexed {len(documents)} documents.")
    
    test_query = "demo"
    print(f"\nSearching for: '{test_query}'")
    results = search(index, test_query)
    
    for i, res in enumerate(results):
        print(f"{i+1}. {res['filename']}")
        # print(res['content'][:100] + "...") 

if __name__ == "__main__":
    main()
