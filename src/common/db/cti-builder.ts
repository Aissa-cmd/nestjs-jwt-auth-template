import {
  DataSource,
  ObjectLiteral,
  EntityTarget,
  InsertQueryBuilder,
  UpdateQueryBuilder,
  FindOptionsWhere,
  DeleteQueryBuilder,
  QueryBuilder,
} from 'typeorm';

export interface CTEOptions {
  returning?: string[];
  // skipFields?: string[];
}

export interface CTERelation<T = any> {
  entity: EntityTarget<T>;
  data: Array<Partial<T>> | Partial<T>;
  relations: {
    relationFieldName: string;
    relationId: string;
    relationCteName: string;
  }[];
}

export type CTEQueryBuilderCallback = (
  qb: QueryBuilder<ObjectLiteral>,
) => QueryBuilder<ObjectLiteral>;

export class CTEQueryBuilder {
  private dataSource: DataSource;
  private cteQueries: string[] = [];
  private parameters: any[] = [];
  private parameterIndex = 1;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  createCTE<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    data: Partial<T>,
    cteName?: string,
    options: CTEOptions = {},
  ) {
    const metadata = this.dataSource.getMetadata(entity);
    const tableName = metadata.tableName;
    cteName = cteName || tableName;

    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .insert()
      .into(entity)
      .values(data) as InsertQueryBuilder<T>;

    const sqlAndParams = this.extractSQLAndParameters(queryBuilder);
    const returning = options.returning ? options.returning.join(', ') : '*';

    const cte = `${cteName} AS (${sqlAndParams.sql} RETURNING ${returning})`;

    this.parameters.push(...sqlAndParams.parameters);
    this.parameterIndex += sqlAndParams.parameters.length;

    this.cteQueries.push(cte);
    return this;
  }

  updateCTE<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    criteria: FindOptionsWhere<T>,
    data: Partial<T>,
    cteName?: string,
    options: CTEOptions = {},
  ) {
    const metadata = this.dataSource.getMetadata(entity);
    const tableName = metadata.tableName;
    cteName = cteName || tableName;

    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .update(entity)
      .where(criteria)
      .set(data) as UpdateQueryBuilder<T>;

    const sqlAndParams = this.extractSQLAndParameters(queryBuilder);
    const returning = options.returning ? options.returning.join(', ') : '*';

    const cte = `${cteName} AS (${sqlAndParams.sql} RETURNING ${returning})`;

    this.parameters.push(...sqlAndParams.parameters);
    this.parameterIndex += sqlAndParams.parameters.length;

    this.cteQueries.push(cte);
    return this;
  }

  builderCTE(
    callback: CTEQueryBuilderCallback,
    cteName?: string,
    options: CTEOptions = {},
  ) {
    const queryBuilder = this.dataSource.createQueryBuilder();
    const result = callback(queryBuilder);

    const sqlAndParams = this.extractSQLAndParameters(result);
    const returning = options.returning ? options.returning.join(', ') : '*';

    const cte = `${cteName} AS (${sqlAndParams.sql} RETURNING ${returning})`;

    this.parameters.push(...sqlAndParams.parameters);
    this.parameterIndex += sqlAndParams.parameters.length;

    this.cteQueries.push(cte);
    return this;
  }

  deleteCTE<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    criteria: FindOptionsWhere<T>,
    cteName?: string,
    options: CTEOptions = {},
  ) {
    const metadata = this.dataSource.getMetadata(entity);
    const tableName = metadata.tableName;
    cteName = cteName || tableName;

    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .delete()
      .from(entity)
      .where(criteria) as DeleteQueryBuilder<T>;

    const sqlAndParams = this.extractSQLAndParameters(queryBuilder);
    const returning = options.returning ? options.returning.join(', ') : '*';

    const cte = `${cteName} AS (${sqlAndParams.sql} RETURNING ${returning})`;

    this.parameters.push(...sqlAndParams.parameters);
    this.parameterIndex += sqlAndParams.parameters.length;

    this.cteQueries.push(cte);
    return this;
  }

  selectCTE(callback: CTEQueryBuilderCallback, cteName?: string) {
    const queryBuilder = this.dataSource.createQueryBuilder();
    const result = callback(queryBuilder);

    const sqlAndParams = this.extractSQLAndParameters(result);

    const cte = `${cteName} AS (${sqlAndParams.sql})`;

    this.parameters.push(...sqlAndParams.parameters);
    this.parameterIndex += sqlAndParams.parameters.length;

    this.cteQueries.push(cte);
    return this;
  }

  createRelatedCTE<T extends ObjectLiteral>(
    relation: CTERelation<T>,
    cteName?: string,
    options: CTEOptions = {},
  ) {
    const metadata = this.dataSource.getMetadata(relation.entity);
    const tableName = metadata.tableName;
    cteName = cteName || tableName;

    const relationData = Array.isArray(relation.data)
      ? relation.data
      : [relation.data];
    const dataWithRelation = relationData.map((item) => {
      const result = {
        ...item,
        ...relation.relations.reduce((acc, curr) => {
          acc[curr.relationFieldName] = {
            [curr.relationId]: () =>
              `(SELECT "${curr.relationId || 'id'}" FROM "${
                curr.relationCteName
              }")`,
          };
          return acc;
        }, {}),
      };
      return result;
    });

    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .insert()
      .into(relation.entity)
      .values(dataWithRelation) as InsertQueryBuilder<T>;

    const sqlAndParams = this.extractSQLAndParameters(queryBuilder);
    const returning = options.returning ? options.returning.join(', ') : '*';

    const cte = `${cteName} AS (${sqlAndParams.sql} RETURNING ${returning})`;

    this.parameters.push(...sqlAndParams.parameters);
    this.parameterIndex += sqlAndParams.parameters.length;

    this.cteQueries.push(cte);
    return this;
  }

  selectUnionCTE(callbacks: CTEQueryBuilderCallback[], cteName?: string) {
    const queryBuilders: QueryBuilder<ObjectLiteral>[] = callbacks.map(
      (callback) => {
        return callback(this.dataSource.createQueryBuilder());
      },
    );

    const sqlAndParams: {
      sql: string;
      parameters: any[];
    }[] = [];
    for (const queryBuilder of queryBuilders) {
      const result = this.extractSQLAndParameters(queryBuilder);
      this.parameters.push(...result.parameters);
      this.parameterIndex += result.parameters.length;
      sqlAndParams.push(result);
    }

    const cte = `${cteName} AS (${sqlAndParams
      .map((item) => item.sql)
      .join(' UNION ALL ')})`;

    this.cteQueries.push(cte);
    return this;
  }

  private extractSQLAndParameters(queryBuilder: QueryBuilder<any>) {
    const sql = queryBuilder.getQuery();
    const parameters = queryBuilder.getParameters();

    let modifiedSQL = sql;
    const orderedParameters: any[] = [];

    for (const [key, value] of Object.entries(parameters)) {
      const regex = new RegExp(`:${key}`);
      const paramIndex = parseInt(key.split('_').pop()) + this.parameterIndex;
      modifiedSQL = modifiedSQL.replace(regex, `$${paramIndex}`);
      orderedParameters.push(value);
    }

    return {
      sql: modifiedSQL,
      parameters: orderedParameters,
    };
  }

  async execute<T = any>(returnCTE?: string): Promise<T> {
    if (this.cteQueries.length === 0) {
      throw new Error('No CTEs defined');
    }

    const lastCTE =
      this.cteQueries[this.cteQueries.length - 1].split(' AS ')[0];
    const finalCTE = returnCTE || lastCTE;

    const query = `WITH ${this.cteQueries.join(
      ',\n',
    )} SELECT * FROM ${finalCTE}`;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await queryRunner.query(query, this.parameters);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  getQuery(): string {
    if (this.cteQueries.length === 0) {
      throw new Error('No CTEs defined');
    }

    const lastCTE =
      this.cteQueries[this.cteQueries.length - 1].split(' AS ')[0];
    return `WITH ${this.cteQueries.join(',\n')} SELECT * FROM ${lastCTE}`;
  }

  getParameters(): string[] {
    return this.parameters;
  }

  getQueryAndParameters() {
    return [this.getQuery(), this.getParameters()];
  }

  reset(): this {
    this.parameters = [];
    this.parameterIndex = 1;
    this.cteQueries = [];
    return this;
  }
}
