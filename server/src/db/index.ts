import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const databasePath = process.env.DATABASE_PATH ?? path.join(process.cwd(), 'data', 'kwachawise.sqlite');
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

class SqliteDatabase {
	private readonly database: DatabaseSync;

	constructor(filePath: string) {
		this.database = new DatabaseSync(filePath);
	}

	exec(sql: string): void {
		this.database.exec(sql);
	}

	pragma(sql: string): void {
		this.database.exec(`PRAGMA ${sql}`);
	}

	prepare(sql: string) {
		const statement = this.database.prepare(sql);
		return {
			run: (...params: unknown[]) => {
				statement.run(...(params as []));
				const meta = this.database.prepare('SELECT changes() AS changes, last_insert_rowid() AS lastInsertRowid').get() as {
					changes: number;
					lastInsertRowid: number;
				};
				return meta;
			},
			get: (...params: unknown[]) => statement.get(...(params as [])),
			all: (...params: unknown[]) => statement.all(...(params as []))
		};
	}

	transaction<T>(callback: () => T): T {
		this.database.exec('BEGIN');
		try {
			const result = callback();
			this.database.exec('COMMIT');
			return result;
		} catch (error) {
			this.database.exec('ROLLBACK');
			throw error;
		}
	}
}

export const db = new SqliteDatabase(databasePath);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');
