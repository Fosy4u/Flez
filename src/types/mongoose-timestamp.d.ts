declare module 'mongoose-timestamp' {
  import { Schema } from 'mongoose'

  const timestamp: (schema: Schema) => void
  export default timestamp
}
