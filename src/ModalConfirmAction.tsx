import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Button, Modal, ModalBody, ModalHeader } from 'flowbite-react';

export default function ModalConfirmAction({
  text,
  show,
  setShow,
  handleAccept,
}: {
  text: string;
  show: boolean;
  setShow: (show: boolean) => void;
  handleAccept: () => void;
}) {
  const handleAcceptAndCloseModal = () => {
    handleAccept();
    setShow(false);
  };

  return (
    <Modal show={show} popup>
      <ModalHeader />
      <ModalBody>
        <ExclamationCircleIcon className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
          {text}
        </h3>
        <div className="flex justify-center gap-4">
          <Button color="red" onClick={handleAcceptAndCloseModal}>Yes</Button>
          <Button color="alternative" onClick={() => setShow(false)}>No</Button>
        </div>
      </ModalBody>
    </Modal>
  );
}
