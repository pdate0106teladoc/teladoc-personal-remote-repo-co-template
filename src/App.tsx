import "@/styles/globals.scss";
import "@ucc/common-ui/dist/index.css";
import Router from "./router";
import "./styles/globals.scss";
import { Toaster } from "@ucc/common-ui";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Router />
    </>
  );
}

export default App;
