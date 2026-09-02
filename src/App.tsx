import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Button } from 'flowbite-react';
import { useEffect, useRef, useState } from 'react';
import './App.css';
import ModalConfirmAction from './ModalConfirmAction';

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

  const handleTableDataDeleteItem = (index: number) => {
    if (index == tableData.length - 1) {
      setCurrentCareerFinishingTime(null);
      setCurrentCareerTimeLeft(null);
    }

    setTableData((tableData) => {
      const newTableData = [...tableData];
      newTableData.splice(index, 1);

      return newTableData;
    });
  };

  const handleChangeUsedCaratsTableDataItem = (
    index: number,
    usedCarats: boolean,
  ) => {
    setTableData((tableData) => {
      const newTableData = [...tableData];
      const currentItemValue = newTableData[index];
      newTableData.splice(index, 1, { ...currentItemValue, usedCarats });

      return newTableData;
    });
  };

  const handleChangeGainedCaratsTableDataItem = (
    index: number,
    operation: 'add' | 'subtract',
  ) => {
    if (index == tableData.length - 1 && intervalRef.current) {
      setCurrentCareerFinishingTime(null);
      setCurrentCareerTimeLeft(null);
    }

    setTableData((tableData) => {
      const newTableData = [...tableData];
      const currentItemValue = { ...newTableData[index] };
      currentItemValue.gainedCarats ??= 0;

      if (operation == 'add') {
        currentItemValue.gainedCarats += 5;
        currentItemValue.gainedCarats = Math.min(
          100,
          currentItemValue.gainedCarats,
        );
      } else {
        currentItemValue.gainedCarats -= 5;
        currentItemValue.gainedCarats = Math.max(
          0,
          currentItemValue.gainedCarats,
        );
      }

      newTableData.splice(index, 1, { ...currentItemValue });

      return newTableData;
    });
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

  const handleDelete = (index: number) => {
    setModalText('Are you sure you want to delete this entry?');
    setModalAction(() => () => {
      handleTableDataDeleteItem(index);
    });
    setOpenModal(true);
  };

  return (
    <div className="m-4">
      <div className="flex">
        <table className="border border-collapse">
          <thead>
            <tr>
              <th className="border p-1">Carats used?</th>
              <th className="border p-1">Carats gained</th>
              <th className="border p-1"></th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((data, i) => (
              <tr key={i}>
                <th className="border p-2">
                  <button
                    className="cursor-pointer transition-transform active:scale-95 duration-150 px-2"
                    onClick={() =>
                      handleChangeUsedCaratsTableDataItem(i, !data.usedCarats)
                    }
                  >
                    {data.usedCarats ? '✅' : '❎'}
                  </button>
                </th>
                <th className="border p-2 flex">
                  <button
                    className="cursor-pointer transition-transform active:scale-95 duration-150 px-2"
                    onClick={() =>
                      handleChangeGainedCaratsTableDataItem(i, 'subtract')
                    }
                  >
                    ➖
                  </button>
                  <span className="flex-1">{data.gainedCarats ?? '-'}</span>
                  <button
                    className="cursor-pointer transition-transform active:scale-95 duration-150 px-2"
                    onClick={() =>
                      handleChangeGainedCaratsTableDataItem(i, 'add')
                    }
                  >
                    ➕
                  </button>
                </th>
                <th className="border p-2">
                  <button
                    className="cursor-pointer transition-transform active:scale-95 duration-150"
                    onClick={() => handleDelete(i)}
                  >
                    🗑️
                  </button>
                </th>
              </tr>
            ))}
            <tr className="border-collapse">
              <th className="p-1">Total</th>
              <th className="p-1"></th>
              <th className="p-1 border"></th>
              <th></th>
              <th></th>
            </tr>
            <tr>
              <th className="border p-1">{caratsUsed}</th>
              <th className="border p-1">{caratsGained}</th>
              <th className="border p-1"></th>
            </tr>
          </tbody>
        </table>

        <div className="px-10">
          <h2>
            Net:
            <span
              className={`
            ${
              net > 0 ? 'text-green-400'
              : net == 0 ? 'text-blue-400'
              : 'text-red-400'
            } px-4
            `}
            >
              {net > 0 ? '+' : null}
              {net}
              {caratsGained >= 100 ? ' (max)' : null}
            </span>
          </h2>
          {cumulativeNet != null ?
            <h2>
              Cumulative Net (Prior {numberOfPreviousDays} days):
              <span
                className={`
            ${
              cumulativeNet + net > 0 ? 'text-green-400'
              : cumulativeNet + net == 0 ? 'text-blue-400'
              : 'text-red-400'
            } px-4
            `}
              >
                {cumulativeNet + net > 0 ? '+' : null}
                {cumulativeNet + net}
              </span>
            </h2>
          : null}

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
        handleAccept={modalAction ?? (() => {})}
        setShow={setOpenModal}
        text={modalText}
      />
    </div>
  );
}

export default App;
