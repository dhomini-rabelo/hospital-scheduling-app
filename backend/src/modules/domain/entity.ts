import { randomUUID } from 'node:crypto'

export abstract class Entity<
  Props extends Record<string, unknown> = Record<string, unknown>,
> {
  private _id: string // To make simple let's only use the string instead of a ID class
  public props: Props

  get id() {
    return this._id
  }

  protected constructor(props: Props, id?: string) {
    this.props = props
    this._id = id ?? randomUUID()
  }

  public getProp(propName: string) {
    return {
      ...this.props,
      id: this._id,
    }[propName]
  }

  public isEqual(entity: Entity<Record<string, unknown>>) {
    return entity === this || entity.id === this._id
  }
}

export type EntityWithStatic<EntityClass extends Entity> = EntityClass & {
  create(props: EntityClass['props']): EntityClass
  reference(id: string, props: EntityClass['props']): EntityClass
}
