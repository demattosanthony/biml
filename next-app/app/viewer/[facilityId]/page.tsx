"use client";

import IFCModelCard from "@/components/ifc-model-card";
import IFCViewer from "@/components/ifc-viewer";
import { useQuery } from "@tanstack/react-query";

export default function ViewerPage({
  params,
}: {
  params: { facilityId: string };
}) {
  const { data: facility } = useQuery({
    queryKey: ["facility", params.facilityId],
    queryFn: async () => {
      const data = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/facilities/${params.facilityId}`
      );

      return data.json();
    },
  });

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      {facility && facility.ifcModels && facility.ifcModels.length > 0 && (
        <div className="flex h-full w-full relative">
          <div className="">
            <IFCModelCard />
          </div>

          <IFCViewer
            fragPath={facility.ifcModels[0].modelFragmentUrl}
            modelName={facility.ifcModels[0].name}
          />
        </div>
      )}
    </div>
  );
}
