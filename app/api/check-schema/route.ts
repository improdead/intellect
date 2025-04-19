import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-auth";

export async function GET() {
  try {
    const supabase = createSupabaseAdmin();
    
    // Check if Supabase client is properly initialized
    if (!supabase) {
      return NextResponse.json({ error: "Supabase admin client is not initialized" }, { status: 500 });
    }
    
    // Get table information for subjects table
    const { data: tableInfo, error: tableError } = await supabase
      .from('subjects')
      .select('*')
      .limit(1);
      
    if (tableError) {
      return NextResponse.json({ 
        error: "Error fetching subjects table info", 
        details: tableError 
      }, { status: 500 });
    }
    
    // Get column information
    let columnInfo = {};
    if (tableInfo && tableInfo.length > 0) {
      const sampleRow = tableInfo[0];
      columnInfo = Object.keys(sampleRow).reduce((acc, key) => {
        acc[key] = {
          exists: true,
          type: typeof sampleRow[key],
          value: sampleRow[key] === null ? 'null' : 'has value'
        };
        return acc;
      }, {});
    }
    
    return NextResponse.json({
      status: "Database schema check",
      table: "subjects",
      exists: true,
      columns: columnInfo,
      sampleRowCount: tableInfo?.length || 0
    });
  } catch (err) {
    return NextResponse.json({ 
      error: "Exception in check-schema", 
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}
