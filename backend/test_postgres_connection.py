import sys
import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def setup_postgres(password: str, host: str = "localhost", port: int = 5432, user: str = "postgres", dbname: str = "revguard"):
    print(f"Connecting to PostgreSQL server at {host}:{port} as user '{user}'...")
    try:
        # Connect to default postgres DB
        conn = psycopg2.connect(
            dbname="postgres",
            user=user,
            password=password,
            host=host,
            port=port
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        print(" Connected to PostgreSQL successfully!")

        # Check if database 'revguard' exists
        cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{dbname}'")
        exists = cursor.fetchone()
        if not exists:
            print(f"Database '{dbname}' does not exist. Creating it now...")
            cursor.execute(f"CREATE DATABASE {dbname}")
            print(f" Database '{dbname}' created successfully!")
        else:
            print(f" Database '{dbname}' already exists.")

        cursor.close()
        conn.close()

        # Update .env file
        env_content = f"DATABASE_URL=postgresql://{user}:{password}@{host}:{port}/{dbname}\nPROJECT_NAME=REVGUARD\nSECRET_KEY=sox_audit_secret_key_revguard_2026\nDEBUG=True\n"
        with open(".env", "w") as f:
            f.write(env_content)
        print(" Updated .env file with active PostgreSQL connection string.")
        print("\nAll done! Start your backend with 'python backend/run_server.py' and your tables will be live in pgAdmin!")
        return True

    except psycopg2.OperationalError as e:
        print(f"\n Connection failed: {e}")
        print("Tip: Check your password in pgAdmin and try again with: python backend/test_postgres_connection.py <YOUR_PASSWORD>")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        pwd = sys.argv[1]
    else:
        pwd = input("Enter your postgres password (from pgAdmin installation): ")
    setup_postgres(pwd)
