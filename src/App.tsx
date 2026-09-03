import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Button } from 'flowbite-react';
import { useEffect, useRef, useState } from 'react';
import './App.css';
import ModalConfirmAction from './ModalConfirmAction';
import { CaratsUsedAndGainedTable } from './CaratsUsedAndGainedTable';
import { NetGains } from './NetGains';

dayjs.extend(duration);

interface TabledData {
  usedCarats: boolean;
  gainedCarats: number | null;
}

interface StoredData {
  date?: Dayjs;
  tableData?: TabledData[];
  currentCareerFinishingTime?: Dayjs;
  previousDays?: number;
  numberOfPreviousDays?: number;
}

function App() {
  const [tableData, setTableData] = useState<TabledData[]>([]);
  const [currentCareerFinishingTime, setCurrentCareerFinishingTime] =
    useState<Dayjs | null>(null);
  const [currentCareerTimeLeft, setCurrentCareerTimeLeft] = useState<
    number | null
  >(null);
  const [openModal, setOpenModal] = useState(false);
  const [modalText, setModalText] = useState('');
  const [modalAction, setModalAction] = useState<(() => void) | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startOfDay = dayjs().startOf('day').add(12, 'h');
  const date =
    startOfDay.isBefore(dayjs()) ? startOfDay : startOfDay.add(-1, 'day');

  const storedData: StoredData = JSON.parse(
    window.localStorage.getItem('storedData') ?? '{}',
  );

  const cumulativeNet = storedData.previousDays;
  const numberOfPreviousDays = storedData.numberOfPreviousDays;

  const caratsUsed = tableData.filter((d) => d.usedCarats).length * 10;
  const caratsGained = tableData
    .filter((d) => d.gainedCarats != null)
    .map((d) => d.gainedCarats!)
    .reduce((acc, cur) => acc + cur, 0);

  const net = caratsGained - caratsUsed;

  const handleTableDataAddItem = () => {
    setTableData((tableData) => [
      ...tableData,
      { usedCarats: false, gainedCarats: null },
    ]);

    setCurrentCareerFinishingTime(dayjs().add(50, 'minutes'));
    setCurrentCareerTimeLeft(50 * 60 * 1000);
  };

  useEffect(() => {
    if (storedData.date != null) {
      setTableData(storedData.tableData!);
      setCurrentCareerFinishingTime(
        storedData.currentCareerFinishingTime ?
          dayjs(storedData.currentCareerFinishingTime)
        : null,
      );
    }
  }, []);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (currentCareerFinishingTime != null) {
      intervalRef.current = setInterval(() => {
        const now = dayjs();
        const diff = currentCareerFinishingTime.diff(now);

        if (diff <= 0) {
          clearInterval(intervalRef.current!);
          setCurrentCareerTimeLeft(0);
        } else {
          setCurrentCareerTimeLeft(diff);
        }

        return () => clearInterval(intervalRef.current!);
      }, 1000);
    }
  }, [currentCareerFinishingTime]);

  useEffect(() => {
    if (tableData || currentCareerFinishingTime || currentCareerTimeLeft) {
      window.localStorage.setItem(
        'storedData',
        JSON.stringify({
          date,
          tableData,
          currentCareerFinishingTime,
          previousDays: cumulativeNet,
          numberOfPreviousDays,
        } as StoredData),
      );
    }
  }, [date, tableData, currentCareerFinishingTime, currentCareerTimeLeft]);

  const formattedCareerRemainingTime =
    currentCareerTimeLeft ?
      dayjs.duration(currentCareerTimeLeft).format('mm:ss')
    : null;

  const handleNewDay = () => {
    setModalText(
      'Are you sure you want to start a new day? This will delete the current entries and add the current net results to prior days.',
    );
    setModalAction(() => () => {
      let { previousDays, numberOfPreviousDays }: StoredData = JSON.parse(
        window.localStorage.getItem('storedData') ?? '{}',
      );

      previousDays ??= 0;
      numberOfPreviousDays ??= 0;

      previousDays += net;
      numberOfPreviousDays++;

      setCurrentCareerFinishingTime(null);
      setCurrentCareerTimeLeft(null);
      setTableData([]);

      window.localStorage.setItem(
        'storedData',
        JSON.stringify({
          previousDays,
          numberOfPreviousDays,
        } as StoredData),
      );

      setOpenModal(false);
    });
    setOpenModal(true);
  };

  return (
    <div className="m-4">
      <div className="flex">
        <CaratsUsedAndGainedTable
          {...{
            tableData,
            setTableData,
            setCurrentCareerFinishingTime,
            setCurrentCareerTimeLeft,
            intervalRef,
          }}
        />

        <div className="px-10">
          <NetGains
            {...{
              net,
              cumulativeNet,
              numberOfPreviousDays,
              formattedCareerRemainingTime,
            }}
          />

          {formattedCareerRemainingTime ?
            <h3>Run timer: {formattedCareerRemainingTime} </h3>
          : null}
        </div>
      </div>

      <div className="flex gap-3 my-4">
        <Button color="green" onClick={handleTableDataAddItem}>
          New Entry
        </Button>

        <Button color="yellow" onClick={handleNewDay}>
          New Day
        </Button>
      </div>

      <div className="bottom-0 right-0 fixed p-5">{date.format('MM/DD')}</div>

      <ModalConfirmAction
        show={openModal}
        handleAccept={modalAction!}
        setShow={setOpenModal}
        text={modalText}
      />
    </div>
  );
}

export default App;
