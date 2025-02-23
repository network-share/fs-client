import React, { useEffect, useState } from "react";

const App = () => {
  const [data, setData] = useState([]);
  let set = new Set();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (pathURL) => {
    const homeUrl = "http://localhost:8080/get-files?filePath=";
    const apiUrl = pathURL? homeUrl+pathURL : homeUrl;
    const response = await fetch(apiUrl);
    const result = await response.json();

    if (result) {
      const files = result.files || [];
      const combinedData = [...files].map((item) => ({
        name: item.name,
        lastModified: new Date(item.lastModified).toLocaleString(),
        size: formatSize(item.size), // Convert size to readable format
        type: item.fileType || "", // Empty if undefined or null
        isDirectory:item.directory
      }));

      setData(combinedData);
    }
  };


  // Function to format size dynamically
  const formatSize = (size) => {
    if (size === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) + " " + units[i];
  };

  const formFolderPath = (item) => {
    if (item.isDirectory) {
      set.add(item.name + '/');
      fetchData([...set].join(""));
    }
  }

  const onBackClick = ()=>{
    if(set.size>0){
      set = new Set([...set].slice(0,-1));
    }
    fetchData([...set].join(""));
  }

  return (
    <div className="container">
      <h2>File Explorer</h2>
      <button onClick={()=>onBackClick()}>Back</button>
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
            <tr key={index} 
            onClick={()=> formFolderPath(item)}
            id="row"
            >
              <td>{item.isDirectory?"Folder":"File"}</td>
              <td>{item.name}</td>
              <td>{item.lastModified}</td>
              <td>{item.size}</td>
              <td>{item.type}</td>
              <td onClick ={(e)=>e.stopPropagation()}><button >Button</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;