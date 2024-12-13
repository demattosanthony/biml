import { TopicList } from "@/components/topics/topic-list";
import { sampleTopics } from "@/data/sampleData";

export default function TopicsPage() {
  return (
    <div className="container max-w-6xl py-6">
      <h1 className="text-3xl font-bold mb-6">Topics</h1>
      <TopicList topics={sampleTopics} />
    </div>
  );
}
