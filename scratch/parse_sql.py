import os
import re

def parse_sql_to_ts(sql_content):
    tables = []
    pattern = re.compile(r"CREATE TABLE IF NOT EXISTS public\.([a-zA-Z_]+)\s*\((.*?)\);", re.IGNORECASE | re.DOTALL)
    matches = pattern.finditer(sql_content)
    
    for match in matches:
        table_name = match.group(1)
        columns_str = match.group(2)
        
        columns = []
        for line in columns_str.split('\n'):
            line = line.strip()
            if not line or line.startswith('--') or line.startswith('PRIMARY KEY') or line.startswith('FOREIGN KEY') or line.startswith('UNIQUE') or line.startswith('CHECK'):
                continue
            
            parts = line.split()
            if len(parts) < 2:
                continue
                
            col_name = parts[0].strip(',')
            col_type = parts[1].upper().strip(',')
            
            is_nullable = True
            if "NOT NULL" in line.upper() and "PRIMARY KEY" not in line.upper():
                is_nullable = False
            if "PRIMARY KEY" in line.upper():
                is_nullable = False
                
            ts_type = "string"
            if col_type in ["INTEGER", "BIGINT", "SMALLINT", "NUMERIC", "DECIMAL", "REAL", "DOUBLE"]:
                ts_type = "number"
            elif col_type in ["BOOLEAN"]:
                ts_type = "boolean"
            elif col_type in ["JSON", "JSONB"]:
                ts_type = "Json"
                
            columns.append({
                "name": col_name,
                "type": ts_type,
                "nullable": is_nullable
            })
            
        tables.append({
            "name": table_name,
            "columns": columns
        })
        
    return tables

def generate_ts(tables):
    ts_code = ""
    for table in tables:
        ts_code += f"      {table['name']}: {{\n"
        ts_code += "        Row: {\n"
        for col in table['columns']:
            null_str = " | null" if col['nullable'] else ""
            ts_code += f"          {col['name']}: {col['type']}{null_str}\n"
        ts_code += "        }\n"
        ts_code += "        Insert: {\n"
        for col in table['columns']:
            null_str = " | null" if col['nullable'] else ""
            ts_code += f"          {col['name']}?: {col['type']}{null_str}\n"
        ts_code += "        }\n"
        ts_code += "        Update: {\n"
        for col in table['columns']:
            null_str = " | null" if col['nullable'] else ""
            ts_code += f"          {col['name']}?: {col['type']}{null_str}\n"
        ts_code += "        }\n"
        ts_code += "        Relationships: []\n"
        ts_code += "      }\n"
    return ts_code

if __name__ == "__main__":
    sql_files = [
        "supabase/migrations/010_motivation_engine.sql",
        "supabase/migrations/011_admin_os.sql",
        "supabase/migrations/012_academic_intelligence_studio.sql"
    ]
    
    all_sql = ""
    for f in sql_files:
        with open(f, 'r') as file:
            all_sql += file.read() + "\n"
            
    tables = parse_sql_to_ts(all_sql)
    generated_types = generate_ts(tables)
    
    # Inject into types/database.ts
    db_path = "types/database.ts"
    with open(db_path, 'r') as f:
        content = f.read()
        
    # The Tables block ends just before Views
    target_str = "    }\n    Views: {"
    target_index = content.find(target_str)
    
    if target_index != -1:
        # Insert generated_types right BEFORE the closing brace of Tables
        new_content = content[:target_index] + generated_types + target_str + content[target_index+len(target_str):]
        with open(db_path, 'w') as f:
            f.write(new_content)
        print("Successfully injected missing tables INSIDE the Tables block in types/database.ts")
    else:
        print("Error: Could not find target string in database.ts")
