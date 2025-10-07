import { expect, describe, it } from '@jest/globals'
import { z } from 'zod'

import { toFormikValidationSchema } from '../toFormikValidationSchema'

describe('utils/toFormikValidationSchema()', () => {
  describe('Valid data', () => {
    it('should return empty object when data is valid', () => {
      // Given
      const schema = z.object({
        age: z.number(),
        name: z.string()
      })
      const validate = toFormikValidationSchema(schema)
      const values = { age: 30, name: 'John' }

      // When
      const result = validate(values)

      // Then
      expect(result).toEqual({})
    })
  })

  describe('Simple field validation', () => {
    it('should return error for invalid simple field', () => {
      // Given
      const schema = z.object({
        name: z.string().min(3, 'Name must be at least 3 characters')
      })
      const validate = toFormikValidationSchema(schema)
      const values = { name: 'Jo' }

      // When
      const result = validate(values)

      // Then
      expect(result).toEqual({
        name: 'Name must be at least 3 characters'
      })
    })

    it('should return error for required field', () => {
      // Given
      const schema = z.object({
        email: z.string()
      })
      const validate = toFormikValidationSchema(schema)
      const values = {}

      // When
      const result = validate(values)

      // Then
      expect(result.email).toBeDefined()
      expect(typeof result.email).toBe('string')
    })

    it('should return default error message when no custom message provided', () => {
      // Given
      const schema = z.object({
        age: z.number()
      })
      const validate = toFormikValidationSchema(schema)
      const values = { age: 'not a number' }

      // When
      const result = validate(values)

      // Then
      expect(result.age).toBeDefined()
      expect(typeof result.age).toBe('string')
    })
  })

  describe('Nested object validation', () => {
    it('should return nested error structure for nested object fields', () => {
      // Given
      const schema = z.object({
        user: z.object({
          email: z.string().email('Invalid email'),
          name: z.string().min(3, 'Name too short')
        })
      })
      const validate = toFormikValidationSchema(schema)
      const values = {
        user: {
          email: 'invalid',
          name: 'Jo'
        }
      }

      // When
      const result = validate(values)

      // Then
      expect(result).toEqual({
        user: {
          email: 'Invalid email',
          name: 'Name too short'
        }
      })
    })

    it('should handle deeply nested object fields', () => {
      // Given
      const schema = z.object({
        company: z.object({
          address: z.object({
            street: z.string().min(1, 'Street is required')
          })
        })
      })
      const validate = toFormikValidationSchema(schema)
      const values = {
        company: {
          address: {
            street: ''
          }
        }
      }

      // When
      const result = validate(values)

      // Then
      expect(result).toEqual({
        company: {
          address: {
            street: 'Street is required'
          }
        }
      })
    })
  })

  describe('Array validation', () => {
    it('should return error for array field with index', () => {
      // Given
      const schema = z.object({
        items: z.array(
          z.object({
            name: z.string().min(3, 'Item name too short')
          })
        )
      })
      const validate = toFormikValidationSchema(schema)
      const values = {
        items: [{ name: 'Okay' }, { name: 'Jo' }, { name: 'Valid' }]
      }

      // When
      const result = validate(values)

      // Then
      expect(result).toEqual({
        items: {
          1: {
            name: 'Item name too short'
          }
        }
      })
    })

    it('should handle multiple array errors', () => {
      // Given
      const schema = z.object({
        items: z.array(
          z.object({
            name: z.string().min(3, 'Name too short')
          })
        )
      })
      const validate = toFormikValidationSchema(schema)
      const values = {
        items: [{ name: 'Jo' }, { name: 'Ab' }]
      }

      // When
      const result = validate(values)

      // Then
      expect(result).toEqual({
        items: {
          0: {
            name: 'Name too short'
          },
          1: {
            name: 'Name too short'
          }
        }
      })
    })
  })

  describe('Multiple errors merging', () => {
    it('should merge multiple field errors', () => {
      // Given
      const schema = z.object({
        age: z.number().min(18, 'Must be 18+'),
        email: z.string().email('Invalid email'),
        name: z.string().min(3, 'Name too short')
      })
      const validate = toFormikValidationSchema(schema)
      const values = {
        age: 15,
        email: 'invalid',
        name: 'Jo'
      }

      // When
      const result = validate(values)

      // Then
      expect(result).toEqual({
        age: 'Must be 18+',
        email: 'Invalid email',
        name: 'Name too short'
      })
    })

    it('should merge nested and flat errors', () => {
      // Given
      const schema = z.object({
        address: z.object({
          city: z.string().min(1, 'City required')
        }),
        name: z.string().min(3, 'Name too short')
      })
      const validate = toFormikValidationSchema(schema)
      const values = {
        address: {
          city: ''
        },
        name: 'Jo'
      }

      // When
      const result = validate(values)

      // Then
      expect(result).toEqual({
        address: {
          city: 'City required'
        },
        name: 'Name too short'
      })
    })
  })

  describe('Complex schemas', () => {
    it('should handle mixed nested objects and arrays', () => {
      // Given
      const schema = z.object({
        users: z.array(
          z.object({
            profile: z.object({
              name: z.string().min(3, 'Name too short')
            })
          })
        )
      })
      const validate = toFormikValidationSchema(schema)
      const values = {
        users: [{ profile: { name: 'Jo' } }, { profile: { name: 'Valid Name' } }]
      }

      // When
      const result = validate(values)

      // Then
      expect(result).toEqual({
        users: {
          0: {
            profile: {
              name: 'Name too short'
            }
          }
        }
      })
    })

    it('should handle union types', () => {
      // Given
      const schema = z.object({
        value: z.union([z.string(), z.number()])
      })
      const validate = toFormikValidationSchema(schema)
      const values = { value: null }

      // When
      const result = validate(values)

      // Then
      expect(result.value).toBeDefined()
      expect(typeof result.value).toBe('string')
    })

    it('should handle optional fields correctly', () => {
      // Given
      const schema = z.object({
        optional: z.string().optional(),
        required: z.string().min(1, 'Required field')
      })
      const validate = toFormikValidationSchema(schema)
      const values = { required: '' }

      // When
      const result = validate(values)

      // Then
      expect(result).toEqual({
        required: 'Required field'
      })
    })
  })

  describe('Custom params', () => {
    it('should pass params to safeParse', () => {
      // Given
      const schema = z.object({
        name: z.string()
      })
      const validate = toFormikValidationSchema(schema, { path: ['custom'] })
      const values = { name: 123 }

      // When
      const result = validate(values)

      // Then
      expect(result).toBeDefined()
      expect(Object.keys(result).length).toBeGreaterThan(0)
    })
  })
})
