// // "use client";

// // import { useState, useRef, useEffect } from "react";
// // import { Card, CardContent } from "@/components/ui/card";
// // import { Progress } from "@/components/ui/progress";
// // import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
// // import { cn } from "@/lib/utils";
// // import { Button } from "@/components/ui/button";
// // import { AddCertificateDialog } from "./add-certificate-dialog";
// // import { useList } from "@refinedev/core";

// // // Define the type for Certification
// // type Certification = {
// //   id: string; // UUID for the certification
// //   created_at: string; // ISO 8601 formatted date string
// //   updated_at: string; // ISO 8601 formatted date string
// //   is_active: boolean; // Status if the certification is active
// //   name: string; // The name of the certification
// //   standard: string; // The code or identifier for the standard
// //   progress?: number; // Progress value (optional, as it may not exist for all standards)
// //   controls?: number; // Number of controls (optional)
// //   total?: number; // Total number of controls (optional)
// //   certified?: boolean; // Whether the certification is completed (optional)
// // };

// // export function ComplianceOverview() {
// //   const [isDialogOpen, setIsDialogOpen] = useState(false);
// //   const scrollContainerRef = useRef<HTMLDivElement>(null);
// //   const [canScrollLeft, setCanScrollLeft] = useState(false);
// //   const [canScrollRight, setCanScrollRight] = useState(false);
// //   const [isClient, setIsClient] = useState(false);

// //   // Fetch data from Refine (Supabase)
// //   const { data: standards, isLoading } = useList<Certification>({
// //     resource: "certifications", // Supabase table name
// //     filters: [], // Optional: Add filters if needed
// //     pagination: { pageSize: 50 }, // Optional: Pagination
// //   });

// //   // Check if scrolling is possible and update state
// //   const checkScrollability = () => {
// //     if (scrollContainerRef.current) {
// //       const { scrollLeft, scrollWidth, clientWidth } =
// //         scrollContainerRef.current;
// //       setCanScrollLeft(scrollLeft > 0);
// //       setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
// //     }
// //   };

// //   // Initialize and update scroll state
// //   useEffect(() => {
// //     setIsClient(true);

// //     const handleResize = () => checkScrollability();
// //     window.addEventListener("resize", handleResize);

// //     const scrollContainer = scrollContainerRef.current;
// //     if (scrollContainer) {
// //       scrollContainer.addEventListener("scroll", checkScrollability);
// //     }

// //     // Cleanup on unmount
// //     return () => {
// //       window.removeEventListener("resize", handleResize);
// //       if (scrollContainer) {
// //         scrollContainer.removeEventListener("scroll", checkScrollability);
// //       }
// //     };
// //   }, []);

// //   const scrollLeft = () => {
// //     if (scrollContainerRef.current && canScrollLeft) {
// //       scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
// //     }
// //   };

// //   const scrollRight = () => {
// //     if (scrollContainerRef.current && canScrollRight) {
// //       scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
// //     }
// //   };

// //   // Certificate Card Component (to avoid duplication)
// //   const CertificateCard = (props: { standard: Certification }) => (
// //     <Card className="bg-white flex-shrink-0 w-full lg:w-[300px]">
// //       <CardContent className="pt-6 h-[180px]">
// //         <div className="flex items-center gap-3 mb-4">
// //           <div className="h-8 w-8 rounded-full border flex items-center justify-center">
// //             <span className="text-xs font-medium">
// //               {props.standard.name.split(" ")[1]}
// //             </span>
// //           </div>
// //           <span className="font-medium">{props.standard.name}</span>
// //         </div>

// //         <div className="flex items-center gap-2 mb-2">
// //           <Progress
// //             value={props.standard.progress || 0}
// //             className={cn(
// //               "flex-1",
// //               props.standard.certified ? "bg-blue-100" : ""
// //             )}
// //           />
// //           <span className="text-sm text-muted-foreground">
// //             {props.standard.progress}%
// //           </span>
// //         </div>

