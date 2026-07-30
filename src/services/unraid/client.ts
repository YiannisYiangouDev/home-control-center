import { GraphQLClient, gql } from "graphql-request";

export class UnraidClient {
  private client: GraphQLClient;

  constructor(url: string, apiKey: string) {
    const cleanUrl = url.replace(/\/Docker\/?$/, "").replace(/\/$/, "");
    this.client = new GraphQLClient(`${cleanUrl}/graphql`, {
      headers: {
        "x-api-key": apiKey,
      },
    });
  }

  async getSystemMetrics() {
    // Static info + array capacity (works with basic API key)
    const query = gql`
      query SystemMetrics {
        info {
          os {
            hostname
            platform
            uptime
            distro
            release
            kernel
          }
          cpu {
            manufacturer
            brand
            cores
            threads
            speed
          }
        }
        array {
          capacity {
            kilobytes {
              free
              used
              total
            }
          }
        }
      }
    `;

    try {
      return await this.client.request(query);
    } catch (error) {
      console.error("Unraid metrics fetch error:", error);
      return null;
    }
  }

  async getLiveMetrics() {
    // Live CPU + memory + network (requires INFO READ_ANY permission)
    const query = gql`
      query LiveMetrics {
        metrics {
          cpu {
            percentTotal
            cpus {
              percentTotal
            }
          }
          memory {
            total
            free
            used
            available
            percentTotal
            swapTotal
            swapFree
          }
          network {
            name
            rxSec
            txSec
          }
        }
      }
    `;

    try {
      return await this.client.request(query);
    } catch (error) {
      console.error("Unraid live metrics fetch error:", error);
      return null;
    }
  }

  async getDockerContainers() {
    const query = gql`
      query DockerContainers {
        docker {
          containers {
            id
            names
            image
            state
            status
            ports {
              ip
              privatePort
              publicPort
              type
            }
            mounts
            networkSettings
          }
        }
      }
    `;

    try {
      return await this.client.request(query);
    } catch (error) {
      console.error("Unraid Docker fetch error:", error);
      return null;
    }
  }

  async containerAction(containerId: string, action: "start" | "stop" | "restart") {
    const mutation = gql`
      mutation ContainerAction($id: String!, $action: String!) {
        dockerContainerAction(id: $id, action: $action) {
          success
          message
        }
      }
    `;

    try {
      return await this.client.request(mutation, { id: containerId, action });
    } catch (error) {
      console.error(`Unraid container ${action} error:`, error);
      return null;
    }
  }

  async getArrayStatus() {
    const query = gql`
      query ArrayStatus {
        array {
          state
          disks {
            name
            device
            size
            fsUsed
            fsFree
            temp
            status
            type
          }
        }
      }
    `;

    try {
      return await this.client.request(query);
    } catch (error) {
      console.error("Unraid array fetch error:", error);
      return null;
    }
  }
}

export function createUnraidClient(): UnraidClient | null {
  const url = process.env.UNRAID_URL;
  const apiKey = process.env.UNRAID_API_KEY;

  if (!url || !apiKey) return null;

  return new UnraidClient(url, apiKey);
}
