"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Topic } from "@/types/comments";

interface TopicListProps {
  topics: Topic[];
}

export function TopicList({ topics }: TopicListProps) {
  return (
    <div className="divide-y divide-border rounded-lg border">
      {topics.map((topic) => (
        <div
          key={topic.guid}
          className="flex items-center gap-4 p-4 hover:bg-muted/50"
        >
          <Checkbox />
          <div className="relative flex-1">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  topic.topic_status === "open" ? "secondary" : "outline"
                }
                className={
                  topic.topic_status === "open"
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                    : ""
                }
              >
                {topic.topic_status === "open" ? "Open" : "Closed"}
              </Badge>
              <Link
                href={`/projects/1/topics/${topic.guid}`}
                replace={false}
                className="font-medium hover:underline"
              >
                {topic.title}
              </Link>
              <span className="text-muted-foreground">
                #{topic.server_assigned_id}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              opened {new Date(topic.creation_date).toLocaleDateString()} by{" "}
              {topic.creation_author}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-muted-foreground">
              {topic.priority === "high" && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              {topic.priority === "medium" && (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              {topic.priority === "low" && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
              <span className="text-sm capitalize">{topic.priority}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">2</span>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={`https://avatar.vercel.sh/${topic.assigned_to}`}
              />
              <AvatarFallback>
                {topic.assigned_to?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      ))}
    </div>
  );
}
