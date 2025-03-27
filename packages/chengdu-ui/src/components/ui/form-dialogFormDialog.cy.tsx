import React from "react";
import FormDialog from "./form-dialog";
import { useForm } from "react-hook-form";

describe("<FormDialog />", () => {
  it("renders", () => {
    type FormValues = { id: string, name: string };
    
    // Create a wrapper component that uses the hook
    function TestComponent() {
      const form = useForm<FormValues>({
        defaultValues: {
          id: '',
          name: '',
        },
      });
      const onSubmit = async (data: FormValues) => {};
      const onClose = () => {};

      return (
        <FormDialog
          isOpen={true}
          title="Test Form Dialog"
          form={form}
          onSubmit={onSubmit}
          onClose={onClose}
          isSubmitting={false}
        >
          <input
            type="hidden"
            {...form.register('id')}
          />
          <input
            placeholder="请输入"
            {...form.register('name')}
          />
          <div>Test Form Content</div>
        </FormDialog>
      );
    }

    // Mount the wrapper component instead
    cy.mount(
      <div className="bg-amber-100 min-h-screen p-4">
        <div className="bg-amber-300 h-10 rounded-t-lg shadow-md"></div>
        <div className="bg-white p-6 rounded-md shadow-lg">
          <TestComponent />
        </div>
        <div className="bg-amber-100 h-10 rounded-b-lg shadow-md"></div>
      </div>
    );
  });
});