// //         {props.standard.certified ? (
// //           <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-sm">
// //             Your Certification is ready!
// //           </div>
// //         ) : (
// //           <div className="space-y-1">
// //             <p className="text-sm text-muted-foreground">
// //               Controls preventing readiness
// //             </p>
// //             <p className="text-lg font-semibold">
// //               {props.standard.controls}{" "}
// //               <span className="text-muted-foreground text-sm font-normal">
// //                 / {props.standard.total} total
// //               </span>
// //             </p>
// //           </div>
// //         )}
// //       </CardContent>
// //     </Card>
// //   );

// //   // Add Certificate Card Component
// //   const AddCertificateCard = () => (
// //     <Card
// //       className="bg-white flex-shrink-0 w-full lg:w-[300px] border-dashed cursor-pointer hover:bg-muted/50 transition-colors"
// //       onClick={() => setIsDialogOpen(true)}
// //     >
// //       <CardContent className="flex flex-col items-center justify-center h-[180px]">
// //         <div className="h-10 w-10 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center mb-3">
// //           <Plus className="h-5 w-5 text-muted-foreground/70" />
// //         </div>
// //         <p className="text-muted-foreground font-medium">Add Certificate</p>
// //       </CardContent>
// //     </Card>
// //   );

// //   // For mobile/tablet view, show an Add button if certificates > 2
// //   const showAddButton =
// //     isClient &&
// //     standards &&
// //     standards?.data?.length > 2 &&
// //     window.innerWidth < 1024;

// //   if (isLoading) return <div>Loading...</div>;

// //   return (
// //     <div className="space-y-4 overflow-x-hidden">
// //       <div className="flex items-center justify-between">
// //         <h1 className="text-2xl font-semibold">Compliance Overview</h1>

// //         {/* Add button for mobile/tablet when certificates > 2 */}
// //         {showAddButton && (
// //           <Button
// //             onClick={() => setIsDialogOpen(true)}
// //             className="flex items-center gap-2"
// //           >
// //             <Plus className="h-4 w-4" />
// //             Add Certificate
// //           </Button>
// //         )}
// //       </div>

// //       {/* Desktop View (Horizontal Scrolling) */}
// //       <div className="relative w-full overflow-hidden hidden lg:block">
// //         {canScrollLeft && (
// //           <button
// //             onClick={scrollLeft}
// //             className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-100 transition-all"
// //             aria-label="Scroll left"
// //           >
// //             <ChevronLeft className="h-5 w-5" />
// //           </button>
// //         )}

// //         {canScrollRight && (
// //           <button
// //             onClick={scrollRight}
// //             className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-100 transition-all"
// //             aria-label="Scroll right"
// //           >
// //             <ChevronRight className="h-5 w-5" />
// //           </button>
// //         )}

// //         <div
// //           ref={scrollContainerRef}
// //           className="flex overflow-x-auto py-2 pl-0 pr-10 space-x-4 scrollbar-hide max-w-full"
// //           style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
// //         >
// //           <AddCertificateCard />
// //           {standards?.data?.map((standard) => (
// //             <CertificateCard key={standard.id} standard={standard} />
// //           ))}
// //         </div>
// //       </div>

// //       {/* Mobile/Tablet View (Vertical Layout) */}
// //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
// //         {!showAddButton && <AddCertificateCard />}
// //         {standards?.data?.map((standard) => (
// //           <CertificateCard key={standard.id} standard={standard} />
// //         ))}
// //       </div>

// //       <AddCertificateDialog
// //         open={isDialogOpen}
// //         onOpenChange={setIsDialogOpen}
// //       />
// //     </div>
// //   );
// // }

// "use client";

// import { useState, useRef, useEffect } from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { AddCertificateDialog } from "./add-certificate-dialog";
// import { Certification } from "@/types/certification";
// import { AddCertificateCard } from "./add-certificate-card";
// import { CertificateCard } from "./certificate-card";

