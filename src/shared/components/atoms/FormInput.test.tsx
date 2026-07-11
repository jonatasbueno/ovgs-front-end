import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { FormProvider, useForm } from "react-hook-form";
import { FormInput } from "./FormInput";

function Harness() {
  const form = useForm<{ nome: string }>({ defaultValues: { nome: "" } });
  return (
    <FormProvider {...form}>
      <FormInput name="nome" label="Nome" />
    </FormProvider>
  );
}

describe("FormInput", () => {
  it("renderiza label e aceita digitação", async () => {
    const usuario = userEvent.setup();
    render(<Harness />);

    const campo = screen.getByLabelText("Nome");
    await usuario.type(campo, "Teste");
    expect(campo).toHaveValue("Teste");
  });
});
