import { Topic, Comment } from "@/types/comments";
import { Commit } from "@/types/commits";

export const sampleTopics: Topic[] = [
  {
    guid: "A245F4F2-2C01-B43B-B612-5E456BEF8116",
    server_assigned_id: "ISSUE-00001",
    creation_author: "Sarah.Chen@setty.com",
    title: "Steel Column Conflicts with MEP Ductwork in Level 3 East Wing",
    labels: ["Structural", "MEP", "Clash Detection"],
    creation_date: "2024-01-15T09:34:22.409Z",
    topic_status: "open",
    topic_type: "Clash",
    priority: "high",
    assigned_to: "Michael.Wong@setty.com",
    description:
      'Steel column W12x40 at grid intersection E-4 conflicts with 24"x16" supply duct. Column cannot be moved due to structural requirements. MEP team needs to reroute ductwork to avoid clash. Current clash distance is 8 inches.',
  },
  {
    guid: "A211FCC2-3A3B-EAA4-C321-DE22ABC8414",
    server_assigned_id: "ISSUE-00078",
    creation_author: "James.Miller@setty.com",
    title: "Floor-to-Floor Height Issue Affecting Plenum Space",
    labels: ["Architecture", "MEP", "Coordination"],
    creation_date: "2024-01-16T11:24:11.316Z",
    topic_status: "open",
    topic_type: "Issue",
    priority: "high",
    assigned_to: "Sarah.Chen@setty.com",
    description:
      "IFC model review shows insufficient plenum space between Level 2-3 due to deep beam requirements. Current clearance is 14 inches, need minimum 18 inches for MEP services. Affects approximately 2000 SF in north wing. Structural team to review beam depths and propose alternatives.",
  },
];

export const sampleComments: Comment[] = [
  {
    guid: "C1",
    date: "2013-10-21T17:45:00Z",
    author: "Architect@example.com",
    comment:
      "I've identified some potential issues with the structural design in relation to our architectural plans. We need to discuss this further.",
    topic_guid: "A245F4F2-2C01-B43B-B612-5E456BEF8116",
  },
  {
    guid: "C2",
    date: "2013-10-22T09:30:00Z",
    author: "Engineer@example.com",
    comment:
      "Thank you for bringing this to my attention. I'll review the plans and get back to you with some proposed solutions.",
    topic_guid: "A245F4F2-2C01-B43B-B612-5E456BEF8116",
  },
  {
    guid: "C3",
    date: "2014-11-19T14:30:00Z",
    author: "Architect@example.com",
    comment:
      "There seem to be some clashes between the HVAC system and the electrical conduits in the east wing. Can we schedule a meeting to resolve this?",
    topic_guid: "A211FCC2-3A3B-EAA4-C321-DE22ABC8414",
  },
  {
    guid: "C4",
    date: "2014-11-20T10:15:00Z",
    author: "MEPEngineer@example.com",
    comment:
      "I've reviewed the area in question. Let's meet tomorrow at 2 PM to discuss potential solutions. I'll bring some revised drawings.",
    topic_guid: "A211FCC2-3A3B-EAA4-C321-DE22ABC8414",
  },
];
export const commitsByDate: Record<string, Commit[]> = {
  "Dec 18, 2024": [
    {
      id: "1",
      message: "Adjust column positions to resolve MEP conflicts on Level 3",
      author: {
        name: "Emily Chen",
        avatar: "/placeholder.svg",
      },
      date: "2 hours ago",
      hash: "df7942a",
      verified: true,
      pullRequest: {
        number: 45,
        branch: "feature/structural-mep-coordination",
      },
      status: "2/2",
    },
    {
      id: "2",
      message: "Update plenum space requirements in north wing",
      author: {
        name: "Marcus Johnson",
        avatar: "/placeholder.svg",
      },
      date: "5 hours ago",
      hash: "7e8ad99",
      verified: true,
      pullRequest: {
        number: 44,
        branch: "feature/plenum-revision",
      },
      status: "2/2",
    },
  ],
  "Dec 17, 2024": [
    {
      id: "3",
      message: "Revise HVAC ductwork layout in east wing",
      author: {
        name: "Sophia Lee",
        avatar: "/placeholder.svg",
      },
      date: "yesterday",
      hash: "35432fa",
      verified: false,
    },
    {
      id: "4",
      message: "Modify beam depths to accommodate MEP services",
      author: {
        name: "Alex Rodriguez",
        avatar: "/placeholder.svg",
      },
      date: "yesterday",
      hash: "c1f5e2b",
      verified: true,
      status: "1/1",
    },
  ],
  "Dec 15, 2024": [
    {
      id: "5",
      message: "Update structural grid layout for east wing expansion",
      author: {
        name: "Olivia Taylor",
        avatar: "/placeholder.svg",
      },
      date: "3 days ago",
      hash: "9a8b7c6",
      verified: true,
      pullRequest: {
        number: 42,
        branch: "feature/grid-revision",
      },
      status: "3/3",
    },
  ],
};
