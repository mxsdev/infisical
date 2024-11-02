import { useState } from "react";
import { faKey } from "@fortawesome/free-solid-svg-icons";

import {
  EmptyState,
  Pagination,
  Table,
  TableContainer,
  TableSkeleton,
  TBody,
  Th,
  THead,
  Tr
} from "@app/components/v2";
import { TRawUserSecret, useGetUserSecrets } from "@app/hooks/api/userSecrets";
import { UsePopUpState } from "@app/hooks/usePopUp";

import { UserSecretsRow } from "./UserSecretsRow";

type Props = {
  handlePopUpOpen: (
    popUpName: keyof UsePopUpState<["deleteUserSecretConfirmation", "editUserSecret"]>,
    userSecret: TRawUserSecret
  ) => void;
};

export const UserSecretsTable = ({ handlePopUpOpen }: Props) => {
  // TODO(mxs): Implement pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { isLoading, data } = useGetUserSecrets();

  return (
    <TableContainer>
      <Table>
        <THead>
          <Tr>
            <Th>Name</Th>
            <Th>Type</Th>
            <Th>Created At</Th>
            {/* TODO(mxs): created by? */}
            <Th aria-label="button" className="w-5" />
            <Th aria-label="button" className="w-5" />
          </Tr>
        </THead>
        <TBody>
          {isLoading && <TableSkeleton columns={7} innerKey="shared-secrets" />}
          {!isLoading &&
            data?.userSecrets?.map((row) => (
              <UserSecretsRow key={row.id} row={row} handlePopUpOpen={handlePopUpOpen} />
            ))}
        </TBody>
      </Table>
      {!isLoading && data && (
        <Pagination
          count={data.userSecrets?.length ?? 0}
          page={page}
          perPage={perPage}
          onChangePage={(newPage) => setPage(newPage)}
          onChangePerPage={(newPerPage) => setPerPage(newPerPage)}
        />
      )}
      {!isLoading && !data?.userSecrets?.length && (
        <EmptyState title="No secrets created yet" icon={faKey} />
      )}
    </TableContainer>
  );
};
