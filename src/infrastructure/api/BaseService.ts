import { httpClient } from './httpClient';

export abstract class BaseService<T> {
  protected abstract endpoint: string;

  async getAll(): Promise<T[]> {
    return httpClient.get<T[]>(this.endpoint);
  }

  async getById(id: string): Promise<T> {
    return httpClient.get<T>(`${this.endpoint}/${id}`);
  }

  async create(data: Partial<T>): Promise<T> {
    return httpClient.post<T>(this.endpoint, data);
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return httpClient.put<T>(`${this.endpoint}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return httpClient.delete<void>(`${this.endpoint}/${id}`);
  }
}
