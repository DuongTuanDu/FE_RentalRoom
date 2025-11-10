import { useState, useEffect, useCallback } from 'react';
import type { IPost } from '@/types/post';

const STORAGE_KEY = 'viewedPosts';
const MAX_VIEWED_POSTS = 12;

export const useViewedPosts = () => {
  const [viewedPosts, setViewedPosts] = useState<IPost[]>([]);

  // Đọc dữ liệu từ localStorage khi component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setViewedPosts(parsed);
      }
    } catch (error) {
      console.error('Error loading viewed posts:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Thêm bài đăng vào danh sách đã xem
  const addViewedPost = useCallback((post: IPost) => {
    setViewedPosts((prevPosts) => {
      // Loại bỏ bài đăng nếu đã tồn tại (tránh trùng lặp)
      const filteredPosts = prevPosts.filter(p => p._id !== post._id);
      
      // Thêm bài mới vào đầu mảng (LIFO)
      const newPosts = [post, ...filteredPosts];
      
      // Giới hạn tối đa 12 bài đăng
      const limitedPosts = newPosts.slice(0, MAX_VIEWED_POSTS);
      
      // Lưu vào localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedPosts));
      } catch (error) {
        console.error('Error saving viewed posts:', error);
      }
      
      return limitedPosts;
    });
  }, []);

  // Xóa toàn bộ lịch sử (optional)
  const clearViewedPosts = useCallback(() => {
    setViewedPosts([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { viewedPosts, addViewedPost, clearViewedPosts };
};