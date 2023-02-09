import { useRef, useEffect } from 'react';
import WebViewer from '@pdftron/webviewer';
import './App.css';


function App() {
  const viewer = useRef<HTMLDivElement>(null);

  // if using a class, equivalent of componentDidMount
  useEffect(() => {
    WebViewer(
      {
        path: 'lib',                            // make sure to have core and ui folder moved to public/lib from node_modules/@pdftron
        initialDoc: 'lib/webviewer-demo.pdf'    // pdf downloaded from: 'https://pdftron.s3.amazonaws.com/downloads/pl/webviewer-demo.pdf'
      },
      viewer.current as HTMLDivElement).then((instance) => {
      const { documentViewer, annotationManager, Annotations } = instance.Core;
      
      // assign studentId for the pdf annotation
      let studentId = 1;

      // save button to export xfdf string
      instance.UI.setHeaderItems(header => {
        header.push({
          type: "actionButton",
          img: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
          
          onClick: async () => {
            const export_xfdf = await annotationManager.exportAnnotations({links:false,widgets:false});
            console.log(export_xfdf);

            fetch('http://localhost:5000/annotation/add/' + studentId, {
              method: 'POST',
              body: export_xfdf // written to a database in the server
            });

          }
        });
      });


      // when document is loaded, import annotations to display
      documentViewer.addEventListener('documentLoaded', () => {
        // Get xfdfString from database
        fetch('http://localhost:5000/annotation/get/' + studentId, {
          method: 'GET'
        }).then(response => {

          response.text().then(jsonString => {

            if(jsonString != "null") {
              let xfdfString = JSON.parse(jsonString).string;
              annotationManager.importAnnotations(xfdfString);
              console.log(xfdfString);
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
