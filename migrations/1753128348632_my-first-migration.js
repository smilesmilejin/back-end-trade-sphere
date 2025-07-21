// /**
//  * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
//  */
// export const shorthands = undefined;

// /**
//  * @param pgm {import('node-pg-migrate').MigrationBuilder}
//  * @param run {() => void | undefined}
//  * @returns {Promise<void> | void}
//  */
// export const up = (pgm) => {};

// /**
//  * @param pgm {import('node-pg-migrate').MigrationBuilder}
//  * @param run {() => void | undefined}
//  * @returns {Promise<void> | void}
//  */
// export const down = (pgm) => {};


export const up = (pgm) => {
  // user_profile table
  pgm.createTable('user_profile', {
    user_id: {
      type: 'serial',
      primaryKey: true,
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
    },
    name: {
      type: 'varchar(255)',
    },
    address: {
      type: 'text',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // listing table
  pgm.createTable('listing', {
    listing_id: {
      type: 'serial',
      primaryKey: true,
    },
    user_id: {
      type: 'integer',
      notNull: true,
      references: 'user_profile(user_id)',
      onDelete: 'CASCADE', // # means if a user is deleted, all their listings are also deleted automatically.
    },
    name: {
      type: 'varchar(255)',
    },
    category: {
      type: 'varchar(100)',
    },
    description: {
      type: 'text',
    },
    price: {
      type: 'numeric(12,2)',
    },
    location: {
      type: 'varchar(255)',
    },
    contact_information: {
      type: 'varchar(255)',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    sold_status: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
  });

  // image table
  pgm.createTable('image', {
    image_id: {
      type: 'serial',
      primaryKey: true,
    },
    listing_id: {
      type: 'integer',
      notNull: true,
      references: 'listing(listing_id)', // This is a foreign key referencing the listing_id in the listing table.
      onDelete: 'CASCADE', // if a listing is deleted, all images associated with it are automatically deleted.
    },
    image_url: {
      type: 'text',
      notNull: true,
    },
  });

  // user_favorite_listing table
  pgm.createTable('user_favorite_listing', {
    user_id: {
      type: 'integer',
      notNull: true,
      references: 'user_profile(user_id)',
      onDelete: 'CASCADE', //  if a user is deleted, all their favorite listings entries get deleted automatically.
      primaryKey: true,
    },
    listing_id: {
      type: 'integer',
      notNull: true,
      references: 'listing(listing_id)',
      onDelete: 'CASCADE', //  if a listing is deleted, all favorites entries referencing it get deleted automatically.
      primaryKey: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

};