// // Mock data to replace the Refine useList hook
// const MOCK_CERTIFICATIONS: Certification[] = [
//   {
//     id: "1",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString(),
//     is_active: true,
//     name: "ISO 45001:2018 - Occupational Health & Safety",
//     standard: "ISO 45001",
//     progress: 65,
//     controls: 12,
//     total: 45,
//     certified: false,
//   },
//   {
//     id: "2",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString(),
//     is_active: true,
//     name: "ISO 27001 - Information Security Management",
//     standard: "ISO 27001",
//     progress: 100,
//     controls: 0,
//     total: 114,
//     certified: true,
//   },
//   {
//     id: "3",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString(),
//     is_active: true,
//     name: "ISO 45001:2018 - Occupational Health & Safety",
//     standard: "ISO 45001",
//     progress: 65,
//     controls: 12,
//     total: 45,
//     certified: false,
//   },
// //   {
// //     id: "3",
// //     created_at: new Date().toISOString(),
// //     updated_at: new Date().toISOString(),
// //     is_active: true,
// //     name: "GDPR Compliance",
// //     standard: "GDPR",
// //     progress: 42,
// //     controls: 8,
// //     total: 22,
// //     certified: false,
// //   },
// //   {
// //     id: "4",
// //     created_at: new Date().toISOString(),
// //     updated_at: new Date().toISOString(),
// //     is_active: true,
// //     name: "SOC 2 - Service Organization Control",
// //     standard: "SOC 2",
// //     progress: 78,
// //     controls: 5,
// //     total: 61,
// //     certified: false,
// //   },
// ];

// export function ComplianceOverview() {
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const scrollContainerRef = useRef<HTMLDivElement>(null);
//   const [canScrollLeft, setCanScrollLeft] = useState(false);
//   const [canScrollRight, setCanScrollRight] = useState(false);
//   const [isMounted, setIsMounted] = useState(false);

//   // Use local state instead of Refine's useList
//   const [standards, setStandards] =
//     useState<Certification[]>(MOCK_CERTIFICATIONS);
//   const [isLoading, setIsLoading] = useState(true);

//   // Simulate data loading
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsLoading(false);
//     }, 500);

//     return () => clearTimeout(timer);
//   }, []);

//   // Check if scrolling is possible and update state
//   const checkScrollability = () => {
//     if (scrollContainerRef.current) {
//       const { scrollLeft, scrollWidth, clientWidth } =
//         scrollContainerRef.current;
//       setCanScrollLeft(scrollLeft > 0);
//       setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
//     }
//   };

//   // Initialize and update scroll state
//   useEffect(() => {
//     setIsMounted(true);

//     // Wait for next tick to ensure DOM is updated
//     setTimeout(() => {
//       checkScrollability();
//     }, 0);

//     const handleResize = () => checkScrollability();
//     window.addEventListener("resize", handleResize);

//     const scrollContainer = scrollContainerRef.current;
//     if (scrollContainer) {
//       scrollContainer.addEventListener("scroll", checkScrollability);
//     }

//     // Cleanup on unmount
//     return () => {
//       window.removeEventListener("resize", handleResize);
//       if (scrollContainer) {
//         scrollContainer.removeEventListener("scroll", checkScrollability);
//       }
//     };
//   }, [standards]);

//   const scrollLeft = () => {
//     if (scrollContainerRef.current) {
//       // Calculate scroll distance based on card width + gap
//       const scrollDistance = 320; // 300px card width + 20px gap
//       scrollContainerRef.current.scrollBy({
//         left: -scrollDistance,
//         behavior: "smooth",
//       });
//     }
//   };

//   const scrollRight = () => {
//     if (scrollContainerRef.current) {
//       // Calculate scroll distance based on card width + gap
//       const scrollDistance = 320; // 300px card width + 20px gap
//       scrollContainerRef.current.scrollBy({
//         left: scrollDistance,
//         behavior: "smooth",
//       });
//     }
//   };

