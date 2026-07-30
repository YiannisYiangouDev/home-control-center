export class HomeAssistantClient {
  private baseUrl: string;
  private token: string;

  constructor(url: string, token: string) {
    this.baseUrl = url.replace(/\/$/, "");
    this.token = token;
  }

  private async request(endpoint: string) {
    const res = await fetch(`${this.baseUrl}/api/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error(`HA API error: ${res.status}`);
    return res.json();
  }

  async getStates() {
    return this.request("states");
  }

  async getConfig() {
    return this.request("config");
  }

  async getServices() {
    return this.request("services");
  }

  async getEntityState(entityId: string) {
    return this.request(`states/${entityId}`);
  }

  async getClimateEntities() {
    const states = await this.getStates();
    return states.filter((s: any) => s.entity_id.startsWith("climate."));
  }

  async getTemperatureSensors() {
    const states = await this.getStates();
    return states.filter((s: any) =>
      s.entity_id.startsWith("sensor.") &&
      (s.entity_id.includes("temperature") || s.entity_id.includes("temp") || s.attributes?.device_class === "temperature")
    );
  }

  async getWeather() {
    const states = await this.getStates();
    return states.filter((s: any) => s.entity_id.startsWith("weather."));
  }
}

export function createHAClient(): HomeAssistantClient | null {
  const url = process.env.HA_URL;
  const token = process.env.HA_TOKEN;
  if (!url || !token) return null;
  return new HomeAssistantClient(url, token);
}
