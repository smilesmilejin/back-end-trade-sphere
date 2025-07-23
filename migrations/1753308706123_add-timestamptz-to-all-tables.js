/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  // Alter 'created_at' and 'updated_at' in user_profile to timestamptz
  pgm.alterColumn('user_profile', 'created_at', {
    type: 'timestamptz',
    notNull: true,
    default: pgm.func('current_timestamp'),
  });

  pgm.alterColumn('user_profile', 'updated_at', {
    type: 'timestamptz',
    notNull: true,
    default: pgm.func('current_timestamp'),
  });

  // Same for listing table
  pgm.alterColumn('listing', 'created_at', {
    type: 'timestamptz',
    notNull: true,
    default: pgm.func('current_timestamp'),
  });

  pgm.alterColumn('listing', 'updated_at', {
    type: 'timestamptz',
    notNull: true,
    default: pgm.func('current_timestamp'),
  });

  // Same for user_favorite_listing table
  pgm.alterColumn('user_favorite_listing', 'created_at', {
    type: 'timestamptz',
    notNull: true,
    default: pgm.func('current_timestamp'),
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
// export const down = (pgm) => {};

export const down = (pgm) => {
  // Roll back: change timestamptz back to timestamp without timezone

  pgm.alterColumn('user_profile', 'created_at', {
    type: 'timestamp',
    notNull: true,
    default: pgm.func('current_timestamp'),
  });

  pgm.alterColumn('user_profile', 'updated_at', {
    type: 'timestamp',
    notNull: true,
    default: pgm.func('current_timestamp'),
  });

  pgm.alterColumn('listing', 'created_at', {
    type: 'timestamp',
    notNull: true,
    default: pgm.func('current_timestamp'),
  });

  pgm.alterColumn('listing', 'updated_at', {
    type: 'timestamp',
    notNull: true,
    default: pgm.func('current_timestamp'),
  });

  pgm.alterColumn('user_favorite_listing', 'created_at', {
    type: 'timestamp',
    notNull: true,
    default: pgm.func('current_timestamp'),
  });
};