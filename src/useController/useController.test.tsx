import React from 'react'
import { render, act, waitFor, fireEvent } from '@testing-library/react'
import { useForm } from '../useForm'
import { FormProvider, FormProviderProps } from '../FormProvider'
import { useController } from './useController'
import * as yup from 'yup'
import { Form, UseFormProps } from 'react-hook-form'

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  age: yup
    .string()
    .when(['name'], ([name], schema) =>
      name ? schema.required('Age is required') : schema,
    ),
})

type Props = Partial<
  FormProviderProps & {
    mode?: UseFormProps['mode']
    defaultValues: UseFormProps['defaultValues']
  }
>

const TestFormProvider = ({
  children,
  schemaSyncMode,
  disableValidateOnSchemaSync,
  mode,
  defaultValues,
  ...props
}: Props) => {
  const methods = useForm({ ...props, schema, mode, defaultValues })
  return (
    <FormProvider
      {...methods}
      schemaSyncMode={schemaSyncMode}
      disableValidateOnSchemaSync={disableValidateOnSchemaSync}
    >
      <Form onSubmit={() => null}>
        {children}
        <button type="submit" data-testid="form-submit">
          Submit
        </button>
      </Form>
    </FormProvider>
  )
}

const TestInput = ({ name }: { name: string }) => {
  const { field, fieldState, schemaState } = useController({ name })

  return (
    <>
      <input
        {...field}
        data-testid={field.name}
        required={schemaState.required}
      />
      {fieldState.error && (
        <span data-testid={`${field.name}-error`}>
          {fieldState.error.message}
        </span>
      )}
    </>
  )
}

const TestInputs = () => {
  return (
    <>
      <TestInput name="name" />
      <TestInput name="age" />
    </>
  )
}

const TestComponent = (props: Omit<Partial<Props>, 'children'>) => {
  return (
    <TestFormProvider {...props}>
      <TestInputs />
    </TestFormProvider>
  )
}

// TODO: These tests are not really complete, because we still need to test validation on a dirty field being triggered, but
// with the required test, if it started empty, and was filled and unfilled, it goes back to not dirty and doesn't trigger the validation

describe('useController', () => {
  it('passes schema state to input', () => {
    const { getByTestId } = render(<TestComponent />)
    expect(getByTestId('name')).toBeRequired()
    expect(getByTestId('age')).not.toBeRequired()
  })

  it('displays error message if input is invalid', async () => {
    const { getByTestId } = render(<TestComponent />)
    const submit = getByTestId('form-submit')
    act(() => {
      fireEvent.click(submit)
    })
    await waitFor(() => {
      expect(getByTestId('name-error')).toBeInTheDocument()
    })
  })

  it('updates schema state for other fields on change', async () => {
    const { getByTestId } = render(<TestComponent schemaSyncMode="onChange" />)
    const name = getByTestId('name')
    act(() => {
      fireEvent.input(name, { target: { value: 'John Doe' } })
    })
    await waitFor(() => {
      expect(getByTestId('age')).toBeRequired()
    })
  })

  it('updates schema state for other fields on blur', async () => {
    const { getByTestId } = render(<TestComponent />)
    const name = getByTestId('name')
    const age = getByTestId('age')
    act(() => {
      fireEvent.input(name, { target: { value: 'John Doe' } })
    })
    expect(age).not.toBeRequired()
    act(() => {
      fireEvent.blur(name)
    })
    await waitFor(() => {
      expect(age).toBeRequired()
    })
  })

  it('updates validation state for other fields on touched', async () => {
    const { getByTestId, queryByTestId } = render(
      <TestComponent mode="onTouched" schemaSyncMode="onTouched" />,
    )
    const name = getByTestId('name')
    const age = getByTestId('age')
    // Set age field dirty so re-validate should be applied
    act(() => {
      fireEvent.input(age, { target: { value: '1' } })
      fireEvent.blur(age)
    })
    act(() => {
      fireEvent.input(age, { target: { value: '' } })
      fireEvent.blur(age)
    })
    // trigger re-validate
    act(() => {
      fireEvent.input(name, { target: { value: 'John Doe' } })
    })
    await waitFor(() => {
      expect(queryByTestId('age-error')).not.toBeInTheDocument()
    })
    act(() => {
      fireEvent.blur(name)
    })
    await waitFor(() => {
      expect(getByTestId('age-error')).toBeInTheDocument()
    })
  })

  it('updates validation state for other fields on blur', async () => {
    const { getByTestId, queryByTestId } = render(
      <TestComponent mode="onBlur" schemaSyncMode="onTouched" />,
    )
    const name = getByTestId('name')
    const age = getByTestId('age')
    // Set age field dirty so re-validate should be applied
    act(() => {
      fireEvent.input(age, { target: { value: '1' } })
      fireEvent.blur(age)
    })
    act(() => {
      fireEvent.input(age, { target: { value: '' } })
      fireEvent.blur(age)
    })
    // trigger re-validate
    act(() => {
      fireEvent.input(name, { target: { value: 'John Doe' } })
    })
    await waitFor(() => {
      expect(queryByTestId('age-error')).not.toBeInTheDocument()
    })
    act(() => {
      fireEvent.blur(name)
    })
    await waitFor(() => {
      expect(getByTestId('age-error')).toBeInTheDocument()
    })
  })

  it('does not update validation state for other fields on change if disabled', async () => {
    const { getByTestId, queryByTestId } = render(
      <TestComponent mode="onChange" disableValidateOnSchemaSync />,
    )
    const name = getByTestId('name')
    act(() => {
      fireEvent.input(name, { target: { value: 'John Doe' } })
      fireEvent.blur(name)
    })
    await waitFor(() => {
      expect(queryByTestId('age-error')).not.toBeInTheDocument()
    })
  })

  it('does not update validation state for other fields on blur if disabled', async () => {
    const { getByTestId, queryByTestId } = render(
      <TestComponent mode="onBlur" disableValidateOnSchemaSync />,
    )
    const name = getByTestId('name')
    act(() => {
      fireEvent.input(name, { target: { value: 'John Doe' } })
      fireEvent.blur(name)
    })
    await waitFor(() => {
      expect(queryByTestId('age-error')).not.toBeInTheDocument()
    })
  })

  it('does not update schema state for other fields on change if disabled', async () => {
    const { getByTestId } = render(
      <TestComponent mode="onChange" schemaSyncMode={false} />,
    )
    const name = getByTestId('name')
    const age = getByTestId('age')
    act(() => {
      fireEvent.input(name, { target: { value: 'John Doe' } })
    })
    expect(age).not.toBeRequired()
  })
})
