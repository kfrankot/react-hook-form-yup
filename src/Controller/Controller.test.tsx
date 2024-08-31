import React from 'react'
import { render } from '@testing-library/react'
import { Controller } from './Controller'
import { useController } from '../useController'

// Mock the useController hook
jest.mock('../useController')

describe('Controller Component', () => {
  const mockUseController = useController as jest.MockedFunction<
    typeof useController
  >

  beforeEach(() => {
    mockUseController.mockClear()
  })

  it('should render correctly with the provided render prop', () => {
    const mockRender = jest.fn().mockReturnValue(<div>Mock Render</div>)
    mockUseController.mockReturnValue({
      field: {
        name: 'test',
        value: '',
        onChange: jest.fn(),
        onBlur: jest.fn(),
      } as any,
      fieldState: { invalid: false, isTouched: false, isDirty: false } as any,
      formState: {
        isSubmitted: false,
        isSubmitting: false,
        isSubmitSuccessful: false,
      } as any,
    } as any)

    const { getByText } = render(
      <Controller name="test" control={{} as any} render={mockRender} />,
    )

    expect(getByText('Mock Render')).toBeInTheDocument()
  })

  it('should call useController with the correct arguments', () => {
    const mockRender = jest.fn().mockReturnValue(<div>Mock Render</div>)
    const props = {
      name: 'test',
      control: {},
      render: mockRender,
    }

    render(<Controller {...(props as any)} />)

    expect(mockUseController).toHaveBeenCalledWith(props)
  })

  it('should pass the correct props to the render function', () => {
    const mockRender = jest.fn().mockReturnValue(<div>Mock Render</div>)
    const mockResults = {
      field: {
        name: 'test',
        value: '',
        onChange: jest.fn(),
        onBlur: jest.fn(),
      },
      fieldState: { invalid: false, isTouched: false, isDirty: false },
      formState: {
        isSubmitted: false,
        isSubmitting: false,
        isSubmitSuccessful: false,
      },
    }
    mockUseController.mockReturnValue(mockResults as any)

    render(<Controller name="test" control={{} as any} render={mockRender} />)

    expect(mockRender).toHaveBeenCalledWith(mockResults)
  })
})
