"use client";

import MarkdownViewer from "@/components/markdown-viewer";
import { FileText } from "lucide-react";

export function ReadmeSection() {
  return (
    <div className="border rounded-lg">
      <div className="flex items-center gap-2 p-4 bg-muted/50 font-semibold">
        <FileText className="h-4 w-4" />
        Project Overview
      </div>
      <div className="p-4 prose max-w-none gap-2">
        <MarkdownViewer
          content={`## Dunbar High School Renovation Project
        
This repository contains all the design and engineering files for the Dunbar High School renovation project in Washington, DC.

### Project Overview

Dunbar High School, established in 1870, is undergoing a comprehensive renovation to modernize its facilities and enhance the learning environment for students and staff.

### Key Features

- State-of-the-art classrooms and laboratories
- Upgraded athletic facilities
- Enhanced accessibility features
- Improved energy efficiency systems
- Modernized technology infrastructure`}
        />
      </div>
    </div>
  );
}
