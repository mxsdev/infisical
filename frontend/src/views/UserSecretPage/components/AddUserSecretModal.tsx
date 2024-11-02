import { Modal, ModalContent } from "@app/components/v2";
import { TRawUserSecret } from "@app/hooks/api/userSecrets";
import { UsePopUpState } from "@app/hooks/usePopUp";

import { UserSecretForm } from "./UserSecretForm";

type Props = {
  popUp: UsePopUpState<["createUserSecret", "editUserSecret"]>;
  handlePopUpToggle: (
    popUpName: keyof UsePopUpState<["createUserSecret", "editUserSecret"]>,
    state?: boolean
  ) => void;
};

export const AddUserSecretModal = ({ popUp, handlePopUpToggle }: Props) => {
  const editSecret = popUp?.editUserSecret?.data as TRawUserSecret;

  return (
    <Modal
      isOpen={popUp?.createUserSecret?.isOpen || popUp?.editUserSecret?.isOpen}
      onOpenChange={(isOpen) => {
        handlePopUpToggle(editSecret ? "editUserSecret" : "createUserSecret", isOpen);
      }}
    >
      <ModalContent
        title={editSecret ? "Edit a Secret" : "Create a Secret"}
        subTitle="Store a web login, credit card or secure note."
      >
        <UserSecretForm editSecret={editSecret} />
      </ModalContent>
    </Modal>
  );
};
