import React, { useRef, useEffect } from 'react';
import WebViewer from '@pdftron/webviewer';
import './App.css';


function App() {
  const viewer = useRef<HTMLDivElement>(null);

  // if using a class, equivalent of componentDidMount 
  useEffect(() => {
    WebViewer(
      {
        path: 'lib',
        initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/webviewer-demo.pdf',
      },
      viewer.current as HTMLDivElement).then((instance) => {
      const { documentViewer, annotationManager, Annotations } = instance.Core;

      // save button to export xfdf string
      instance.UI.setHeaderItems(header => {
        header.push({
          type: "actionButton",
          img: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
          onClick: async () => {
            const export_xfdf = await annotationManager.exportAnnotations({links:false,widgets:false});
            console.log(export_xfdf);
            fetch('http://localhost:5000/annotate', {
              method: 'POST',
              body: export_xfdf // written to a database in the server
            });
          }
        });
      });

      // when document is loaded, import annotations to display
      documentViewer.addEventListener('documentLoaded', () => {
        // Get xfdfString from database
        fetch('http://localhost:5000/getannotation', {
          method: 'GET'
        }).then(response => {
          response.text().then(xfdfString => {
            if(xfdfString != "") {
              annotationManager.importAnnotations(xfdfString);
              console.log("Annotations imported successfully!");
            }
          });
        });
      });
    });
  }, []);

  return (
    <div className="App">
      <div className="header">React sample</div>
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
};

export default App;
