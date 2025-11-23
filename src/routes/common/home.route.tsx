import { Route } from "react-router-dom";

import Home from "@/pages/Home";
import PostsPage from "@/pages/PostPage";

export default (
  <>
    <Route index element={<Home />} />
    <Route path="/posts" element={<PostsPage />} />
  </>
);
