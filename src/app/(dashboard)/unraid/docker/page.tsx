import { getUnraidDockerContainers } from "@/actions/unraid";
import { DockerClient } from "@/components/unraid/DockerClient";

export const dynamic = "force-dynamic";

export default async function UnraidDockerPage() {
  const containers = await getUnraidDockerContainers().catch(() => []);

  return (
    <div className="space-y-6 page-container">
      <DockerClient containers={containers} />
    </div>
  );
}
