import { renderHook } from '@testing-library/react'
import {
  useForm as useFormRhf,
  UseFormReturn as UseFormReturnRhf,
} from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useForm } from './useForm'

jest.mock('@hookform/resolvers/yup', () => ({
  yupResolver: jest.fn(),
}))

jest.mock('react-hook-form', () => ({
  useForm: jest.fn(),
}))

describe('useForm', () => {
  const schema = yup.object().shape({
    name: yup.string().required(),
  })

  const mockFormReturn: UseFormReturnRhf<any, any> = {
    register: jest.fn(),
    handleSubmit: jest.fn(),
    formState: { errors: {} } as any,
    // Add other necessary properties and methods here
  } as any

  beforeEach(() => {
    ;(yupResolver as jest.Mock).mockReturnValue(jest.fn())
    ;(useFormRhf as jest.Mock).mockReturnValue(mockFormReturn)
  })

  it('should call yupResolver with the correct schema and options', () => {
    const schemaOptions = { abortEarly: false }
    const resolverOptions = { mode: 'sync' as const }

    renderHook(() =>
      useForm({
        schema,
        schemaOptions,
        resolverOptions,
      }),
    )

    expect(yupResolver).toHaveBeenCalledWith(
      schema,
      schemaOptions,
      resolverOptions,
    )
  })

  it('should return the correct schema, context, and form', () => {
    const context = { someContext: true }

    const { result } = renderHook(() =>
      useForm({
        schema,
        context,
      }),
    )

    expect(result.current.schema).toBe(schema)
    expect(result.current.context).toBe(context)
    expect(result.current).toMatchObject(mockFormReturn)
  })

  it('should allow setting context as a function', () => {
    const contextFn = () => null

    const { result } = renderHook(() =>
      useForm({
        schema,
        context: contextFn,
      }),
    )

    expect(result.current.context).toBe(contextFn)
  })
})
