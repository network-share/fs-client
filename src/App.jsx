import React, { useEffect, useState } from "react";

const App = () => {
  const [data, setData] = useState([]);
  const [currentFolder, setCurrentFolder] = useState([]);

  useEffect(() => {
    fetchData(""); // Start from the root
  }, []);

  const fetchData = async (pathURL) => {
    const apiBaseUrl = `http://${window.location.hostname}:8080`;
    const homeUrl = `${apiBaseUrl}/get-files?filePath=`;
    const apiUrl = pathURL ? homeUrl + pathURL : homeUrl;
    
    try {
      const response = await fetch(apiUrl);
      const result = await response.json();

      if (result) {
        const files = result.files || [];
        const combinedData = files.map((item) => ({
          name: item.name,
          lastModified: new Date(item.lastModified).toLocaleString(),
          size: formatSize(item.size), // Convert size to readable format
          type: item.fileType || "", // Empty if undefined or null
          isDirectory: item.directory,
        }));

        setData(combinedData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const downloadFile = async (item) => {
    try {
        // Construct the full file path dynamically
        const filePath = currentFolder.length > 0 ? `${currentFolder.join("/")}/${item.name}` : item.name;
        const apiBaseUrl = `http://${window.location.hostname}:8080`;
        const apiUrl = `${apiBaseUrl}/download-file?filePath=${encodeURIComponent(filePath)}`;
        
        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error("Failed to download file");

        // Create a Blob from the response
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Create a temporary <a> element to trigger the download
        const a = document.createElement("a");
        a.href = url;
        a.download = item.name; // Use item.name instead of filePath
        document.body.appendChild(a);
        a.click();

        // Cleanup
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Download error:", error);
    }
};


  // Function to format size dynamically
  const formatSize = (size) => {
    if (size === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) + " " + units[i];
  };

  // Handle folder navigation
  const formFolderPath = (item) => {
    if (item.isDirectory) {
      const newFolderPath = [...currentFolder, item.name];
      setCurrentFolder(newFolderPath);
      fetchData(newFolderPath.join("/"));
    }
  };

  // Handle back button click
  const onBackClick = () => {
    if (currentFolder.length > 0) {
      const newFolderPath = currentFolder.slice(0, -1);
      setCurrentFolder(newFolderPath);
      fetchData(newFolderPath.join("/"));
    }
  };

  return (
    <div className="container">
      <h2>File Explorer</h2>
      <button onClick={onBackClick} disabled={currentFolder.length === 0}>
        Back
      </button>
      <p>Current Path: /{currentFolder.join("/")}</p>
      <table border="1">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Last Modified</th>
            <th>Size</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} onClick={() => formFolderPath(item)} id="row">
              <td>{item.isDirectory ? "Folder" : "File"}</td>
              <td>{item.name}</td>
              <td>{item.lastModified}</td>
              <td>{item.size}</td>
              <td>{item.type}</td>
              <td onClick={(e) => e.stopPropagation()}>
                {!item.isDirectory && <button onClick={()=> downloadFile(item)}>Download</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
