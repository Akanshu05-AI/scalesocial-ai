import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Send } from "lucide-react";

export default function PublishedPage() {
  return (
    <div>
      <PageHeader title="Published" />
      <EmptyState
        icon={Send}
        title="No backend endpoint lists published posts"
        description="Twitter/LinkedIn/Facebook/Instagram all return the result of a single post/thread call, but nothing lists history back — you'd need to look up a specific tweet_id via GET /twitter/analytics/{tweet_id} to confirm it went out."
      />
    </div>
  );
}
