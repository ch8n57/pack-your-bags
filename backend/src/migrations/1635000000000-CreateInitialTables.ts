import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialTables1635000000000 implements MigrationInterface {
    name = 'CreateInitialTables1635000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "firstName" character varying NOT NULL,
                "lastName" character varying NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "phoneNumber" character varying NOT NULL,
                "role" character varying NOT NULL DEFAULT 'user',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);

        // Create travel packages table
        await queryRunner.query(`
            CREATE TABLE "travel_packages" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "destination" character varying NOT NULL,
                "description" text NOT NULL,
                "price" numeric(10,2) NOT NULL,
                "duration" integer NOT NULL,
                "maxTravelers" integer NOT NULL,
                "inclusions" text array NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_5c8e23d46cb023e9f308636df37" PRIMARY KEY ("id")
            )
        `);

        // Create bookings table
        await queryRunner.query(`
            CREATE TABLE "bookings" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "packageId" uuid NOT NULL,
                "startDate" TIMESTAMP NOT NULL,
                "numberOfPeople" integer NOT NULL,
                "totalPrice" numeric(10,2) NOT NULL,
                "status" character varying NOT NULL DEFAULT 'pending',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"),
                CONSTRAINT "FK_4f27a1b4a947788d3d2c394c7e5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_2e537d86a2c2b132e0f108f0f32" FOREIGN KEY ("packageId") REFERENCES "travel_packages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);

        // Create payments table
        await queryRunner.query(`
            CREATE TABLE "payments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "bookingId" uuid NOT NULL,
                "amount" numeric(10,2) NOT NULL,
                "status" character varying NOT NULL DEFAULT 'pending',
                "paymentMethod" character varying NOT NULL,
                "transactionId" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a72" PRIMARY KEY ("id"),
                CONSTRAINT "FK_89c389edd4654e5d8e9ace7d1d5" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);

        // Insert admin user
        await queryRunner.query(`
            INSERT INTO "users" ("firstName", "lastName", "email", "password", "phoneNumber", "role")
            VALUES ('Admin', 'User', 'admin@packyourbags.com', '$2a$10$rS.b3GKs6YzZm2bwx5NAouI8vHOK4mQm3q4q1m2ZH7mpIJ/EqD1S6', '0000000000', 'admin')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`DROP TABLE "travel_packages"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}