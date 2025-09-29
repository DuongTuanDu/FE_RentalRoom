import { Toaster } from "sonner";
import Routes from "./routes";

const App = () => (
  <>
    <Toaster richColors position="top-right" />
    {Routes}
  </>
);

export default App;
