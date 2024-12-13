import { Topic } from "@/types/comments";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TopicDetailsProps {
  topic: Topic;
}

export function TopicDetails({ topic }: TopicDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">{topic.title}</CardTitle>
          <Badge
            variant={topic.topic_status === "open" ? "secondary" : "outline"}
          >
            {topic.topic_status}
          </Badge>
        </div>
        <CardDescription>
          {topic.server_assigned_id} opened on{" "}
          {new Date(topic.creation_date).toLocaleDateString()} by{" "}
          {topic.creation_author}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Type:</span>
            <span>{topic.topic_type}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Priority:</span>
            <Badge variant="outline">{topic.priority}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Assigned to:</span>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={`https://avatar.vercel.sh/${topic.assigned_to}`}
                />
                <AvatarFallback>
                  {topic.assigned_to?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{topic.assigned_to}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="font-semibold">Labels:</span>
            {topic.labels.map((label) => (
              <Badge key={label} variant="secondary">
                {label}
              </Badge>
            ))}
          </div>
          <div>
            <span className="font-semibold">Description:</span>
            <p className="mt-1">{topic.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
