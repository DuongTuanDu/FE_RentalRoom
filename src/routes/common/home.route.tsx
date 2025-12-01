import { Route } from "react-router-dom";

import Home from "@/pages/Home";
import PostsPage from "@/pages/PostPage";
import config from "@/config/config";
import { lazyLoad } from "@/utils/lazyLoad";

export default (
  <>
    <Route index element={<Home />} />
    <Route path="/posts" element={<PostsPage />} />
    <Route
      path={config.postDetailUserPath}
      element={lazyLoad(() => import("@/pages/PostDetail/PostDetailResident"))}
    />
  </>
);
