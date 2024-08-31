import React from 'react'
import { render, screen } from '@testing-library/react'
import { SchemaProvider } from 'yup-field-props-react'
import { ConfigsContext } from '../ConfigsProvider'
import { FormProvider, FormProviderProps } from './FormProvider'
import * as yup from 'yup'
import { useForm } from '../useForm'

jest.mock('yup-field-props-react', () => ({
  SchemaProvider: jest.fn(({ children }) => <div>{children}</div>),
}))

describe('FormProvider', () => {
  const testSchema = yup.object().shape({
    name: yup.string().required(),
  })

  const ChildComponent = () => {
    const { schemaSyncMode, disableValidateOnSchemaSync } =
      React.useContext(ConfigsContext)
    return (
      <div>
        <span data-testid="schema-sync-mode">{schemaSyncMode}</span>
        <span data-testid="disable-validate-on-schema-sync">
          {disableValidateOnSchemaSync.toString()}
        </span>
      </div>
    )
  }

  const FormProviderWithUseForm = ({
    schemaSyncMode,
    disableValidateOnSchemaSync,
    schema = testSchema,
    getValues,
    formState,
    ...props
  }: Partial<FormProviderProps<any, any>> = {}) => {
    const methods = useForm({ schema, mode: 'onSubmit', ...props })
    return (
      <FormProvider
        {...methods}
        formState={{
          ...methods.formState,
          ...formState,
        }}
        schemaSyncMode={schemaSyncMode}
        disableValidateOnSchemaSync={disableValidateOnSchemaSync}
        getValues={getValues || methods.getValues}
      >
        {<ChildComponent />}
      </FormProvider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('passes context values to child components', () => {
    render(
      <FormProviderWithUseForm
        schemaSyncMode="onTouched"
        disableValidateOnSchemaSync={true}
      />,
    )

    expect(screen.getByTestId('schema-sync-mode').textContent).toBe('onTouched')
    expect(
      screen.getByTestId('disable-validate-on-schema-sync').textContent,
    ).toBe('true')
  })

  it('passes correct props to SchemaProvider', () => {
    const getValues = jest.fn()

    render(<FormProviderWithUseForm getValues={getValues} />)

    expect(SchemaProvider).toHaveBeenLastCalledWith(
      expect.objectContaining({
        schema: testSchema,
        values: getValues,
      }),
      {},
    )
  })

  it('should set correct defaults for submitCount equal to 0', () => {
    render(<FormProviderWithUseForm formState={{ submitCount: 0 } as any} />)

    expect(
      screen.getByTestId('disable-validate-on-schema-sync').textContent,
    ).toBe('true')
  })

  it('should set correct defaults for submitCount greater than 0', () => {
    render(<FormProviderWithUseForm formState={{ submitCount: 1 } as any} />)

    expect(
      screen.getByTestId('disable-validate-on-schema-sync').textContent,
    ).toBe('false')
  })
})
