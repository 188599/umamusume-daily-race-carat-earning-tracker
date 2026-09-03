import type { Dayjs } from 'dayjs';
import ModalConfirmAction from './ModalConfirmAction';
import { useState } from 'react';

interface TabledData {
  usedCarats: boolean;
  gainedCarats: number | null;
}

export const CaratsUsedAndGainedTable = ({
  tableData,
  setTableData,
  setCurrentCareerFinishingTime,
  setCurrentCareerTimeLeft,
  intervalRef,
}: {
  tableData: TabledData[];
  setTableData: React.Dispatch<React.SetStateAction<TabledData[]>>;
  setCurrentCareerFinishingTime: React.Dispatch<
    React.SetStateAction<Dayjs | null>
  >;
  setCurrentCareerTimeLeft: React.Dispatch<React.SetStateAction<number | null>>;
  intervalRef: React.RefObject<number | null>;
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteModalAction, setDeleteModalAction] = useState(() => () => {});

  const caratsUsed = tableData.filter((d) => d.usedCarats).length * 10;
  const caratsGained = tableData
    .filter((d) => d.gainedCarats != null)
    .map((d) => d.gainedCarats!)
    .reduce((acc, cur) => acc + cur, 0);

  const net = caratsGained - caratsUsed;

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

  const handleDelete = (index: number) => {
    setDeleteModalAction(() => () => {
      handleTableDataDeleteItem(index);
    });
    setDeleteModalOpen(true);
  };

  return (
    <>
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
                  disabled={net === 100}
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
            <th className="border p-1">
              {caratsGained}
              {caratsGained >= 100 ? ' (max)' : null}
            </th>
            <th className="border p-1"></th>
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
