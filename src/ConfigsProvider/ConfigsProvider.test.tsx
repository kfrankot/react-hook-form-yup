import React, { ReactNode } from 'react'
import { render, screen, renderHook } from '@testing-library/react'
import {
  FormProvider,
  FormProviderProps,
  useForm,
  useFormContext,
} from 'react-hook-form'
import {
  ConfigsProvider,
  useConfigs,
  ConfigsContext,
  ConfigsProviderProps,
} from './ConfigsProvider'
import * as yup from 'yup'
import { SchemaProvider } from 'yup-field-props-react'

jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useFormContext: jest.fn(),
}))

jest.mock('yup-field-props-react', () => ({
  SchemaProvider: jest.fn(({ children }) => <div>{children}</div>),
}))

const mockUseFormContext = useFormContext as jest.Mock

const testSchema = yup.object().shape({
  name: yup.string().required(),
})

const ChildComponent = ({ children }: { children: ReactNode }) => {
  const { schemaSyncMode, disableValidateOnSchemaSync } =
    React.useContext(ConfigsContext)
  return (
    <div>
      <span data-testid="schema-sync-mode">{schemaSyncMode}</span>
      <span data-testid="disable-validate-on-schema-sync">
        {disableValidateOnSchemaSync.toString()}
      </span>
      {children}
    </div>
  )
}

const ConfigsProviderWithUseForm = ({
  schemaSyncMode,
  disableValidateOnSchemaSync,
  schema = testSchema,
  ...props
}: Partial<FormProviderProps> & Partial<ConfigsProviderProps> = {}) => {
  const methods = useForm({ mode: 'onSubmit' })
  return (
    <FormProvider {...methods} {...props}>
      <ConfigsProvider
        schema={schema}
        schemaSyncMode={schemaSyncMode}
        disableValidateOnSchemaSync={disableValidateOnSchemaSync}
      >
        {<ChildComponent>{props.children}</ChildComponent>}
      </ConfigsProvider>
    </FormProvider>
  )
}

const defaultUseFormContext = () => ({
  formState: {
    touchedFields: {},
    dirtyFields: {},
    submitCount: 0,
  },
  trigger: jest.fn().mockResolvedValue(true),
  control: { _options: { mode: 'onSubmit', context: {} } },
  getValues: () => ({ name: '' }),
})

describe('ConfigsProvider', () => {
  beforeEach(() => {
    mockUseFormContext.mockReturnValue(defaultUseFormContext())
  })

  it('passes correct props to SchemaProvider', () => {
    const context = defaultUseFormContext()
    mockUseFormContext.mockReturnValue(context)
    render(<ConfigsProviderWithUseForm />)

    expect(SchemaProvider).toHaveBeenLastCalledWith(
      expect.objectContaining({
        schema: testSchema,
        values: context.getValues,
      }),
      {},
    )
  })

  it('should set correct defaults for submitCount equal to 0', () => {
    mockUseFormContext.mockReturnValue({
      ...defaultUseFormContext(),
      formState: {
        ...defaultUseFormContext().formState,
        submitCount: 0,
      } as any,
    })
    render(<ConfigsProviderWithUseForm />)

    expect(
      screen.getByTestId('disable-validate-on-schema-sync').textContent,
    ).toBe('true')
  })

  it('should set correct defaults for submitCount greater than 0', () => {
    mockUseFormContext.mockReturnValue({
      ...defaultUseFormContext(),
      formState: {
        ...defaultUseFormContext().formState,
        submitCount: 1,
      } as any,
    })
    render(<ConfigsProviderWithUseForm />)

    expect(
      screen.getByTestId('disable-validate-on-schema-sync').textContent,
    ).toBe('false')
  })

  it('provides default context values', () => {
    render(<ConfigsProviderWithUseForm />)

    expect(screen.getByText('onBlur')).toBeInTheDocument()
    expect(screen.getByText('true')).toBeInTheDocument()
  })

  it('provides default context values when not mode onSubmit', () => {
    mockUseFormContext.mockReturnValue({
      ...defaultUseFormContext(),
      control: {
        _options: {
          ...defaultUseFormContext().control._options,
          mode: 'onBlur',
        },
      },
    })
    render(<ConfigsProviderWithUseForm />)

    expect(screen.getByText('onBlur')).toBeInTheDocument()
    expect(screen.getByText('false')).toBeInTheDocument()
  })

  it('provides custom context values', () => {
    render(
      <ConfigsProviderWithUseForm
        schemaSyncMode="onChange"
        disableValidateOnSchemaSync={false}
      />,
    )

    expect(screen.getByText('onChange') as HTMLElement).toBeInTheDocument()
    expect(screen.getByText('false')).toBeInTheDocument()
  })

  it('trigger function works correctly for onTouched', async () => {
    const triggerMock = jest.fn().mockResolvedValue(true)
    mockUseFormContext.mockReturnValue({
      ...defaultUseFormContext(),
      formState: {
        touchedFields: { field1: true },
        dirtyFields: { field2: true },
      },
      trigger: triggerMock,
    })

    render(
      <ConfigsProviderWithUseForm schemaSyncMode="onTouched">
        <ConfigsContext.Consumer>
          {(value) => <button onClick={() => value.trigger()}>Trigger</button>}
        </ConfigsContext.Consumer>
      </ConfigsProviderWithUseForm>,
    )

    screen.getByText('Trigger').click()
    expect(triggerMock).toHaveBeenLastCalledWith(['field1', 'field2'])
  })

  it('trigger function works correctly for onChange', async () => {
    const triggerMock = jest.fn().mockResolvedValue(true)
    mockUseFormContext.mockReturnValue({
      ...defaultUseFormContext(),
      formState: {
        touchedFields: { field1: true },
        dirtyFields: { field2: true },
      },
      trigger: triggerMock,
    })

    render(
      <ConfigsProviderWithUseForm schemaSyncMode="onChange">
        <ConfigsContext.Consumer>
          {(value) => <button onClick={() => value.trigger()}>Trigger</button>}
        </ConfigsContext.Consumer>
      </ConfigsProviderWithUseForm>,
    )

    screen.getByText('Trigger').click()
    expect(triggerMock).toHaveBeenLastCalledWith(['field2'])
  })

  it('trigger function works correctly for onBlur', async () => {
    const triggerMock = jest.fn().mockResolvedValue(true)
    mockUseFormContext.mockReturnValue({
      ...defaultUseFormContext(),
      formState: {
        touchedFields: { field1: true },
        dirtyFields: { field2: true },
      },
      trigger: triggerMock,
    })

    render(
      <ConfigsProviderWithUseForm schemaSyncMode="onBlur">
        <ConfigsContext.Consumer>
          {(value) => <button onClick={() => value.trigger()}>Trigger</button>}
        </ConfigsContext.Consumer>
      </ConfigsProviderWithUseForm>,
    )

    screen.getByText('Trigger').click()
    expect(triggerMock).toHaveBeenLastCalledWith(['field1'])
  })
})

describe('useConfigs', () => {
  it('returns context values', () => {
    const { result } = renderHook(() => useConfigs(), {
      wrapper: ({ children }) => (
        <ConfigsProviderWithUseForm
          schemaSyncMode="onTouched"
          disableValidateOnSchemaSync={true}
        >
          {children}
        </ConfigsProviderWithUseForm>
      ),
    })

    expect(result.current.schemaSyncMode).toBe('onTouched')
    expect(result.current.disableValidateOnSchemaSync).toBe(true)
    expect(result.current.trigger).toBeInstanceOf(Function)
  })
})
