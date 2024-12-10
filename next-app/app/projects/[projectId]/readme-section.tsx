import { FileText } from "lucide-react";

export function ReadmeSection() {
  return (
    <div className="border rounded-lg">
      <div className="flex items-center gap-2 p-4 bg-muted/50 font-semibold">
        <FileText className="h-4 w-4" />
        README.md
      </div>
      <div className="p-4 prose max-w-none">
        <h1>Dunbar High School Renovation Project</h1>
        <p>
          This repository contains all the design and engineering files for the
          Dunbar High School renovation project in Washington, DC.
        </p>
        <h2>Project Overview</h2>
        <p>
          Dunbar High School, established in 1870, is undergoing a comprehensive
          renovation to modernize its facilities and enhance the learning
          environment for students and staff.
        </p>
        <h2>Key Features</h2>
        <ul>
          <li>State-of-the-art classrooms and laboratories</li>
          <li>Upgraded athletic facilities</li>
          <li>Enhanced accessibility features</li>
          <li>Improved energy efficiency systems</li>
          <li>Modernized technology infrastructure</li>
        </ul>
        <h2>Directory Structure</h2>
        <ul>
          <li>
            <code>src/</code> - Source files for project documentation and
            reports
          </li>
          <li>
            <code>public/</code> - Public assets and resources
          </li>
          <li>
            <code>components/</code> - Reusable design components
          </li>
          <li>
            <code>pages/</code> - Individual page designs and layouts
          </li>
        </ul>
        <h2>Getting Started</h2>
        <p>
          To get started with this project, please refer to the project setup
          guide in the <code>docs/</code> directory.
        </p>
        <h2>Contributing</h2>
        <p>
          We welcome contributions from all team members. Please read our
          contribution guidelines before submitting any changes.
        </p>
        <h2>Contact</h2>
        <p>
          For any questions or concerns, please contact the project manager at{" "}
          <a href="mailto:pm@example.com">pm@example.com</a>.
        </p>
      </div>
    </div>
  );
}
