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

  const FormProviderWithUseForm = ({
    schemaSyncMode,
    disableValidateOnSchemaSync,
    schema = testSchema,
    getValues,
    children,
    ...props
  }: Partial<FormProviderProps<any, any>> = {}) => {
    const methods = useForm({ schema, mode: 'onSubmit', ...props })
    return (
      <FormProvider
        {...methods}
        schemaSyncMode={schemaSyncMode}
        disableValidateOnSchemaSync={disableValidateOnSchemaSync}
        getValues={getValues || methods.getValues}
      >
        {children || <div>Child Component</div>}
      </FormProvider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('passes context values to child components', () => {
    const TestComponent = () => {
      const { schemaSyncMode, disableValidateOnSchemaSync } =
        React.useContext(ConfigsContext)
      return (
        <div>
          <span>{schemaSyncMode}</span>
          <span>{disableValidateOnSchemaSync.toString()}</span>
        </div>
      )
    }

    render(
      <FormProviderWithUseForm
        schemaSyncMode="onTouched"
        disableValidateOnSchemaSync={true}
        children={<TestComponent />}
      />,
    )

    expect(screen.getByText('onTouched')).toBeInTheDocument()
    expect(screen.getByText('true')).toBeInTheDocument()
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
})
