import React from 'react'
import { render, screen } from '@testing-library/react'
import { useFormContext } from 'react-hook-form'
import { ConfigsProvider, useConfigs, ConfigsContext } from './ConfigsProvider'

jest.mock('react-hook-form', () => ({
  useFormContext: jest.fn(),
}))

const mockUseFormContext = useFormContext as jest.Mock

describe('ConfigsProvider', () => {
  beforeEach(() => {
    mockUseFormContext.mockReturnValue({
      formState: {
        touchedFields: {},
        dirtyFields: {},
      },
      trigger: jest.fn().mockResolvedValue(true),
    })
  })

  it('provides default context values', () => {
    render(
      <ConfigsProvider schemaSyncMode="onBlur">
        <ConfigsContext.Consumer>
          {(value) => (
            <div>
              <span>{value.schemaSyncMode}</span>
              <span>{value.disableValidateOnSchemaSync.toString()}</span>
            </div>
          )}
        </ConfigsContext.Consumer>
      </ConfigsProvider>,
    )

    expect(screen.getByText('onBlur')).toBeInTheDocument()
    expect(screen.getByText('false')).toBeInTheDocument()
  })

  it('provides custom context values', () => {
    render(
      <ConfigsProvider
        schemaSyncMode="onChange"
        disableValidateOnSchemaSync={true}
      >
        <ConfigsContext.Consumer>
          {(value) => (
            <div>
              <span>{value.schemaSyncMode}</span>
              <span>{value.disableValidateOnSchemaSync.toString()}</span>
            </div>
          )}
        </ConfigsContext.Consumer>
      </ConfigsProvider>,
    )

    expect(screen.getByText('onChange') as HTMLElement).toBeInTheDocument()
    expect(screen.getByText('true')).toBeInTheDocument()
  })

  it('trigger function works correctly for onTouched', async () => {
    const triggerMock = jest.fn().mockResolvedValue(true)
    mockUseFormContext.mockReturnValue({
      formState: {
        touchedFields: { field1: true },
        dirtyFields: { field2: true },
      },
      trigger: triggerMock,
    })

    render(
      <ConfigsProvider schemaSyncMode="onTouched">
        <ConfigsContext.Consumer>
          {(value) => <button onClick={() => value.trigger()}>Trigger</button>}
        </ConfigsContext.Consumer>
      </ConfigsProvider>,
    )

    screen.getByText('Trigger').click()
    expect(triggerMock).toHaveBeenLastCalledWith(['field1', 'field2'])
  })

  it('trigger function works correctly for onChange', async () => {
    const triggerMock = jest.fn().mockResolvedValue(true)
    mockUseFormContext.mockReturnValue({
      formState: {
        touchedFields: { field1: true },
        dirtyFields: { field2: true },
      },
      trigger: triggerMock,
    })

    render(
      <ConfigsProvider schemaSyncMode="onChange">
        <ConfigsContext.Consumer>
          {(value) => <button onClick={() => value.trigger()}>Trigger</button>}
        </ConfigsContext.Consumer>
      </ConfigsProvider>,
    )

    screen.getByText('Trigger').click()
    expect(triggerMock).toHaveBeenLastCalledWith(['field2'])
  })

  it('trigger function works correctly for onBlur', async () => {
    const triggerMock = jest.fn().mockResolvedValue(true)
    mockUseFormContext.mockReturnValue({
      formState: {
        touchedFields: { field1: true },
        dirtyFields: { field2: true },
      },
      trigger: triggerMock,
    })

    render(
      <ConfigsProvider schemaSyncMode="onBlur">
        <ConfigsContext.Consumer>
          {(value) => <button onClick={() => value.trigger()}>Trigger</button>}
        </ConfigsContext.Consumer>
      </ConfigsProvider>,
    )

    screen.getByText('Trigger').click()
    expect(triggerMock).toHaveBeenLastCalledWith(['field1'])
  })
})

describe('useConfigs', () => {
  it('returns context values', () => {
    const TestComponent = () => {
      const { schemaSyncMode, disableValidateOnSchemaSync } = useConfigs()
      return (
        <div>
          <span>{schemaSyncMode}</span>
          <span>{disableValidateOnSchemaSync.toString()}</span>
        </div>
      )
    }

    render(
      <ConfigsProvider
        schemaSyncMode="onTouched"
        disableValidateOnSchemaSync={true}
      >
        <TestComponent />
      </ConfigsProvider>,
    )

    expect(screen.getByText('onTouched')).toBeInTheDocument()
    expect(screen.getByText('true')).toBeInTheDocument()
  })
})
