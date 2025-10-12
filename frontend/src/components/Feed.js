import React from "react";
import PostCard from './PostCard';

export default function Feed({ posts }) {
  return (
    <div className="feed">
      {posts.map(p => (
        <PostCard key={p._id || p.id} post={p} />
      ))}
    </div>
  );
}
