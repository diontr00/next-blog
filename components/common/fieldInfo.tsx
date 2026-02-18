import { XIcon } from "@/components/ui/x";
import { AnyFieldApi } from "@tanstack/react-form";

export function GeneralFieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched &&
      field.state.value &&
      !field.state.meta.isValid ? (
        <em className="text-red-400">
          {field.state.meta.errors.map((err) => err.message).join(",")}
        </em>
      ) : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
}

export function PassWordFieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched &&
      field.state.value &&
      !field.state.meta.isValid ? (
        <ul>
          {field.state.meta.errors.map((err) => (
            <li key={err.message} className="flex gap-2 text-red-400">
              <span>
                <XIcon />
              </span>
              <span>{err.message}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
}
