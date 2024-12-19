import { Check, Copy, GitCommit } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Commit } from "@/types/commits";

export function CommitCard({ commit }: { commit: Commit }) {
  return (
    <div className="flex items-start gap-4 p-4 border-b last:border-b-0">
      <Image
        src={commit.author.avatar}
        alt={`${commit.author.name}'s avatar`}
        width={30}
        height={30}
        className="rounded-full"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-sm break-words">
              {commit.pullRequest ? (
                <>
                  <span>{commit.message} </span>
                  <Link href="#" className="text-primary hover:underline">
                    (#{commit.pullRequest.number})
                  </Link>
                </>
              ) : (
                commit.message
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground hover:underline">
                {commit.author.name}
              </Link>
              <span>committed {commit.date}</span>
              {commit.status && (
                <>
                  <Check className="h-3 w-3" />
                  <span>{commit.status}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {commit.verified && <Badge variant="outline">Verified</Badge>}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <GitCommit className="h-4 w-4" />
              </Button>
            </div>
            <code className="px-2 py-1 rounded bg-muted text-sm font-mono">
              {commit.hash}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
