"use client";

import { TopicDetails } from "@/components/topics/topic-details";
import { CommentThread } from "@/components/comments/comment-thread";
import { useState, useEffect } from "react";
import type { Comment, Topic } from "@/types/comments";
import { sampleTopics, sampleComments } from "@/data/sampleData";

export default function TopicPage({ params }: { params: { id: string } }) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const foundTopic = sampleTopics.find((t) => t.guid === params.id);
    if (foundTopic) {
      setTopic(foundTopic);
      setComments(sampleComments.filter((c) => c.topic_guid === params.id));
    }
  }, [params.id]);

  const handleAddComment = (comment: string) => {
    const newComment: Comment = {
      guid: `C${comments.length + 1}`,
      date: new Date().toISOString(),
      author: "CurrentUser@example.com",
      comment: comment,
      topic_guid: params.id,
    };
    setComments((prevComments) => [...prevComments, newComment]);
  };

  if (!topic) {
    return <div>Topic not found</div>;
  }

  return (
    <div className="container max-w-6xl py-6">
      <TopicDetails topic={topic} />
      <h2 className="text-2xl font-bold mt-8 mb-4">Comments</h2>
      <CommentThread
        comments={comments}
        topicId={params.id}
        onAddComment={handleAddComment}
      />
    </div>
  );
}
