import { Calendar, GitPullRequest, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProjectSidebar() {
  return (
    <div className="space-y-6">
      {/* Project Status */}
      <Card className="p-4">
        <h2 className="font-semibold mb-4">Project Status</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Design Development</span>
              <span>45%</span>
            </div>
            <Progress value={45} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Start Date</div>
              <div>Jan 15, 2024</div>
            </div>
            <div>
              <div className="text-muted-foreground">Target Completion</div>
              <div>Dec 31, 2024</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Project Team */}
      <Card className="p-4">
        <h2 className="font-semibold mb-4">Project Team</h2>
        <div className="space-y-4">
          {projectTeam.map((member) => (
            <div key={member.name} className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={member.avatar} />
                <AvatarFallback>{member.initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{member.name}</div>
                <div className="text-sm text-muted-foreground">
                  {member.role}
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full">
            <Users className="h-4 w-4 mr-2" />
            View All Members
          </Button>
        </div>
      </Card>

      {/* Project Activity */}
      <Card className="p-4">
        <h2 className="font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex gap-3 text-sm">
              <activity.icon className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <div>{activity.description}</div>
                <div className="text-muted-foreground">{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

const projectTeam = [
  {
    name: "Sarah Chen",
    role: "Project Manager",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "SC",
  },
  {
    name: "Michael Rodriguez",
    role: "Lead Architect",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "MR",
  },
  {
    name: "James Wilson",
    role: "Structural Engineer",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "JW",
  },
];

const activities = [
  {
    icon: GitPullRequest,
    description: "Updated structural calculations for floor system",
    time: "2 hours ago",
  },
  {
    icon: Calendar,
    description: "Design review meeting scheduled",
    time: "5 hours ago",
  },
  {
    icon: GitPullRequest,
    description: "MEP coordination updates submitted",
    time: "1 day ago",
  },
];
