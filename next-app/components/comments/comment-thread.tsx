"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Comment } from "@/types/comments";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bold,
  Code,
  Heading,
  ImageIcon,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Quote,
  Undo2,
} from "lucide-react";

interface CommentThreadProps {
  comments: Comment[];
  topicId: string;
  onAddComment: (comment: string) => void;
}

export function CommentThread({
  comments,
  topicId,
  onAddComment,
}: CommentThreadProps) {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment("");
  };

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <Card key={comment.guid} className="p-4">
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage src={`https://avatar.vercel.sh/${comment.author}`} />
              <AvatarFallback>
                {comment.author.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{comment.author}</span>
                <span className="text-sm text-muted-foreground">
                  commented on {new Date(comment.date).toLocaleString()}
                </span>
              </div>
              <p className="mt-2 text-sm">{comment.comment}</p>
            </div>
          </div>
        </Card>
      ))}

      <Card className="p-4">
        <Tabs defaultValue="write" className="w-full">
          <TabsList className="mb-4 w-full justify-start">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="write" className="mt-0">
            <div className="mb-4 flex flex-wrap gap-2 border-b pb-4">
              <Button variant="outline" size="icon">
                <Bold className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Italic className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <LinkIcon className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Quote className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Code className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Heading className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <List className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Undo2 className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              placeholder="Leave a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={6}
              className="mb-4"
            />
          </TabsContent>
          <TabsContent value="preview" className="mt-0">
            {newComment ? (
              <div className="min-h-[150px] rounded-lg border p-4">
                {newComment}
              </div>
            ) : (
              <div className="min-h-[150px] rounded-lg border p-4 text-muted-foreground">
                Nothing to preview
              </div>
            )}
          </TabsContent>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSubmit}>Comment</Button>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
