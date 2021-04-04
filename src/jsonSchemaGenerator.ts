import { StringMap, _assert, _by, _filterNullishValues } from '@naturalcycles/js-lib'
import { CommonObjectType, CommonType, CommonValidationTypeName, KnownTypes } from './model'

interface JsonSchemaType {
  $schema?: string
  $id?: string
  title?: string
  description?: string
  // $comment?: string
  type?: string | string[]
  nullable?: boolean

  // string
  pattern?: string

  // object
  properties?: Record<string, JsonSchemaType>
  required?: string[]
  additionalProperties?: boolean

  // Reference to other Type (to it's `$id`)
  $ref?: string

  // StringMap
  patternProperties?: Record<string, JsonSchemaType>
  propertyNames?: JsonSchemaType

  // array: JsonSchemaType
  // or tuple: JsonSchemaType[]
  items?: JsonSchemaType | JsonSchemaType[]
  minItems?: number
  maxItems?: number

  // union type
  oneOf?: JsonSchemaType[]
  allOf?: JsonSchemaType[]
  anyOf?: JsonSchemaType[]
  not?: JsonSchemaType

  // enum
  enum?: (string | number)[]
}

const validationNameMap: Partial<Record<CommonValidationTypeName, string>> = {
  integer: 'integer',
}

export function createJsonSchemas(types: CommonObjectType[]): JsonSchemaType[] {
  const typeMap = _by(types, t => t.name!)

  return types.map(t => {
    const s: JsonSchemaType = {
      // $schema: 'https://json-schema.org/draft/2020-12/schema',
      $schema: 'http://json-schema.org/draft-07/schema#',
      $id: `${t.name!}.schema.json`,
      ...commonTypeToJsonProperty(t, typeMap),
    }

    return s
  })
}

function commonTypeToJsonProperty(
  t: CommonType,
  typeMap: StringMap<CommonObjectType>,
  inline = false,
): JsonSchemaType {
  let s: CommonObjectType

  if (typeof t === 'string') {
    if (KnownTypes.has(t)) {
      s = {
        type: t,
      }
    } else {
      // Points to another interface!
      const type2 = typeMap[t]
      _assert(type2, `Unknown linked type: ${t}`)

      // Let's inline the linked type for now (recursive types won't work, obviously)
      // Nope, let's #ref the linked type instead!

      if (inline) {
        return commonTypeToJsonProperty(type2, typeMap)
      }

      return {
        $ref: `${type2.name}.schema.json`,
      }
    }
  } else {
    s = t
  }

  const p: JsonSchemaType = {
    type: validationNameMap[s.validationType!] || s.type,
    // nullable: s.required ? undefined : true,
    description: s.descr,
  }

  // Union type!
  if (Array.isArray(s.type)) {
    p.type = s.type.map(strType => commonTypeToJsonProperty(strType, typeMap).type as string)
  }

  if (s.type && !Array.isArray(s.type) && !KnownTypes.has(s.type)) {
    return commonTypeToJsonProperty(s.type, typeMap)
  }

  if (s.extends?.length) {
    s.extends
      .map(typeName => commonTypeToJsonProperty(typeName, typeMap, true))
      .forEach(baseType => {
        Object.assign(p, {
          ...baseType,
          properties: {
            ...p.properties,
            ...baseType.properties,
          },
          required: [...(p.required || []), ...(baseType.required || [])],
        })
      })
  }

  if (s.properties) {
    p.additionalProperties ||= s.additionalProperties || false
    p.properties ||= {}
    p.required ||= []

    s.properties.forEach(f => {
      p.properties![f.name!] = commonTypeToJsonProperty(f, typeMap)
      if (f.required) {
        p.required!.push(f.name!)
      }
    })

    if (!p.required.length) delete p.required
  } else if (s.type === 'StringMap' && s.stringMapOfType) {
    p.type = 'object'

    if (Array.isArray(s.stringMapOfType)) {
      p.patternProperties = {
        '.*': {
          oneOf: s.stringMapOfType.map(t => commonTypeToJsonProperty(t, typeMap)),
        },
      }
    } else {
      p.patternProperties = {
        '.*': commonTypeToJsonProperty(s.stringMapOfType, typeMap),
      }
    }
  } else if (s.arrayOfType) {
    if (Array.isArray(s.arrayOfType)) {
      // Array of Union type!
      p.items = {
        oneOf: s.arrayOfType.map(t => commonTypeToJsonProperty(t, typeMap)),
      }
    } else {
      // Array of non-Union type
      p.items = commonTypeToJsonProperty(s.arrayOfType, typeMap)
    }
  } else if (s.tupleTypes) {
    p.type = 'array'
    p.items = s.tupleTypes.map(t => commonTypeToJsonProperty(t, typeMap))
    p.minItems = s.tupleTypes.length
    p.maxItems = s.tupleTypes.length
  } else if (s.enumItems) {
    p.enum = s.enumItems.map(e => e.v)
    delete p.type
  }

  return _filterNullishValues(p)
}
