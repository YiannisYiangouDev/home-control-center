import { getUnraidArrayStatus } from "@/actions/unraid";
import { StorageClient } from "@/components/unraid/StorageClient";

export const dynamic = "force-dynamic";

export default async function UnraidStoragePage() {
  const arrayStatus = await getUnraidArrayStatus().catch(() => null);

  return (
    <div className="space-y-6 page-container">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Storage</h1>
        <p className="text-sm text-text-muted mt-1">Disk health, SMART data, and array status</p>
      </div>

      <StorageClient arrayStatus={arrayStatus} />
    </div>
  );
}
