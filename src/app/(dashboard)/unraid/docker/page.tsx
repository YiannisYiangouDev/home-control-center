import { getUnraidDockerContainers } from "@/actions/unraid";
import { DockerClient } from "@/components/unraid/DockerClient";
import { RefreshButton } from "@/components/dashboard/RefreshButton";

export const dynamic = "force-dynamic";

export default async function UnraidDockerPage() {
  const containers = await getUnraidDockerContainers().catch(() => []);

  return (
    <div className="space-y-6 page-container">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Docker Containers</h1>
          <p className="text-sm text-text-muted mt-1">Manage and monitor running containers</p>
        </div>
        <RefreshButton />
      </div>
      <DockerClient containers={containers} />
    </div>
  );
}
