import { Route } from "react-router-dom";
import PostsPage from "@/pages/PostPage/PostPage";   
import AboutUsPage from "@/pages/About-us";       

export default (
  <>
    <Route path="/posts" element={<PostsPage />} />

    <Route path="/about-us" element={<AboutUsPage />} />
  </>
);