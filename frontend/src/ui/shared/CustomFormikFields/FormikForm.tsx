import { Form } from 'formik'

export function FormikForm({ children }) {
  return <Form className="rs-form rs-form-vertical rs-form-fixed-width">{children}</Form>
}
