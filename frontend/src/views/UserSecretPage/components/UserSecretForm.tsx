import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { faCheck, faCopy, faRedo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { createNotification } from "@app/components/notifications";
import { Button, FormControl, IconButton, Input, Select, SelectItem } from "@app/components/v2";
import { useTimedReset } from "@app/hooks";
import {
  TRawUserSecret,
  TUserSecretCredentialsSchema,
  TUserSecretType,
  useCreateUserSecret,
  useUpdateUserSecret
} from "@app/hooks/api/userSecrets";

const secretTypeOptions = [
  { label: "Web Login", value: TUserSecretType.WebLogin },
  { label: "Credit Card", value: TUserSecretType.CreditCard },
  { label: "Secure Note", value: TUserSecretType.SecureNote }
];

const schema = z
  .object({
    name: z.string()
  })
  .and(TUserSecretCredentialsSchema);

export type FormData = z.infer<typeof schema>;

type Props = {
  editSecret?: TRawUserSecret;
};

export const UserSecretForm = ({ editSecret }: Props) => {
  const [secretLink, setSecretLink] = useState("");
  const [, isCopyingSecret, setCopyTextSecret] = useTimedReset<string>({
    initialState: "Copy to clipboard"
  });

  const createUserSecret = useCreateUserSecret();
  const updateUserSecret = useUpdateUserSecret();

  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting },
    watch
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: editSecret?.name,
      type: editSecret?.type,
      ...editSecret?.credentials
    }
  });

  const formType = watch("type", editSecret?.type ?? TUserSecretType.WebLogin);

  const onFormSubmit = async (formData: FormData) => {
    try {
      if (editSecret) {
        await updateUserSecret.mutateAsync({
          userSecretId: editSecret.id,
          ...formData
        });

        createNotification({
          text: "User secret successfully updated.",
          type: "success"
        });
      } else {
        await createUserSecret.mutateAsync({
          ...formData
        });

        createNotification({
          text: "User secret successfully created.",
          type: "success"
        });

        reset();
      }
    } catch (error) {
      console.error(error);
      createNotification({
        text: "Failed to create a shared secret.",
        type: "error"
      });
    }
  };

  const hasSecretLink = Boolean(secretLink);

  return !hasSecretLink ? (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState: { error } }) => (
          <FormControl label="Name" isError={Boolean(error)} errorText={error?.message} isRequired>
            <Input {...field} placeholder="My Secret" type="text" />
          </FormControl>
        )}
      />

      <Controller
        control={control}
        name="type"
        defaultValue={TUserSecretType.WebLogin}
        render={({ field: { onChange, ...field }, fieldState: { error } }) => (
          <FormControl
            label="Secret Type"
            errorText={error?.message}
            isError={Boolean(error)}
            isRequired
          >
            <Select
              defaultValue={field.value}
              {...field}
              onValueChange={(e) => onChange(e)}
              className="w-full"
            >
              {secretTypeOptions.map(({ label, value: secretTypeValue }) => (
                <SelectItem value={secretTypeValue} key={label}>
                  {label}
                </SelectItem>
              ))}
            </Select>
          </FormControl>
        )}
      />

      {formType === TUserSecretType.WebLogin && (
        <>
          <Controller
            control={control}
            name="username"
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="Username"
                isError={Boolean(error)}
                errorText={error?.message}
                isRequired
              >
                <Input {...field} placeholder="jane1234" type="text" />
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="Password"
                isError={Boolean(error)}
                errorText={error?.message}
                isRequired
              >
                <Input {...field} placeholder="Password" type="password" />
              </FormControl>
            )}
          />
        </>
      )}

      {formType === TUserSecretType.CreditCard && (
        <>
          <Controller
            control={control}
            name="cardNumber"
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="Card Number"
                isError={Boolean(error)}
                errorText={error?.message}
                isRequired
              >
                <Input {...field} placeholder="1234123412341234" type="text" />
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="expiryMonth"
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="Expiry Month"
                isError={Boolean(error)}
                errorText={error?.message}
                isRequired
              >
                <Input {...field} placeholder="01" type="text" />
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="expiryYear"
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="Expiry Year"
                isError={Boolean(error)}
                errorText={error?.message}
                isRequired
              >
                <Input {...field} placeholder="28" type="text" />
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="cvv"
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="CVV"
                isError={Boolean(error)}
                errorText={error?.message}
                isRequired
              >
                <Input {...field} placeholder="000" type="text" />
              </FormControl>
            )}
          />
        </>
      )}

      {formType === TUserSecretType.SecureNote && (
        <Controller
          control={control}
          name="note"
          render={({ field, fieldState: { error } }) => (
            <FormControl
              label="Note"
              isError={Boolean(error)}
              errorText={error?.message}
              isRequired
            >
              <textarea
                placeholder="Enter sensitive data to share via a secure note..."
                {...field}
                className="h-40 min-h-[70px] w-full rounded-md border border-mineshaft-600 bg-mineshaft-900 py-1.5 px-2 text-bunker-300 outline-none transition-all placeholder:text-mineshaft-400 hover:border-primary-400/30 focus:border-primary-400/50 group-hover:mr-2"
              />
            </FormControl>
          )}
        />
      )}

      <Button
        className="mt-4"
        size="sm"
        type="submit"
        isLoading={isSubmitting}
        isDisabled={isSubmitting}
      >
        {editSecret ? "Update User Secret" : "Create User Secret"}
      </Button>
    </form>
  ) : (
    <>
      <div className="mr-2 flex items-center justify-end rounded-md bg-white/[0.05] p-2 text-base text-gray-400">
        <p className="mr-4 break-all">{secretLink}</p>
        <IconButton
          ariaLabel="copy icon"
          colorSchema="secondary"
          className="group relative ml-2"
          onClick={() => {
            navigator.clipboard.writeText(secretLink);
            setCopyTextSecret("Copied");
          }}
        >
          <FontAwesomeIcon icon={isCopyingSecret ? faCheck : faCopy} />
        </IconButton>
      </div>
      <Button
        className="mt-4 w-full bg-mineshaft-700 py-3 text-bunker-200"
        colorSchema="primary"
        variant="outline_bg"
        size="sm"
        onClick={() => setSecretLink("")}
        rightIcon={<FontAwesomeIcon icon={faRedo} className="pl-2" />}
      >
        Share Another Secret
      </Button>
    </>
  );
};
