# react-hook-form-yup

Enhances the integration of `yup` schemas into `react-hook-form`.

## Description

This library provides the yup schema state for a field when using the `Controller` component or `useController` hook, so that validation rules can be displayed in the UI.

## Installation

To install the library:

```bash
npm install react-hook-form-yup
```

## Example

### Schema definition

```typescript
import * as yup from 'yup'

const schema = yup.object().shape({
  minSize: yup.number().moreThan(1).lessThan(yup.ref('maxSize')).required(),
  maxSize: yup.number().moreThan(yup.ref('minSize')).required(),
})
```

### Form setup

```tsx
import React from 'react'
import { useForm, FormProvider, useController, NumberSchemaState } from 'react-hook-form-yup'
import { schema } from './schema'

const NumberInput = (props: { name: string, type: string }) => {
  const { field, fieldState: { error }, schemaState } = useController<any, any, NumberSchemaState>(props.name)
  const { required, min, max, lessThan, moreThan } = schemaState
  const minMsg = min ? `Min ${min}` : moreThan ? `More than ${moreThan}` : ''
  const maxMsg = max ? `Max ${max}` : lessThan ? `Less than ${lessThan}` : ''
  const placeholder = [minMsg, maxMsg].filter(Boolean).join(' and ')

  return (
    <>
      <input
        {...field}
        style={{ display: 'block', width: 250 }}
        required={required}
        placeholder={placeholder}
      />
      {error && (<p style={{ color: 'red' }}>{error.message}</p>)}
    </p>
  )
}

const MyForm = () => {
  const props = useForm({ schema })

  return (
    <FormProvider {...props}>
      <NumberInput name="minSize" type="number" />
      <NumberInput name="maxSize" type="number" />
    </FormProvider>
  )
}

export default MyForm
```

### Controller component

The `Controller` component has been updated in the same way as the `useController` hook, with `schemaState` being included in the `render` function

## Customization

This library will try to keep the schema state and form validation aligned with the given form values. By default, the schema state for all fields will be updated on blur, so any refs or conditional validations can be shown in the UI. Additionally, unless the current validation mode is `onSubmit`, any field that had been previously qualified for validation will be revalidated to align with the schema state (dirty fields for `onChange`, touched fields for `onBlur`, both for `onTouched`). These behaviors can be overridden though.

### Schema sync mode

Set `schemaSyncMode` to change when the schema is synced with the form values. Can be `onBlur`, `onTouched`, `onChange`, `all`, or `false` to disable. Default is `onBlur` and is recommended for good performance

```tsx
<FormProvider schemaSyncMode="onChange" {...props} />
```

### Disable validate on schema sync

Set `disableValidateOnSchemaSync` to disable validation from occuring on schema sync.

```tsx
<FormProvider disableValidateOnSchemaSync {...props} />
```
