"use client";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  GeneralFieldInfo,
  PassWordFieldInfo,
} from "@/components/common/fieldInfo";
import { EyeOffIcon } from "@/components/ui/eye-off";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useState } from "react";
import { EyeIcon } from "@/components/ui/eye";
import { Button } from "@/components/ui/button";
import { BanIcon } from "@/components/ui/ban";
import useSignUpForm from "./hooks/useSignInForm";
import { Loader2 } from "lucide-react";

export default function SignInForm() {
  const [showPw, setShowPw] = useState(false);

  const { form } = useSignUpForm();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field name="email">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Email:</FieldLabel>
            <Input
              aria-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
              id={field.name}
              name={field.name}
              type="email"
              placeholder="elonmusk@starlink.com"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <GeneralFieldInfo field={field} />
          </Field>
        )}
      </form.Field>

      <br />
      <form.Field name="password">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Password</FieldLabel>

            <InputGroup className="w-full">
              <InputGroupInput
                aria-invalid={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
                id={field.name}
                type={showPw ? "text" : "password"}
                name={field.name}
                placeholder="********"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />

              <InputGroupAddon align="inline-end">
                <button type="button">
                  {showPw ? (
                    <EyeOffIcon
                      className="mr-2"
                      size={15}
                      onClick={() => setShowPw(false)}
                    />
                  ) : (
                    <EyeIcon
                      className="mr-2"
                      size={15}
                      onClick={() => setShowPw(true)}
                    />
                  )}
                </button>
              </InputGroupAddon>
            </InputGroup>

            <PassWordFieldInfo field={field} />
          </Field>
        )}
      </form.Field>
      <br />
      <form.Subscribe
        selector={(state) => [
          state.canSubmit,
          state.isSubmitting,
          state.isDefaultValue,
          state.isPristine,
        ]}
      >
        {([canSubmit, isSubmitting, isDefaultValue, isPristine]) => (
          <Button
            type="submit"
            disabled={!canSubmit || isDefaultValue || isPristine}
            className={`w-full ${(!canSubmit || isPristine) && "cursor-not-allowed"}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : !canSubmit || isPristine ? (
              <BanIcon className="animate-bounce" />
            ) : (
              "Submit"
            )}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
