import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DATABASE_CONFIG } from '../../config/storage.config';

interface SQLiteRunResult {
  changes: number;
  lastInsertRowId: number;
}

class WebDatabase {
  private webStore: Map<string, any[]> = new Map();

  async initialize(): Promise<void> {
    try {
      const storedData = await AsyncStorage.getItem('@db_doctors');
      if (storedData) {
        this.webStore.set('doctors', JSON.parse(storedData));
      } else {
        this.webStore.set('doctors', []);
      }
    } catch (error) {
      console.error('Error loading web database:', error);
      this.webStore.set('doctors', []);
    }
  }

  private async saveWebStore(): Promise<void> {
    try {
      const doctors = this.webStore.get('doctors') || [];
      await AsyncStorage.setItem('@db_doctors', JSON.stringify(doctors));
    } catch (error) {
      console.error('Error saving web database:', error);
    }
  }

  getDatabase(): any | null {
    return null;
  }

  async executeQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
    const doctors = this.webStore.get('doctors') || [];
    const lowerSql = sql.toLowerCase().trim();

    if (lowerSql.includes('from doctors')) {
      let result = [...doctors];

      if (lowerSql.includes('where id = ?')) {
        const id = params[0];
        return doctors.filter((d: any) => d.id === id) as T[];
      }

      if (lowerSql.includes('select distinct specialization')) {
        const specializations = [...new Set(doctors.map((d: any) => d.specialization).filter(Boolean))];
        return specializations.map(s => ({ specialization: s })) as T[];
      }

      if (lowerSql.includes('specialization = ?')) {
        const specIndex = params.findIndex((p, i) => {
          const beforeParam = lowerSql.split('?').slice(0, i + 1).join('?');
          return beforeParam.includes('specialization = ?');
        });
        if (specIndex >= 0) {
          result = result.filter((d: any) => d.specialization === params[specIndex]);
        }
      }

      if (lowerSql.includes('hospital = ?')) {
        const hospIndex = params.findIndex((p, i) => {
          const beforeParam = lowerSql.split('?').slice(0, i + 1).join('?');
          return beforeParam.includes('hospital = ?');
        });
        if (hospIndex >= 0) {
          result = result.filter((d: any) => d.hospital === params[hospIndex]);
        }
      }

      if (lowerSql.includes('isavailable = ?')) {
        const availIndex = params.findIndex((p, i) => {
          const beforeParam = lowerSql.split('?').slice(0, i + 1).join('?');
          return beforeParam.includes('isavailable = ?');
        });
        if (availIndex >= 0) {
          result = result.filter((d: any) => d.isAvailable === (params[availIndex] === 1));
        }
      }

      for (let i = 0; i < params.length; i++) {
        const param = params[i];
        if (typeof param === 'string' && param.includes('%')) {
          const searchTerm = param.replace(/%/g, '').toLowerCase();
          result = result.filter((d: any) =>
            d.name?.toLowerCase().includes(searchTerm) ||
            d.specialization?.toLowerCase().includes(searchTerm) ||
            d.hospital?.toLowerCase().includes(searchTerm)
          );
          break;
        }
      }

      result.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
      return result as T[];
    }

    return [];
  }

  async executeRun(sql: string, params: any[] = []): Promise<SQLiteRunResult> {
    const lowerSql = sql.toLowerCase();
    let doctors = this.webStore.get('doctors') || [];

    if (lowerSql.includes('insert into doctors')) {
      const doctor = {
        id: params[0],
        name: params[1],
        specialization: params[2],
        hospital: params[3],
        phone: params[4],
        email: params[5],
        address: params[6],
        bio: params[7],
        rating: params[8],
        imageUrl: params[9],
        isAvailable: params[10] === 1,
        createdAt: params[11],
        updatedAt: params[12],
      };
      doctors.push(doctor);
      this.webStore.set('doctors', doctors);
      await this.saveWebStore();
      return { changes: 1, lastInsertRowId: 0 };
    }

    if (lowerSql.includes('update doctors')) {
      const id = params[params.length - 1];
      const index = doctors.findIndex((d: any) => d.id === id);
      if (index !== -1) {
        doctors[index] = {
          ...doctors[index],
          name: params[0],
          specialization: params[1],
          hospital: params[2],
          phone: params[3],
          email: params[4],
          address: params[5],
          bio: params[6],
          rating: params[7],
          imageUrl: params[8],
          isAvailable: params[9] === 1,
          updatedAt: params[10],
        };
        this.webStore.set('doctors', doctors);
        await this.saveWebStore();
        return { changes: 1, lastInsertRowId: 0 };
      }
      return { changes: 0, lastInsertRowId: 0 };
    }

    if (lowerSql.includes('delete from doctors')) {
      const id = params[0];
      const initialLength = doctors.length;
      doctors = doctors.filter((d: any) => d.id !== id);
      this.webStore.set('doctors', doctors);
      await this.saveWebStore();
      return { changes: initialLength - doctors.length, lastInsertRowId: 0 };
    }

    return { changes: 0, lastInsertRowId: 0 };
  }
}

export const database = new WebDatabase();
