import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { FileEdit } from "lucide-react";

export default function DraftsPage() {
  return (
    <div>
      <PageHeader title="Drafts" />
      <EmptyState
        icon={FileEdit}
        title="No backend concept of drafts exists yet"
        description="None of the platform routers persist an unsent draft — Twitter/LinkedIn/Facebook/Instagram all post or schedule directly. A drafts table + endpoint would need to be added server-side first."
      />
    </div>
  );
}
