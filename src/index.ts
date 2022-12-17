

class Db<DB> {
    selectFrom<T extends keyof DB>(table: T): FromBuilder<DB, DB[T]> {
        return new FromBuilder<DB, DB[T]>(table as string)
    }
}

type JoinType = 'inner' | 'left' | 'right';

type JoinConfig = {
    joinType: JoinType;
    table: string;
    fromField: string;
    toField: string;
}

class FromBuilder<DB, T> {
    private readonly from: string;
    private joinConfigs: JoinConfig[] = [];

    constructor(from: string) {
        this.from = from;
    }


    private join(joinConfig: JoinConfig): void {
        this.joinConfigs.push(joinConfig);
    }

    innerJoin<R extends keyof DB>(table: R, fromField: keyof T, toField: keyof DB[R]): this {
        this.join({
            joinType: 'inner',
            table: table as string,
            fromField: fromField as string,
            toField: toField as string
        });
        return this;
    }

    select<J extends keyof DB>(select: (keyof DB[J])[]): SelectBuilder {
        return new SelectBuilder(this.from, select as string[]);
    }
}

class SelectBuilder {
    private from: string;
    private select: string[];

    constructor(from: string, select: string[]) {
        this.from = from;
        this.select = select;
    }

    build(): string {
        const selectFields = this.select.join(',');

        return `
            SELECT ${selectFields}
            FROM ${this.from}
        `
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
    .innerJoin('orders', 'userId', 'orderId')
    .select<'users' | 'orders'>();
console.log(query.build());