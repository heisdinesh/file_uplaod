import logo from "./logo.svg";
import "./App.css";
import FileUpload from "./FileUpload";

function App() {
  return (
    <div className="App">
      <FileUpload
        key="DRIVING_LOC_IMAGE"
        userId="DSCDSCDS"
        maxFilesPerCategory={324}
        category="DRIVING_LOC_IMAGE"
        images={[]}
        onChange={() => {}}
      />
    </div>
  );
}

export default App;
