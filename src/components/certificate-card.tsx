// import { Card, CardContent } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { cn } from "@/lib/utils";
// import { Certification } from "@/types/certification";

// interface CertificateCardProps {
//   standard: Certification;
// }

// export function CertificateCard({ standard }: CertificateCardProps) {
//   const { name, progress = 0, certified, controls = 0, total = 0 } = standard;

//   // Extract the standard code (e.g., "45001" from "ISO 45001:2018")
//   const standardCode = name.split(" ")[1]?.split(":")[0] || name.charAt(0);

//   // Format the name for display
//   const displayName = name.includes("-") ? name.split("-")[1].trim() : name;

//   return (
//     <Card className="w-full max-w-[300px] hover:shadow-md transition-shadow">
//       <CardContent className="p-5 flex flex-col h-full">
//         <div className="flex items-center gap-3 mb-4">
//           <div className="h-8 w-8 rounded-full border flex items-center justify-center shrink-0">
//             <span className="text-xs font-medium">{standardCode}</span>
//           </div>
//           <h3 className="font-medium text-sm line-clamp-2">{displayName}</h3>
//         </div>

//         <div className="flex items-center gap-2 mb-4">
//           <Progress
//             value={progress}
//             className={cn("flex-1", certified ? "bg-blue-100" : "")}
//           />
//           <span className="text-sm text-muted-foreground whitespace-nowrap">
//             {progress}%
//           </span>
//         </div>

//         <div className="mt-auto">
//           {certified ? (
//             <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-sm">
//               Your Certification is ready!
//             </div>
//           ) : (
//             <div className="space-y-1">
//               <p className="text-sm text-muted-foreground">
//                 Controls preventing readiness
//               </p>
//               <p className="text-lg font-semibold">
//                 {controls}{" "}
//                 <span className="text-muted-foreground text-sm font-normal">
//                   / {total} total
//                 </span>
//               </p>
//             </div>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Certification } from "@/types/certification";

interface CertificateCardProps {
  standard: Certification;
  onClick?: (standard: Certification) => void;
}

export function CertificateCard({ standard, onClick }: CertificateCardProps) {
  const { name, progress = 0, certified, controls = 0, total = 0 } = standard;

  // Extract the standard code (e.g., "45001" from "ISO 45001:2018")
  const standardCode = name.split(" ")[1]?.split(":")[0] || name.charAt(0);

  // Format the name for display
  const displayName = name.includes("-") ? name.split("-")[1].trim() : name;

  const handleClick = () => {
    if (onClick) {
      onClick(standard);
    }
  };

  return (
    <Card
      className={cn(
        "w-full max-w-[300px] transition-all",
        onClick
          ? "cursor-pointer hover:shadow-md hover:border-primary/30 hover:translate-y-[-2px]"
          : ""
      )}
      onClick={onClick ? handleClick : undefined}
    >
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-full border flex items-center justify-center shrink-0">
            <span className="text-xs font-medium">{standardCode}</span>
          </div>
          <h3 className="font-medium text-sm line-clamp-2">{displayName}</h3>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Progress
            value={progress}
            className={cn("flex-1", certified ? "bg-blue-100" : "")}
          />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {progress}%
          </span>
        </div>

        <div className="mt-auto">
          {certified ? (
            <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-sm">
              Your Certification is ready!
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Controls preventing readiness
              </p>
              <p className="text-lg font-semibold">
                {controls}{" "}
                <span className="text-muted-foreground text-sm font-normal">
                  / {total} total
                </span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
