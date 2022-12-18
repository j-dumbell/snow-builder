

type PrefixKeys<T, S extends string> = {
    [K in keyof T as `${S}_${string & K}`]: T[K]
};

type OmitNonStringKeys<T> = Omit<T, number | symbol>;

type JoinType = 'inner' | 'left' | 'right';

type JoinConfig = {
    joinType: JoinType;
    leftTable: string;
    rightTable: string;
    leftField: string;
    rightField: string;
}

type QueryConfig = {
    select: string[];
    from: string;
    joins: JoinConfig[];
    where?: string;
    groupBy: string[];
    having?: string;
}

class Builder {
    constructor(public queryConfig: QueryConfig) {}
}

const compile = (queryConfig: QueryConfig): string => {
    const { select, from, where, joins, groupBy, having } = queryConfig;

    const selectSql = select.join(',');
    const whereSql = where ? `WHERE ${where}` : '';
    const groupBySql = groupBy ? `GROUP BY ${groupBy}` : '';
    const havingSql = having ? `HAVING ${having}` : '';

    return `
        SELECT ${selectSql}
        FROM ${from}
        ${whereSql}
        ${groupBySql}
        ${havingSql}  
    `
}

class Db<DB> {
    selectFrom<T extends keyof DB>(table: T): FromBuilder<DB, DB[T]> {
        return new FromBuilder<DB, DB[T]>({from: table as string, groupBy: [], joins: [], select: []});
    }
}

class FromBuilder<DB, T> extends Builder {
    innerJoin<L extends keyof DB, R extends keyof DB>(leftTable: L, rightTable: R, leftField: keyof DB[L], rightField: keyof DB[R]): FromBuilder<DB,  T & DB[L] & DB[R]> {
        this.queryConfig.joins.push({
            joinType: 'inner',
            leftTable: leftTable as string,
            rightTable: rightTable as string,
            leftField: leftField as string,
            rightField: rightField as string,
        });
        return new FromBuilder<DB, T & DB[L] & DB[R]>(this.queryConfig);
    }

    select(...fields: (keyof T)[]): SelectBuilder<T> {
        return new SelectBuilder({...this.queryConfig, select: fields as string[]});
    }
}

class SelectBuilder<T> extends Builder {
    where(raw: string): WhereBuilder {
        return new WhereBuilder({...this.queryConfig, where: raw})
    }

    groupBy(...fields: (keyof T)[]): GroupByBuilder {
        return new GroupByBuilder({...this.queryConfig, groupBy: fields as string[]})
    }

    compile(): string {
        return compile(this.queryConfig);
    }
}

class WhereBuilder extends Builder {
    groupBy(...fields: string[]): GroupByBuilder {
        return new GroupByBuilder({...this.queryConfig, groupBy: fields})
    }

    compile(): string {
        return compile(this.queryConfig);
    }
}

class GroupByBuilder extends Builder {
    having(raw: string): HavingBuilder {
        return new HavingBuilder({...this.queryConfig, having: raw})
    }

    compile(): string {
        return compile(this.queryConfig);
    }
}

class HavingBuilder extends Builder {
    compile(): string {
        return compile(this.queryConfig);
    }
}


type Users = {
    userId: number;
    email: string;
    isVerified: boolean;
}

type Orders = {
    orderId: number;
    userId: number;
    orderDate: Date;
}

type AllTables = {
    users: Users;
    orders: Orders;
}

const db = new Db<AllTables>();

const query = db.selectFrom('users')
    .innerJoin('users', 'orders', 'userId', 'orderId')
    .select('userId', 'email')
    .groupBy('userId')
    .having('bas')
    .compile()

