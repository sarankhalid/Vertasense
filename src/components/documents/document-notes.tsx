"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DocumentNotesProps {
  title?: string;
  notes?: React.ReactNode;
}

export function DocumentNotes({
  title = "ISO 9001-Specific Notes",
  notes,
}: DocumentNotesProps) {
  const defaultNotes = (
    <ol className="list-decimal pl-5 space-y-2">
      <li>
        <span className="font-medium">Documented Information (7.5):</span>{" "}
        ISO 9001:2015 requires organizations to maintain and control
        documented information required by the standard and by the
        organizations QMS.
      </li>
      <li>
        <span className="font-medium">Creating and Updating (7.5.2):</span>{" "}
        When creating and updating documented information, the
        organization must ensure appropriate identification, format,
        review, and approval.
      </li>
      <li>
        <span className="font-medium">
          Control of Documented Information (7.5.3):
        </span>{" "}
        Documented information must be controlled to ensure it is
        available where and when needed, adequately protected, and
        properly managed.
      </li>
    </ol>
  );

  return (
    <Card className="mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {notes || defaultNotes}
      </CardContent>
    </Card>
  );
}
