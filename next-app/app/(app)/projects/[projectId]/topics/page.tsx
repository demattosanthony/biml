import { TopicList } from "@/components/topics/topic-list";
import { sampleTopics } from "@/data/sampleData";

export default function TopicsPage() {
  return (
    <div className="container max-w-5xl py-6">
      <h1 className="text-2xl font-bold mb-6">Topics</h1>
      <TopicList topics={sampleTopics} />
    </div>
  );
}
