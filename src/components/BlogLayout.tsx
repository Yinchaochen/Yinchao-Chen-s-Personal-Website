import { Outlet } from 'react-router-dom';
import BlogAudio from './BlogAudio';

export default function BlogLayout() {
  return (
    <>
      <BlogAudio />
      <Outlet />
    </>
  );
}
