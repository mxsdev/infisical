import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { format } from "date-fns";

import { IconButton, Td, Tr } from "@app/components/v2";
import { TRawUserSecret } from "@app/hooks/api/userSecrets";
import { UsePopUpState } from "@app/hooks/usePopUp";

export const UserSecretsRow = ({
  row,
  handlePopUpOpen
}: {
  row: TRawUserSecret;
  handlePopUpOpen: (
    popUpName: keyof UsePopUpState<["deleteUserSecretConfirmation", "editUserSecret"]>,
    userSecret: TRawUserSecret
  ) => void;
}) => {
  // const [isRowExpanded, setIsRowExpanded] = useToggle();

  return (
    <Tr
      key={row.id}
      // className="h-10 cursor-pointer transition-colors duration-300 hover:bg-mineshaft-700"
      // onClick={() => setIsRowExpanded.toggle()}
    >
      <Td>{row.name}</Td>
      {/* TODO(mxs): readable name */}
      <Td>{row.type}</Td>
      <Td>{`${format(new Date(row.createdAt), "yyyy-MM-dd - HH:mm a")}`}</Td>
      <Td>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            handlePopUpOpen("editUserSecret", row);
          }}
          variant="plain"
          ariaLabel="edit"
        >
          <FontAwesomeIcon icon={faEdit} />
        </IconButton>
      </Td>
      <Td>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            handlePopUpOpen("deleteUserSecretConfirmation", row);
          }}
          variant="plain"
          ariaLabel="delete"
        >
          <FontAwesomeIcon icon={faTrash} />
        </IconButton>
      </Td>
    </Tr>
  );
};