//   // For mobile/tablet view, determine if we should show an Add button
//   const showAddButton =
//     isMounted &&
//     standards &&
//     standards.length > 0 &&
//     typeof window !== "undefined" &&
//     window.innerWidth < 1024;

//   if (isLoading) {
//     return <ComplianceOverviewSkeleton />;
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-semibold">Compliance Overview</h1>

//         {/* Add button for mobile/tablet */}
//         {showAddButton && (
//           <Button
//             onClick={() => setIsDialogOpen(true)}
//             size="sm"
//             className="flex items-center gap-2"
//           >
//             Add Certificate
//           </Button>
//         )}
//       </div>

//       {/* Desktop View (Horizontal Scrolling) */}
//       <div className="relative w-full overflow-hidden">
//         {/* Scroll buttons */}
//         {canScrollLeft && (
//           <button
//             onClick={scrollLeft}
//             className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-100 transition-all"
//             aria-label="Scroll left"
//           >
//             <ChevronLeft className="h-5 w-5" />
//           </button>
//         )}

//         {canScrollRight && (
//           <button
//             onClick={scrollRight}
//             className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-100 transition-all"
//             aria-label="Scroll right"
//           >
//             <ChevronRight className="h-5 w-5" />
//           </button>
//         )}

//         {/* Scrollable container */}
//         <div
//           ref={scrollContainerRef}
//           className="flex overflow-x-auto py-2 gap-5 scrollbar-hide"
//           style={{
//             scrollbarWidth: "none",
//             msOverflowStyle: "none",
//           }}
//         >
//           {/* Always show add card first on desktop */}
//           <div className="hidden lg:block flex-shrink-0">
//             <AddCertificateCard onClick={() => setIsDialogOpen(true)} />
//           </div>

//           {/* Certificate cards */}
//           {standards.map((standard) => (
//             <div key={standard.id} className="flex-shrink-0">
//               <CertificateCard standard={standard} />
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Mobile/Tablet View (Grid Layout) */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
//         {!showAddButton && (
//           <AddCertificateCard onClick={() => setIsDialogOpen(true)} />
//         )}
//         {standards.map((standard) => (
//           <CertificateCard key={standard.id} standard={standard} />
//         ))}
//       </div>

//       {/* Add Certificate Dialog */}
//       <AddCertificateDialog
//         open={isDialogOpen}
//         onOpenChange={setIsDialogOpen}
//       />
//     </div>
//   );
// }

// function ComplianceOverviewSkeleton() {
//   return (
//     <div className="space-y-6">
//       <div className="h-8 w-48 bg-muted rounded animate-pulse" />
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
//         {[...Array(4)].map((_, i) => (
//           <div
//             key={i}
//             className="h-[180px] bg-muted rounded-md animate-pulse"
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
// import { AddCertificateDialog } from "./add-certificate-dialog";
import { CertificateCard } from "./certificate-card";
import { AddCertificateCard } from "./add-certificate-card";
import type { Certification } from "@/types/certification";
// import { toast } from "@/components/ui/use-toast"

