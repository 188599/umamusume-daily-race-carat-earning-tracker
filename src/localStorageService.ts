import type { StoredData } from './models/storedData';

const KEY = 'storedData';

export class LocalStorageService {
  saveData(data: Partial<StoredData>) {
    const stringfiedData = JSON.stringify(data);

    localStorage.setItem(KEY, stringfiedData);
  }

  getData() {
    const data = JSON.parse(
      localStorage.getItem(KEY) ?? '{}',
    ) as Partial<StoredData>;

    return data;
  }
}
