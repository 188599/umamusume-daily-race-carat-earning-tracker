import type { Dayjs } from 'dayjs';
import type { TableData } from './tableData';

export interface StoredData {
  date?: Dayjs;
  tableData?: TableData[];
  currentCareerFinishingTime?: Dayjs | null;
  previousDays?: number;
  numberOfPreviousDays?: number;
  doubleRaceRewards?: boolean;
  playAudioWhenCareerFinishes?: boolean;
}
