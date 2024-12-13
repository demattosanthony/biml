"use client";

import { BarChart, Users, LinkIcon, Mail, Clock, Percent } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProjectsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex items-start gap-6 mb-8">
        <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center">
          <img
            src="/setty_favicon.png"
            alt="Setty & Associates"
            className="h-16"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold mb-1">Setty & Associates</h1>
          <p className="text-gray-600 mb-4">
            Deliver High Performing Complex buildings.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <a
              href="https://setty.com/"
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <LinkIcon size={16} />
              <span>https://setty.com</span>
            </a>
            <a
              href="rsetty@setty.com"
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <Mail size={16} />
              <span>rsetty@setty.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* Company Overview Section */}
      <Card className="p-6 mb-8">
        <h2 className="font-mono text-sm mb-4">COMPANY OVERVIEW</h2>
        <div className="space-y-4">
          <p>Welcome to AEC Design Solutions</p>
          <p>
            We specialize in innovative engineering design for educational,
            commercial, and public sector projects.
          </p>
          <p>
            Our multidisciplinary team brings expertise in structural,
            mechanical, electrical, and plumbing engineering.
          </p>
          <p>
            We are committed to sustainable design practices and cutting-edge
            technology integration in all our projects.
          </p>
          <p>
            Explore our{" "}
            <a href="#" className="text-blue-600 hover:underline">
              project portfolio
            </a>{" "}
            to see our work in action.
          </p>
          <p>
            Follow us on{" "}
            <a href="#" className="text-blue-600 hover:underline">
              LinkedIn
            </a>{" "}
            for the latest updates and industry insights.
          </p>
        </div>
      </Card>

      {/* Featured Project Section */}
      <div className="mb-8">
        <h2 className="text-base font-semibold mb-4">Featured Projects</h2>
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">🏆</div>
            <div>
              <div className="flex items-center gap-2">
                <a
                  href="#"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Sustainable City Center
                </a>
                <Badge variant="secondary">Public</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Net-zero energy mixed-use development in the heart of downtown.
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  Design Development
                </span>
                <span className="flex items-center gap-1">
                  <Percent size={16} />
                  65% Complete
                </span>
                <span className="flex items-center gap-1">
                  <Users size={16} />
                  Team of 15
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Projects</h2>
          <div className="flex items-center gap-2">
            <Input placeholder="Find a project..." className="w-[300px]" />
            <Select defaultValue="all">
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="last-updated">
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-updated">Last updated</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="stars">Stars</SelectItem>
              </SelectContent>
            </Select>
            <Link href="/projects/new">
              <Button>New Project</Button>
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project.name} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/projects/1"
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      {project.name}
                    </Link>
                    <Badge variant="secondary">{project.type}</Badge>
                  </div>
                  {project.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      {project.phase}
                    </span>
                    <span className="flex items-center gap-1">
                      <Percent size={16} />
                      {project.percentComplete}% Complete
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={16} />
                      Team of {project.teamSize}
                    </span>
                    <span>Updated {project.lastUpdated}</span>
                  </div>
                </div>
                <div className="w-32 h-12">
                  <BarChart className="w-full h-full text-gray-200" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

const projects = [
  {
    name: "Dunbar High School",
    description:
      "Modernization and expansion of historic high school in Washington, DC",
    type: "Education",
    phase: "Design Development",
    percentComplete: 45,
    teamSize: 8,
    lastUpdated: "2 days ago",
  },
  {
    name: "Green Office Tower",
    description:
      "LEED Platinum certified office building with innovative energy systems",
    type: "Commercial",
    phase: "Construction Documents",
    percentComplete: 75,
    teamSize: 12,
    lastUpdated: "yesterday",
  },
  {
    name: "Central Library Renovation",
    description:
      "Adaptive reuse of 1920s library with modern technology integration",
    type: "Public",
    phase: "Schematic Design",
    percentComplete: 30,
    teamSize: 6,
    lastUpdated: "1 week ago",
  },
  {
    name: "Urban Transit Hub",
    description:
      "Multi-modal transportation center with retail and office space",
    type: "Public",
    phase: "Concept Design",
    percentComplete: 15,
    teamSize: 10,
    lastUpdated: "3 days ago",
  },
  {
    name: "Mixed-Use Development",
    description:
      "Residential and commercial complex with sustainable design features",
    type: "Mixed-Use",
    phase: "Design Development",
    percentComplete: 60,
    teamSize: 15,
    lastUpdated: "4 days ago",
  },
  {
    name: "Civic Center Plaza",
    description: "Public park and community center with cultural programming",
    type: "Public",
    phase: "Construction Administration",
    percentComplete: 90,
    teamSize: 5,
    lastUpdated: "1 month ago",
  },
];