// Mock data to replace the Refine useList hook
const MOCK_CERTIFICATIONS: Certification[] = [
  {
    id: "1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    name: "ISO 45001:2018 - Occupational Health & Safety",
    standard: "ISO 45001",
    progress: 65,
    controls: 12,
    total: 45,
    certified: false,
  },
  {
    id: "2",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    name: "ISO 27001 - Information Security Management",
    standard: "ISO 27001",
    progress: 100,
    controls: 0,
    total: 114,
    certified: true,
  },
  {
    id: "3",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    name: "ISO 45001:2018 - Occupational Health & Safety",
    standard: "ISO 45001",
    progress: 65,
    controls: 12,
    total: 45,
    certified: false,
  },
  {
    id: "4",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    name: "ISO 27001 - Information Security Management",
    standard: "ISO 27001",
    progress: 100,
    controls: 0,
    total: 114,
    certified: true,
  },
  //   {
  //     id: "3",
  //     created_at: new Date().toISOString(),
  //     updated_at: new Date().toISOString(),
  //     is_active: true,
  //     name: "GDPR Compliance",
  //     standard: "GDPR",
  //     progress: 42,
  //     controls: 8,
  //     total: 22,
  //     certified: false,
  //   },
  //   {
  //     id: "4",
  //     created_at: new Date().toISOString(),
  //     updated_at: new Date().toISOString(),
  //     is_active: true,
  //     name: "SOC 2 - Service Organization Control",
  //     standard: "SOC 2",
  //     progress: 78,
  //     controls: 5,
  //     total: 61,
  //     certified: false,
  //   },
];

export function ComplianceOverview() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Use local state instead of Refine's useList
  const [standards, setStandards] =
    useState<Certification[]>(MOCK_CERTIFICATIONS);
  const [isLoading, setIsLoading] = useState(true);

  // Handle certificate card click
  const handleCertificateClick = (standard: Certification) => {
    // Navigate to the certificate detail page
    router.push(`/compliance/${standard.id}`);

    // Alternatively, you could show a toast or open a modal
    // toast({
    //   title: `${standard.name}`,
    //   description: `Navigating to certificate details (ID: ${standard.id})`,
    // })
  };

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Check if scrolling is possible and update state
  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  // Initialize and update scroll state
  useEffect(() => {
    setIsMounted(true);

    // Wait for next tick to ensure DOM is updated
    setTimeout(() => {
      checkScrollability();
    }, 0);

    const handleResize = () => checkScrollability();
    window.addEventListener("resize", handleResize);

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScrollability);
    }

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", checkScrollability);
      }
    };
  }, [standards]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      // Calculate scroll distance based on card width + gap
      const scrollDistance = 320; // 300px card width + 20px gap
      scrollContainerRef.current.scrollBy({
        left: -scrollDistance,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      // Calculate scroll distance based on card width + gap
      const scrollDistance = 320; // 300px card width + 20px gap
      scrollContainerRef.current.scrollBy({
        left: scrollDistance,
        behavior: "smooth",
      });
    }
  };

  // For mobile/tablet view, determine if we should show an Add button
  const showAddButton =
    isMounted &&
    standards &&
    standards.length > 0 &&
    typeof window !== "undefined" &&
    window.innerWidth < 1024;

  if (isLoading) {
    return <ComplianceOverviewSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Compliance Overview</h1>

        {/* Add button for mobile/tablet */}
        {showAddButton && (
          <Button
            onClick={() => setIsDialogOpen(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            Add Certificate
          </Button>
        )}
      </div>

      {/* Desktop View (Horizontal Scrolling) */}
      <div className="relative w-full overflow-hidden">
        {/* Scroll buttons */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-100 transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-100 transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto py-2 gap-5 scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* Always show add card first on desktop */}
          <div className="hidden lg:block flex-shrink-0">
            <AddCertificateCard onClick={() => setIsDialogOpen(true)} />
          </div>

          {/* Certificate cards */}
          {standards.map((standard) => (
            <div key={standard.id} className="flex-shrink-0">
              <CertificateCard
                standard={standard}
                onClick={handleCertificateClick}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile/Tablet View (Grid Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
        {!showAddButton && (
          <AddCertificateCard onClick={() => setIsDialogOpen(true)} />
        )}
        {standards.map((standard) => (
          <CertificateCard
            key={standard.id}
            standard={standard}
            onClick={handleCertificateClick}
          />
        ))}
      </div>

      {/* Add Certificate Dialog */}
      {/* <AddCertificateDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      /> */}
    </div>
  );
}

function ComplianceOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-[180px] bg-muted rounded-md animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
