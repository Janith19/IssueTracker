import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "../src/LoginPage/page";
import RegisterPage from "../src/Register/page";
import IssueList from "../src/IssuePage/page";
import IssueDetail from "../src/IssuePage/detail";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<IssueList />} />
          <Route path="/issues/:id" element={<IssueDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
