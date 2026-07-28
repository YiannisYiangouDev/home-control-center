import { GraphQLClient, gql } from "graphql-request";

export class UnraidClient {
  private client: GraphQLClient;

  constructor(url: string, apiKey: string) {
    this.client = new GraphQLClient(`${url}/graphql`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
  }

  async getSystemMetrics() {
    const query = gql`
      query SystemMetrics {
        info {
          os {
            hostname
            platform
            uptime
          }
          cpu {
            manufacturer
            brand
            cores
            physicalCores
          }
          mem {
            total
            used
            free
          }
        }
        metrics {
          cpu {
            currentLoad
            currentLoadUser
            currentLoadSystem
          }
          mem {
            total
            used
            free
            available
          }
          temp {
            main
            cores
            max
          }
          networkStats {
            iface
            rx_sec
            tx_sec
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

  async getDockerContainers() {
    const query = gql`
      query DockerContainers {
        docker {
          containers {
            id
            name
            image
            state
            status
            ports {
              IP
              PrivatePort
              PublicPort
              Type
            }
            mounts {
              Source
              Destination
              Mode
            }
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
          status
          disks {
            name
            device
            size
            used
            free
            temp
            status
            type
            smart {
              passed
            }
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
