import {
  CheckIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type { Dayjs } from 'dayjs';
import { Button } from 'flowbite-react';
import { useState } from 'react';
import ModalConfirmAction from './ModalConfirmAction';
import type { TableData } from './models/tableData';

export const CaratsUsedAndGainedTable = ({
  tableData,
  setTableData,
  setCurrentCareerFinishingTime,
  setCurrentCareerTimeLeft,
  doubleRaceRewards,
  intervalRef,
}: {
  tableData: TableData[];
  setTableData: React.Dispatch<React.SetStateAction<TableData[]>>;
  setCurrentCareerFinishingTime: React.Dispatch<
    React.SetStateAction<Dayjs | null>
  >;
  setCurrentCareerTimeLeft: React.Dispatch<React.SetStateAction<number | null>>;
  doubleRaceRewards: boolean;
  intervalRef: React.RefObject<number | null>;
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteModalAction, setDeleteModalAction] = useState(() => () => {});

  const calcMaxCarats = () => {
    const timesEarned = tableData
      .filter((d) => d.gainedCarats != null && d.gainedCarats > 0)
      .reduce(
        (p, c) => p + c.gainedCarats! / (c.doubleRaceRewards ? 10 : 5),
        0,
      );
    const amountEarned = tableData.reduce(
      (p, c) => p + (c.gainedCarats ?? 0),
      0,
    );

    return (20 - timesEarned) * (doubleRaceRewards ? 10 : 5) + amountEarned;
  };

  const caratsPerReward = doubleRaceRewards ? 10 : 5;
  const maxCaratsGained = calcMaxCarats();

  const caratsUsed = tableData.filter((d) => d.usedCarats).length * 10;
  const caratsGained = tableData
    .filter((d) => d.gainedCarats != null)
    .map((d) => d.gainedCarats!)
    .reduce((acc, cur) => acc + cur, 0);

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
        currentItemValue.gainedCarats += caratsPerReward;
        currentItemValue.gainedCarats = Math.min(
          maxCaratsGained,
          currentItemValue.gainedCarats,
        );
      } else {
        currentItemValue.gainedCarats -= caratsPerReward;
        currentItemValue.gainedCarats = Math.max(
          0,
          currentItemValue.gainedCarats,
        );
      }

      newTableData.splice(index, 1, { ...currentItemValue });

      return newTableData;
    });
  };

  const handleDelete = (index: number) => {
    setDeleteModalAction(() => () => {
      handleTableDataDeleteItem(index);
    });
    setDeleteModalOpen(true);
    ('');
  };

  return (
    <>
      <table className="outline">
        <thead>
          <tr>
            <th className="outline p-1">Carats used?</th>
            <th className="outline p-1">Carats gained</th>
            <th className="outline p-1"></th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((data, i) => (
            <tr key={i}>
              <th className="outline p-2 justify-items-center">
                <Button
                  size="xs"
                  outline
                  pill
                  title="Toggle carats used"
                  color={data.usedCarats ? 'green' : 'red'}
                  onClick={() =>
                    handleChangeUsedCaratsTableDataItem(i, !data.usedCarats)
                  }
                >
                  {data.usedCarats ?
                    <CheckIcon className="h-4 w-4" />
                  : <XMarkIcon className="h-4 w-4" />}
                </Button>
              </th>
              <th className="outline p-2 justify-items-center flex gap-2">
                <Button
                  pill
                  color="blue"
                  size="xs"
                  outline
                  title="Decrease carats gained"
                  onClick={() =>
                    handleChangeGainedCaratsTableDataItem(i, 'subtract')
                  }
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <span className="flex-1">{data.gainedCarats ?? '-'}</span>
                <Button
                  size="xs"
                  pill
                  color="blue"
                  outline
                  title="Add carats gained"
                  onClick={() =>
                    handleChangeGainedCaratsTableDataItem(i, 'add')
                  }
                  disabled={caratsGained >= maxCaratsGained}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </th>
              <th className="outline p-2 justify-items-center">
                <Button
                  pill
                  outline
                  size="xs"
                  color="red"
                  title="Delete entry"
                  onClick={() => handleDelete(i)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </th>
            </tr>
          ))}
          <tr>
            <th className="outline p-1" colSpan={3}>
              Total
            </th>
            <th></th>
            <th></th>
          </tr>
          <tr>
            <th className="outline p-1">{caratsUsed}</th>
            <th className="outline p-1">
              {caratsGained}
              {caratsGained >= maxCaratsGained ? ' (max)' : null}
            </th>
            <th className="outline p-1"></th>
          </tr>
        </tbody>
      </table>

      <ModalConfirmAction
        show={deleteModalOpen}
        handleAccept={deleteModalAction}
        setShow={setDeleteModalOpen}
        text="Are you sure you want to delete this entry?"
      />
    </>
  );
};
